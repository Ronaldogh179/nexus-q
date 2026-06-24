// ============================================================
//  create-checkout — Supabase Edge Function
//  Runtime: Deno (Node no disponible en Edge Functions)
//
//  PROPÓSITO:
//    Recibe los datos de un pago desde el frontend de Nexus-Q,
//    crea una preferencia de pago en Mercado Pago y registra
//    el intento en la tabla `pagos` con estado 'pending'.
//
//  SECRETS REQUERIDOS (Supabase Dashboard → Edge Functions → Secrets):
//    - MP_ACCESS_TOKEN          Token de acceso de MP (test o producción)
//    - SUPABASE_URL             URL del proyecto Supabase
//    - SUPABASE_SERVICE_ROLE_KEY Service role key (NO exponer al cliente)
//    - FRONTEND_URL             URL del frontend (ej. https://nexus-q.vercel.app)
//
//  LLAMADA DESDE EL FRONTEND:
//    const { data } = await supabase.functions.invoke('create-checkout', {
//      body: { socio_id, plan_id, monto, socio_nombre, plan_nombre }
//    });
//    window.location.href = data.init_point; // redirige a MP
//
//  RESPUESTA:
//    { ok, init_point, sandbox_init_point, preference_id, pago_id }
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ────────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

// ─── Handler ─────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // ── 1. Variables de entorno ────────────────────────────────────────────
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') ?? '';

    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN no configurado en Secrets');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables de Supabase no configuradas en Secrets');
    }

    // ── 2. Parsear body ────────────────────────────────────────────────────
    const body = await req.json();
    // socio_id y plan_id son opcionales: pueden ser null cuando se llama
    // desde ex-socios (mock) o desde flujos donde aún no hay IDs reales.
    const { socio_id = null, plan_id = null, monto, titulo_plan } = body;

    if (!monto) {
      return json({ ok: false, error: 'Campo requerido: monto' }, 400);
    }

    // ── 3. Registrar pago como 'pending' en Supabase ───────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const idempotencyKey = `pago_${crypto.randomUUID()}`;

    // Construir el objeto de inserción solo con campos válidos.
    // socio_id y plan_id se insertan como null si no se proporcionaron,
    // evitando errores de tipo UUID/BIGINT con IDs de datos mock.
    const insertPayload: Record<string, unknown> = {
      monto: Number(monto),
      moneda: 'PEN',
      estado: 'pending',
      provider: 'mercadopago',
      idempotency_key: idempotencyKey,
    };

    if (socio_id !== null && socio_id !== undefined) insertPayload.socio_id = socio_id;
    if (plan_id  !== null && plan_id  !== undefined) insertPayload.plan_id  = plan_id;

    const { data: pago, error: pagoErr } = await supabase
      .from('pagos')
      .insert([insertPayload])
      .select()
      .single();

    if (pagoErr || !pago) {
      throw new Error(`Error registrando pago en BD: ${pagoErr?.message ?? 'Sin datos'}`);
    }

    // ── 4. Crear preferencia en Mercado Pago ──────────────────────────────
    //    Docs: https://www.mercadopago.com.pe/developers/es/reference/preferences/_checkout_preferences/post
    const preference = {
      items: [
        {
          id: `plan_${plan_id}`,
          title: titulo_plan ?? 'Membresía Nexus-Q',
          quantity: 1,
          currency_id: 'PEN',
          unit_price: Number(monto),
        },
      ],
      // external_reference vincula el webhook con el pago en nuestra BD
      external_reference: pago.id,
      // notification_url: Mercado Pago llamará aquí cuando el pago cambie de estado
      notification_url: `${SUPABASE_URL}/functions/v1/payment-webhook`,
      back_urls: {
        success: `${FRONTEND_URL}/pago-exitoso`,
        failure: `${FRONTEND_URL}/pago-fallido`,
        pending: `${FRONTEND_URL}/pago-pendiente`,
      },
      auto_return: 'approved',
      statement_descriptor: 'NEXUS-Q FITNESS',
      // expires: true,              // Habilitar para limitar vigencia de la preferencia
      // expiration_date_to: '...',  // ISO 8601
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.json().catch(() => ({}));
      throw new Error(`Mercado Pago rechazó la preferencia: ${JSON.stringify(errBody)}`);
    }

    const mpData = await mpRes.json();

    // ── 5. Actualizar pago con el ID de preferencia de MP ─────────────────
    await supabase
      .from('pagos')
      .update({
        provider_payment_id: mpData.id,
        provider_payload: mpData,
      })
      .eq('id', pago.id);

    // ── 6. Respuesta al frontend ───────────────────────────────────────────
    //    El Wallet brick de @mercadopago/sdk-react espera { id: preference_id }
    return json({ id: mpData.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[create-checkout] ERROR:', message);
    return json({ ok: false, error: message }, 500);
  }
});
