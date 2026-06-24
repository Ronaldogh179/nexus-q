import React, { useState } from 'react';
import { X, Calculator, Loader2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { useToast } from './Toast';

const MembershipModal = ({ closeModal }) => {
  const { planes, registrarVenta } = useGym();
  const { addToast } = useToast();

  // Construye las opciones de plan desde la BD (con fallback a valores fijos)
  const planOptions = planes.length > 0
    ? planes.filter((p) => p.estado === 'Activo')
    : [
        { id: 1, nombre: 'Mensual', precio: 100 },
        { id: 2, nombre: '3 Meses Promo', precio: 250 },
        { id: 3, nombre: 'Anual', precio: 720 },
      ];

  const [planSeleccionado, setPlanSeleccionado] = useState(planOptions[0] ?? null);
  const [cobrarMatricula, setCobrarMatricula] = useState(false);
  const valorMatricula = 50;
  const [descuento, setDescuento] = useState(0);
  const [pagoEfectivo, setPagoEfectivo] = useState(planOptions[0]?.precio ?? 0);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [guardando, setGuardando] = useState(false);

  const precioBase = Number(planSeleccionado?.precio ?? 0);
  const subtotal = precioBase + (cobrarMatricula ? valorMatricula : 0);
  const total = Math.max(0, subtotal - Number(descuento));
  const pagoMP = Math.max(0, total - Number(pagoEfectivo));

  const handlePlanChange = (e) => {
    const found = planOptions.find((p) => String(p.id) === e.target.value);
    if (found) {
      setPlanSeleccionado(found);
      setPagoEfectivo(Number(found.precio));
    }
  };

  const handleGuardar = async () => {
    if (!planSeleccionado || total <= 0) {
      addToast({ message: 'Selecciona un plan con monto válido.', type: 'warning' });
      return;
    }

    setGuardando(true);
    try {
      const concepto = `Membresía: ${planSeleccionado.nombre}${cobrarMatricula ? ' + Matrícula' : ''}${descuento > 0 ? ` (desc. S/ ${descuento})` : ''}`;

      // Si hay pago mixto registramos dos entradas; si es solo uno, una sola
      const ventas = [];
      if (Number(pagoEfectivo) > 0) {
        ventas.push({ concepto, monto: Number(pagoEfectivo), metodo: 'Efectivo', tipo: 'ingreso' });
      }
      if (pagoMP > 0) {
        ventas.push({ concepto: `${concepto} (MP)`, monto: pagoMP, metodo: 'Mercado Pago', tipo: 'ingreso' });
      }
      if (ventas.length === 0) {
        ventas.push({ concepto, monto: total, metodo: 'Efectivo', tipo: 'ingreso' });
      }

      for (const v of ventas) {
        const res = await registrarVenta(v);
        if (!res?.ok) throw new Error('Error al guardar una de las entradas en Caja.');
      }

      closeModal();
    } catch (err) {
      addToast({ message: err.message ?? 'Error al guardar el pago.', type: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator size={22} className="text-blue-400"/> Registrar Pago
          </h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Seleccionar Plan</label>
              <select
                value={planSeleccionado?.id ?? ''}
                onChange={handlePlanChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {planOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — S/ {Number(p.precio).toLocaleString('es-PE')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm w-full text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Descuento (S/)</label>
              <input
                type="number"
                min="0"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={cobrarMatricula}
                  onChange={(e) => setCobrarMatricula(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                Matrícula (+S/ {valorMatricula})
              </label>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl flex flex-col justify-center items-end border border-blue-500/30 shadow-inner">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total a pagar</span>
              <span className="text-3xl font-black text-blue-400">S/ {total.toLocaleString('es-PE')}</span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-5 bg-gray-800/30 p-4 rounded-lg mt-2">
            <h3 className="font-semibold text-gray-200 mb-4 text-sm uppercase tracking-wider">Formas de pago</h3>
            <div className="flex gap-4 items-center mb-3">
              <span className="w-32 text-sm font-medium text-gray-400">💰 Efectivo</span>
              <input
                type="number"
                min="0"
                max={total}
                value={pagoEfectivo}
                onChange={(e) => setPagoEfectivo(Number(e.target.value))}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <span className="w-32 text-sm font-medium text-gray-400">💳 Mercado Pago</span>
              <div className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-blue-300 font-bold font-mono">
                S/ {pagoMP.toLocaleString('es-PE')}
                <span className="text-xs text-gray-500 font-sans font-normal ml-2">(Auto-calculado)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
          <button
            onClick={closeModal}
            disabled={guardando}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || total <= 0}
            className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            {guardando ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : 'Guardar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
