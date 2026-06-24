import { supabase } from '../lib/supabase';

/**
 * Llama a la Edge Function `create-checkout` para generar una preferencia
 * de pago en Mercado Pago y devuelve el ID de la preferencia.
 *
 * @param {{ monto: number, titulo_plan: string, socio_id?: number|null, plan_id?: number|null }} params
 * @returns {Promise<string>} El ID de la preferencia de MP (usado por el Wallet brick)
 */
export async function createPaymentPreference({ monto, titulo_plan, socio_id = null, plan_id = null }) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { monto, titulo_plan, socio_id, plan_id },
  });

  if (error) {
    throw new Error(`Error al crear la preferencia de pago: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error('La función no retornó un ID de preferencia válido.');
  }

  return data.id;
}
