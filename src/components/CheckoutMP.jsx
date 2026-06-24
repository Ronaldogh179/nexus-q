import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializar MP una sola vez al cargar el módulo (no dentro del componente)
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-PE' });

/**
 * Renderiza el botón de pago oficial de Mercado Pago (Wallet brick).
 * Requiere que la preferencia ya haya sido creada en el backend.
 *
 * @param {{ preferenceId: string }} props
 */
const CheckoutMP = ({ preferenceId }) => {
  return (
    <Wallet
      initialization={{ preferenceId }}
      customization={{ texts: { valueProp: 'security_details' } }}
    />
  );
};

export default CheckoutMP;
