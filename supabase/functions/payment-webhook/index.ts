// ============================================================
//  payment-webhook — Supabase Edge Function  (Deno runtime)
//
//  PROPÓSITO
//    Recibe notificaciones IPN de Mercado Pago cuando el estado
//    de un pago cambia y aplica la lógica de negocio correspondiente:
//      • approved  → marca pago como 'paid', renueva membresía del socio,
//                    inserta fila en ventas.
//      • rejected/cancelled → marca como 'failed'.
//      • refunded/charged_back → marca como 'refunded'.
//
//  SECRETS REQUERIDOS (Dashboard Supabase → Edge Functions → Secrets)
//    MP_ACCESS_TOKEN           Token de Mercado Pago (test o prod)
//    MP_WEBHOOK_SECRET         Secret para verificar firma x-signature
//    SUPABASE_URL              URL del proyecto (https://xxx.supabase.co)
//    SUPABASE_SERVICE_ROLE_KEY Service role key — salta RLS
//
//  URL A REGISTRAR EN MERCADO PAGO
//    Dashboard MP → Tu app → Webhooks → Eventos: payment
//    URL: https://<proyecto>.supabase.co/functions/v1/payment-webhook
//
//  NOTA DE SEGURIDAD
//    verify_jwt = false en config.toml (MP llama sin token JWT).
//    La autenticación real es via firma HMAC-SHA256 del header x-signature.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// crypto.subtle está disponible de forma nativa en el runtime de Deno/V8 —
// no requiere ningún import externo.

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface MPNotification {
  id: number;
  live_mode: boolean;
  type: string;        // "payment"
  action: string;      // "payment.created" | "payment.updated"
  data: { id: string };
}

interface PagoRow {
  id: string;
  estado: string;
  socio_id: number | null;
  plan_id: number | null;
  monto: number;
}

// ─── Mapeo de estados MP → Nexus-Q ───────────────────────────────────────────

const MP_STATUS_MAP: Record<string, string> = {
  approved:     'paid',
  rejected:     'failed',
  cancelled:    'failed',
  refunded:     'refunded',
  charged_back: 'refunded',
  pending:      'pending',
  in_process:   'pending',
  authorized:   'pending',
};

// ─── Helpers de dominio ──────────────────────────────────────────────────────

/**
 * Convierte el campo `duracion` del plan (ej. "3 Meses") a días numéricos.
 * Espeja exactamente la lógica de getDiasByDuracion en GymContext.jsx.
 */
function getDiasByDuracion(duracion: string | null | undefined): number {
  const d = String(duracion ?? '').toLowerCase();
  if (d.includes('12') || d.includes('anual') || d.includes('año')) return 360;
  if (d.includes('6'))  return 180;
  if (d.includes('3'))  return 90;
  return 30; // default: mensual
}

/**
 * Devuelve YYYY-MM-DD para hoy + N días, teniendo en cuenta
 * si la membresía actual ya está vigente (extiende desde fecha_venc).
 */
function calcNuevaFechaVenc(dias: number, fechaVencActual?: string | null): string {
  // Si el socio tiene membresía vigente, extender desde su vencimiento actual
  const base = fechaVencActual ? new Date(fechaVencActual) : new Date();
  if (isNaN(base.getTime()) || base < new Date()) {
    // Membresía ya vencida → extender desde hoy
    base.setTime(Date.now());
  }
  base.setDate(base.getDate() + dias);
  return base.toISOString().split('T')[0];
}

/**
 * Consulta la tabla `planes` para obtener la duración en días.
 * Si no encuentra el plan o hay error, devuelve 30 días por defecto.
 */
async function getDiasByPlanId(
  supabase: ReturnType<typeof createClient>,
  planId: number | null
): Promise<number> {
  if (!planId) return 30;

  const { data, error } = await supabase
    .from('planes')
    .select('duracion')
    .eq('id', planId)
    .single();

  if (error || !data) {
    console.warn(`[payment-webhook] Plan ${planId} no encontrado — usando 30 días`);
    return 30;
  }

  return getDiasByDuracion(data.duracion);
}

// ─── Verificación de firma HMAC-SHA256 de Mercado Pago ───────────────────────
//
//  MP envía: x-signature: ts=<timestamp>,v1=<hash>
//  Manifest: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
//  Docs: https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks

async function verifyMPSignature(
  req: Request,
  rawBody: string,
  secret: string
): Promise<boolean> {
  try {
    const xSignature = req.headers.get('x-signature') ?? '';
    const xRequestId = req.headers.get('x-request-id') ?? '';
    const dataId     = JSON.parse(rawBody)?.data?.id ?? '';

    // Parsear "ts=<timestamp>,v1=<hash>" del header x-signature
    const parts: Record<string, string> = {};
    xSignature.split(',').forEach((part) => {
      const [k, v] = part.split('=');
      if (k && v) parts[k.trim()] = v.trim();
    });

    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    // Manifest que Mercado Pago usa para firmar
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // ── HMAC-SHA256 con Web Crypto API nativa (sin dependencias externas) ──
    const enc     = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(manifest));

    // Convertir ArrayBuffer a string hexadecimal
    const computed = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return computed === v1;
  } catch {
    return false;
  }
}

// ─── Handler principal ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const rawBody = await req.text();

  try {
    // ── 1. Variables de entorno ──────────────────────────────────────────────
    const MP_ACCESS_TOKEN           = Deno.env.get('MP_ACCESS_TOKEN') ?? '';
    const MP_WEBHOOK_SECRET         = Deno.env.get('MP_WEBHOOK_SECRET') ?? '';
    const SUPABASE_URL              = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[payment-webhook] Variables de entorno incompletas');
      return new Response('Configuration error', { status: 500 });
    }

    // ── 2. Verificar firma HMAC (si el secret está configurado) ──────────────
    //    En ambiente de test MP no siempre envía firma, por eso es opcional.
    if (MP_WEBHOOK_SECRET) {
      const valid = await verifyMPSignature(req, rawBody, MP_WEBHOOK_SECRET);
      if (!valid) {
        console.warn('[payment-webhook] Firma HMAC inválida — request rechazado');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // ── 3. Parsear notificación ──────────────────────────────────────────────
    const notification: MPNotification = JSON.parse(rawBody);

    // Ignorar eventos que no sean de pagos
    if (notification.type !== 'payment') {
      console.log(`[payment-webhook] Evento ignorado: type=${notification.type}`);
      return new Response('Ignored (non-payment event)', { status: 200 });
    }

    const mpPaymentId = notification.data?.id;
    if (!mpPaymentId) {
      return new Response('Bad Request: missing data.id', { status: 400 });
    }

    // ── 4. Consultar estado REAL del pago a la API de MP ─────────────────────
    //    Nunca confiar en el payload del webhook — siempre verificar contra la API
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpPaymentId}`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
    );

    if (!mpRes.ok) {
      console.error(`[payment-webhook] MP API error para pago ${mpPaymentId}: ${mpRes.status}`);
      return new Response('MP API error', { status: 502 });
    }

    const mpPayment = await mpRes.json();
    // external_reference almacena el UUID de public.pagos (seteado en create-checkout)
    const pagoIdBD   = mpPayment.external_reference as string;
    const mpStatus   = mpPayment.status as string;
    const estadoNexus = MP_STATUS_MAP[mpStatus] ?? 'pending';

    console.log(`[payment-webhook] Pago MP ${mpPaymentId} — estado: ${mpStatus} → ${estadoNexus}`);

    // ── 5. Cliente Supabase con service role (salta RLS) ─────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── 6. Idempotencia: evitar procesar el mismo pago dos veces ─────────────
    if (!pagoIdBD) {
      console.warn(`[payment-webhook] external_reference vacío para pago MP ${mpPaymentId}`);
      // Aun así retornamos 200 para que MP no reintente indefinidamente
      return new Response('Missing external_reference', { status: 200 });
    }

    const { data: pagoExistente, error: pagoError } = await supabase
      .from('pagos')
      .select('id, estado, socio_id, plan_id, monto')
      .eq('id', pagoIdBD)
      .single<PagoRow>();

    if (pagoError || !pagoExistente) {
      console.warn(`[payment-webhook] Pago ${pagoIdBD} no encontrado en BD`);
      return new Response('Pago no encontrado', { status: 200 });
    }

    if (pagoExistente.estado === 'paid') {
      console.log(`[payment-webhook] Pago ${pagoIdBD} ya procesado — idempotencia OK`);
      return new Response('Already processed', { status: 200 });
    }

    // ── 7. Actualizar tabla `pagos` con el estado real ───────────────────────
    await supabase
      .from('pagos')
      .update({
        estado:              estadoNexus,
        provider_payment_id: String(mpPaymentId),
        provider_payload:    mpPayment,
        updated_at:          new Date().toISOString(),
      })
      .eq('id', pagoIdBD);

    // ── 8. Acciones de negocio según estado ──────────────────────────────────

    if (estadoNexus === 'paid') {
      // ── 8a. Determinar cuántos días agrega este plan ─────────────────────
      const diasPlan = await getDiasByPlanId(supabase, pagoExistente.plan_id);

      // ── 8b. Leer fecha_venc actual del socio (para extender si está vigente)
      let fechaVencActual: string | null = null;
      if (pagoExistente.socio_id) {
        const { data: socioData } = await supabase
          .from('socios')
          .select('fecha_venc')
          .eq('id', pagoExistente.socio_id)
          .single();
        fechaVencActual = socioData?.fecha_venc ?? null;
      }

      // ── 8c. Calcular nueva fecha de vencimiento ───────────────────────────
      const nuevaFechaVenc = calcNuevaFechaVenc(diasPlan, fechaVencActual);

      // ── 8d. Actualizar tabla `socios` ─────────────────────────────────────
      if (pagoExistente.socio_id) {
        const { error: socioError } = await supabase
          .from('socios')
          .update({
            estado:     'Activo',
            fecha_venc: nuevaFechaVenc,
            dias:       diasPlan,
          })
          .eq('id', pagoExistente.socio_id);

        if (socioError) {
          console.error(`[payment-webhook] Error actualizando socio ${pagoExistente.socio_id}:`, socioError.message);
        } else {
          console.log(
            `[payment-webhook] Socio ${pagoExistente.socio_id} renovado — ` +
            `nueva fecha_venc: ${nuevaFechaVenc} (+${diasPlan} días)`
          );
        }
      }

      // ── 8e. Registrar ingreso en tabla `ventas` ───────────────────────────
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          concepto:  `Membresía vía Mercado Pago — pago #${mpPaymentId}`,
          monto:     pagoExistente.monto,
          tipo:      'ingreso',
          metodo:    'Mercado Pago',
          origen:    'mercadopago',
          socio_id:  pagoExistente.socio_id ?? null,
          pago_id:   pagoIdBD,
        }]);

      if (ventaError) {
        console.error('[payment-webhook] Error insertando en ventas:', ventaError.message);
      }

      console.log(`[payment-webhook] ✓ Pago ${pagoIdBD} procesado: PAID | +${diasPlan} días`);

    } else if (estadoNexus === 'failed') {
      console.log(`[payment-webhook] ✗ Pago ${pagoIdBD} marcado FAILED (MP status: ${mpStatus})`);

    } else if (estadoNexus === 'refunded') {
      // Revertir el estado del socio si el pago fue devuelto
      if (pagoExistente.socio_id) {
        await supabase
          .from('socios')
          .update({ estado: 'Vencida' })
          .eq('id', pagoExistente.socio_id);
      }
      console.log(`[payment-webhook] ↩ Pago ${pagoIdBD} marcado REFUNDED`);
    }

    // ── 9. Responder 200 para confirmar recepción a Mercado Pago ─────────────
    return new Response(JSON.stringify({ ok: true, estado: estadoNexus }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[payment-webhook] ERROR no controlado:', message);
    // Siempre 200 para evitar reintentos infinitos de MP
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
