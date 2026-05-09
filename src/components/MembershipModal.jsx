import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';

const MembershipModal = ({ closeModal }) => {
  // Estados para la lógica matemática
  const [precioBase, setPrecioBase] = useState(38000);
  const [cobrarMatricula, setCobrarMatricula] = useState(true);
  const valorMatricula = 8000;
  const [descuento, setDescuento] = useState(0);
  const [pagoEfectivo, setPagoEfectivo] = useState(20000);
  
  // Fechas automáticas (hoy y en un mes)
  const hoy = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(hoy);
  
  // Cálculos en tiempo real
  const subtotal = precioBase + (cobrarMatricula ? valorMatricula : 0);
  const total = subtotal - descuento;
  const pagoMP = total - pagoEfectivo;

  // Lógica para cambiar precios según el plan elegido
  const handlePlanChange = (e) => {
    const val = parseInt(e.target.value);
    setPrecioBase(val);
  };

  const handleGuardar = () => {
    alert(`¡Pago registrado con éxito!\nTotal cobrado: S/ ${total.toLocaleString('es-PE')}\nEfectivo: S/ ${pagoEfectivo.toLocaleString('es-PE')}\nMercado Pago: S/ ${pagoMP.toLocaleString('es-PE')}`);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2"><Calculator size={22} className="text-blue-400"/> Registrar Pago</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Seleccionar Plan</label>
              <select onChange={handlePlanChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="38000">Musculación Mensual (S/ 38,000)</option>
                <option value="45000">Crossfit Mensual (S/ 45,000)</option>
                <option value="15000">Funcional Libre (S/ 15,000)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Fecha de Inicio</label>
              <input type="date" value={fechaInicio} onChange={(e)=>setFechaInicio(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm w-full text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-5">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Descuento (S/)</label>
              <input type="number" min="0" value={descuento} onChange={(e) => setDescuento(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                <input type="checkbox" checked={cobrarMatricula} onChange={(e) => setCobrarMatricula(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500"/>
                Cobrar Matrícula (S/ 8,000)
              </label>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl flex flex-col justify-center items-end border border-blue-500/30 shadow-inner">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total a pagar</span>
              <span className="text-3xl font-black text-blue-400">S/ {total.toLocaleString('es-PE')}</span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-5 bg-gray-800/30 p-4 rounded-lg mt-2">
            <h3 className="font-semibold text-gray-200 mb-4 text-sm uppercase tracking-wider">Múltiples formas de pago</h3>
            <div className="flex gap-4 items-center mb-3">
              <span className="w-32 text-sm font-medium text-gray-400">💰 Efectivo</span>
              <input type="number" min="0" value={pagoEfectivo} onChange={(e) => setPagoEfectivo(Number(e.target.value))} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex gap-4 items-center">
              <span className="w-32 text-sm font-medium text-gray-400">💳 Mercado Pago</span>
              <div className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-blue-300 font-bold font-mono">
                 S/ {pagoMP > 0 ? pagoMP.toLocaleString('es-PE') : 0} <span className="text-xs text-gray-500 font-sans font-normal ml-2">(Auto-calculado)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
          <button onClick={closeModal} className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Cancelar</button>
          <button onClick={handleGuardar} className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all">Guardar Pago</button>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;