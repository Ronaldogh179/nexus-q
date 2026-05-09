import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, CheckCircle2, AlertCircle, Settings, Search, User, Filter, XCircle, RefreshCw } from 'lucide-react';

const Pagos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado simulado de las pasarelas de pago
  const [pasarelas, setPasarelas] = useState([
    { id: 'mp', nombre: 'Mercado Pago', tipo: 'Billetera Virtual / QR', estado: 'Conectado', color: 'blue' },
    { id: 'cash', nombre: 'Efectivo', tipo: 'Cobro en recepción', estado: 'Conectado', color: 'green' },
  ]);

  // Base de datos simulada de socios adheridos al débito automático
  const [suscripciones] = useState([
    { id: 'SUB-001', socio: 'Carlos Ruiz', plan: 'Musculación Semestral', monto: 38000, metodo: 'Mercado Pago', proximoCobro: '15/05/2026', estado: 'Activo' },
    { id: 'SUB-002', socio: 'Ana López', plan: 'Yoga Vinyasa', monto: 25000, metodo: 'Efectivo', proximoCobro: '10/05/2026', estado: 'Activo' },
    { id: 'SUB-003', socio: 'Marcos Díaz', plan: 'CrossFit Anual', monto: 45000, metodo: 'Mercado Pago', proximoCobro: '05/05/2026', estado: 'Rechazado' },
    { id: 'SUB-004', socio: 'Laura Fernández', plan: 'Pase Libre', monto: 55000, metodo: 'Efectivo', proximoCobro: '20/05/2026', estado: 'Activo' },
    { id: 'SUB-005', socio: 'Gabriela Silva', plan: 'Funcional Libre', monto: 30000, metodo: 'Mercado Pago', proximoCobro: '01/05/2026', estado: 'Pausado' },
  ]);

  const suscripcionesFiltradas = suscripciones.filter(sub => 
    sub.socio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasarela = (id) => {
    setPasarelas(pasarelas.map(p => {
      if (p.id === id) {
        return { ...p, estado: p.estado === 'Conectado' ? 'Desconectado' : 'Conectado' };
      }
      return p;
    }));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CreditCard className="text-blue-500" size={32} /> Métodos de Pago y Suscripciones
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Configura las integraciones de cobro y gestiona los débitos automáticos.</p>
        </div>
      </div>

      {/* SECCIÓN 1: PASARELAS DE PAGO */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Settings size={20} className="text-gray-400"/> Integraciones Activas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {pasarelas.map(pasarela => (
          <div key={pasarela.id} className="bg-[#1e293b] p-5 rounded-2xl border border-gray-800 shadow-md relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${pasarela.estado === 'Conectado' ? 'bg-green-500' : pasarela.estado === 'Revisión' ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
            
            <div className="flex justify-between items-start mb-4 pl-2">
              <div className={`p-2.5 rounded-xl bg-${pasarela.color}-500/10 text-${pasarela.color}-400 border border-${pasarela.color}-500/20`}>
                {pasarela.id === 'mp' ? <Smartphone size={24}/> : <Banknote size={24}/>}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border
                ${pasarela.estado === 'Conectado' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                  pasarela.estado === 'Revisión' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                  'bg-gray-800 text-gray-400 border-gray-700'}`}>
                {pasarela.estado}
              </span>
            </div>
            
            <div className="pl-2">
              <h3 className="text-white font-bold text-lg mb-1">{pasarela.nombre}</h3>
              <p className="text-gray-400 text-xs mb-4">{pasarela.tipo}</p>
              
              <button 
                onClick={() => togglePasarela(pasarela.id)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition-all border
                  ${pasarela.estado === 'Conectado' ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 
                    'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white'}`}
              >
                {pasarela.estado === 'Conectado' ? 'Desconectar' : 'Conectar Cuenta'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN 2: GESTIÓN DE DÉBITOS AUTOMÁTICOS */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <RefreshCw size={20} className="text-blue-400"/> Suscripciones (Débito Automático)
        </h2>
      </div>

      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-2.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por socio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
        <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-gray-700">
          <Filter size={16}/> Filtrar Estados
        </button>
      </div>

      {/* TABLA DE SUSCRIPCIONES */}
      <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#141b2d]/50">
                <th className="p-4 pl-6 font-semibold">Socio / ID</th>
                <th className="p-4 font-semibold">Plan & Monto</th>
                <th className="p-4 font-semibold">Método Adherido</th>
                <th className="p-4 font-semibold text-center">Próximo Cobro</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {suscripcionesFiltradas.length > 0 ? (
                suscripcionesFiltradas.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg text-gray-400"><User size={16}/></div>
                        <div>
                          <p className="font-bold text-white text-sm">{sub.socio}</p>
                          <p className="text-xs text-gray-500">{sub.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <p className="font-medium text-gray-200 text-sm">{sub.plan}</p>
                      <p className="text-xs font-bold text-blue-400 mt-0.5">S/ {sub.monto.toLocaleString('es-PE')} / mes</p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-700 w-fit">
                        <CreditCard size={14} className="text-gray-500"/>
                        {sub.metodo}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-300">{sub.proximoCobro}</p>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                        ${sub.estado === 'Activo' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          sub.estado === 'Rechazado' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {sub.estado === 'Activo' && <CheckCircle2 size={12} />}
                        {sub.estado === 'Rechazado' && <AlertCircle size={12} />}
                        {sub.estado === 'Pausado' && <XCircle size={12} />}
                        {sub.estado}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button onClick={() => alert(`Gestionando suscripción de ${sub.socio}...`)} className="text-xs bg-gray-800 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-lg transition-colors border border-gray-700">
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500 text-sm">
                    No se encontraron suscripciones activas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Pagos;