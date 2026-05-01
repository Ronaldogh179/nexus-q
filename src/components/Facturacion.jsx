import React, { useState } from 'react';
import { FileText, Search, Plus, Download, Mail, Filter, CheckCircle2, Clock, AlertTriangle, XCircle, FileDigit } from 'lucide-react';

const Facturacion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [showModalFactura, setShowModalFactura] = useState(false);

  // Base de datos simulada de facturas
  const [facturas] = useState([
    { id: 'FC-000125', fecha: 'Hoy', cliente: 'Martín (Musculación)', monto: 38000, estado: 'Pagada', email: 'martin@example.com' },
    { id: 'FC-000124', fecha: 'Hoy', cliente: 'Consumidor Final (POS)', monto: 3000, estado: 'Pagada', email: '' },
    { id: 'FC-000123', fecha: 'Ayer', cliente: 'Laura Fernández', monto: 45000, estado: 'Pagada', email: 'laura@example.com' },
    { id: 'FC-000122', fecha: '15/04/2026', cliente: 'Gimnasio Equipamientos S.A.', monto: 120000, estado: 'Pendiente', email: 'ventas@equipamientos.com' },
    { id: 'FC-000121', fecha: '10/04/2026', cliente: 'Carlos Ruiz', monto: 38000, estado: 'Vencida', email: 'carlos@example.com' },
    { id: 'FC-000120', fecha: '05/04/2026', cliente: 'Valeria Gómez', monto: 55000, estado: 'Anulada', email: 'valeria@example.com' },
  ]);

  const estados = ['Todas', 'Pagada', 'Pendiente', 'Vencida', 'Anulada'];

  // Lógica de filtrado
  const facturasFiltradas = facturas.filter(f => {
    const coincideTexto = f.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideEstado = filtroEstado === 'Todas' || f.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  // Cálculos de KPIs
  const totalPagadas = facturas.filter(f => f.estado === 'Pagada').reduce((acc, curr) => acc + curr.monto, 0);
  const totalPendientes = facturas.filter(f => f.estado === 'Pendiente' || f.estado === 'Vencida').reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="text-blue-500" size={32} /> Facturación y Recibos
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Gestiona los comprobantes fiscales y recibos emitidos a tus socios.</p>
        </div>
        <button 
          onClick={() => setShowModalFactura(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Emitir Factura Libre
        </button>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Cobrado (Mes)</p>
          <p className="text-3xl font-black text-green-400">${totalPagadas.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Por Cobrar</p>
          <p className="text-3xl font-black text-orange-400">${totalPendientes.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Facturas Emitidas</p>
          <p className="text-3xl font-black text-white">{facturas.length}</p>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md flex items-center justify-center">
           <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
             <FileDigit size={32} />
             <span className="font-bold text-sm">Configuración AFIP/Tributaria</span>
           </button>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Nº de factura o cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <span className="text-sm text-gray-400 whitespace-nowrap px-2 flex items-center gap-2">
            <Filter size={14}/> Estado:
          </span>
          {estados.map(est => (
            <button 
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filtroEstado === est ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE FACTURAS */}
      <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#141b2d]/50">
                <th className="p-4 pl-6 font-semibold">Nº Comprobante</th>
                <th className="p-4 font-semibold">Cliente / Razón Social</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Monto</th>
                <th className="p-4 font-semibold text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {facturasFiltradas.length > 0 ? (
                facturasFiltradas.map(fac => (
                  <tr key={fac.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-mono text-sm font-bold text-gray-200">{fac.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{fac.fecha}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="font-medium text-white text-sm">{fac.cliente}</p>
                      {fac.email && <p className="text-xs text-gray-500 mt-0.5">{fac.email}</p>}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                        ${fac.estado === 'Pagada' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          fac.estado === 'Pendiente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          fac.estado === 'Vencida' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-gray-700/30 text-gray-400 border-gray-600'}`}>
                        {fac.estado === 'Pagada' && <CheckCircle2 size={12} />}
                        {fac.estado === 'Pendiente' && <Clock size={12} />}
                        {fac.estado === 'Vencida' && <AlertTriangle size={12} />}
                        {fac.estado === 'Anulada' && <XCircle size={12} />}
                        {fac.estado}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <p className="text-base font-black text-white">${fac.monto.toLocaleString('es-AR')}</p>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => alert(`Descargando PDF de la factura ${fac.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all" title="Descargar PDF">
                          <Download size={16} />
                        </button>
                        <button disabled={!fac.email} onClick={() => alert(`Enviando ${fac.id} por correo a ${fac.email}`)} className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent rounded-lg transition-all" title="Enviar por Email">
                          <Mail size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No se encontraron facturas con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EMITIR FACTURA (UI) */}
      {showModalFactura && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} className="text-blue-500"/> Emitir Factura Manual</h2>
              <button onClick={() => setShowModalFactura(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg"><XCircle size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Cliente / Razón Social</label>
                <input type="text" placeholder="Buscar socio o ingresar nombre..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">CUIT / DNI</label>
                  <input type="text" placeholder="Ej. 20-12345678-9" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Tipo de Comprobante</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Factura C</option>
                    <option>Factura A</option>
                    <option>Factura B</option>
                    <option>Recibo X (Interno)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Concepto / Detalle</label>
                <input type="text" placeholder="Ej. Pago Membresía Trimestral" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Monto Total ($)</label>
                  <input type="number" placeholder="0" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Condición de Venta</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Contado</option>
                    <option>Tarjeta de Débito</option>
                    <option>Tarjeta de Crédito</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
              <button onClick={() => setShowModalFactura(false)} className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={() => { alert("Generando Factura Electrónica..."); setShowModalFactura(false); }} className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20">
                Emitir y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Facturacion;