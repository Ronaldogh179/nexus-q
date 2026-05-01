import React, { useState } from 'react';
import { RotateCcw, Search, Filter, MessageCircle, Mail, Percent, Send, UserMinus, TrendingUp, CalendarX } from 'lucide-react';

const Reactivacion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [motivoFiltro, setMotivoFiltro] = useState('Todos');

  // Base de datos de EX-SOCIOS para recuperar
  const exSociosList = [
    { id: 1, iniciales: 'CM', nombre: 'Carlos Medina', planAnterior: 'Musculación Mensual', fechaBaja: '15/10/2025', tiempoBaja: '6 meses', motivo: 'Económico', tel: '5491144445555' },
    { id: 2, iniciales: 'SL', nombre: 'Sofía López', planAnterior: 'CrossFit Mensual', fechaBaja: '02/12/2025', tiempoBaja: '4 meses', motivo: 'Falta de tiempo', tel: '5491166667777' },
    { id: 3, iniciales: 'MR', nombre: 'Marcos Ruiz', planAnterior: 'Funcional Libre', fechaBaja: '20/01/2026', tiempoBaja: '3 meses', motivo: 'Lesión', tel: '5491188889999' },
    { id: 4, iniciales: 'VT', nombre: 'Valeria Torres', planAnterior: 'Musculación Semestral', fechaBaja: '10/08/2025', tiempoBaja: '8 meses', motivo: 'Mudanza', tel: '5491122223333' },
    { id: 5, iniciales: 'JN', nombre: 'Joaquín Navarro', planAnterior: 'Spinning Mensual', fechaBaja: '05/11/2025', tiempoBaja: '5 meses', motivo: 'Económico', tel: '5491199990000' },
  ];

  const motivosDisponibles = ['Todos', 'Económico', 'Falta de tiempo', 'Lesión', 'Mudanza'];

  const exSociosFiltrados = exSociosList.filter(socio => {
    const coincideTexto = socio.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideMotivo = motivoFiltro === 'Todos' || socio.motivo === motivoFiltro;
    return coincideTexto && coincideMotivo;
  });

  // Lógica de Campaña de Retención
  const enviarPromoWhatsApp = (socio) => {
    let mensaje = `¡Hola ${socio.nombre}! Te extrañamos en Nexus-Q. Como fuiste parte de nuestra familia entrenando en ${socio.planAnterior}, queremos regalarte un 20% DE DESCUENTO en tu próximo mes si decides volver esta semana. ¿Te guardamos el lugar? 💪`;
    const url = `https://wa.me/${socio.tel}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500 bg-[#111827] min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <RotateCcw className="text-blue-500" size={32} /> Campañas de Reactivación
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Recupera ex-socios ofreciendo incentivos personalizados.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
          <Send size={18} /> Campaña Masiva
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS DE REACTIVACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Base de Ex-Socios</p>
            <p className="text-3xl font-black text-white">412</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
            <UserMinus size={24} className="text-red-500"/>
          </div>
        </div>
        
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Recuperados (Mes)</p>
            <p className="text-3xl font-black text-white">18</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-green-500"/>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tasa de Conversión</p>
            <p className="text-3xl font-black text-white">4.3%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Percent size={24} className="text-blue-500"/>
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar ex-socio por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <span className="text-sm text-gray-400 whitespace-nowrap px-2 flex items-center gap-2">
            <Filter size={14}/> Motivo de baja:
          </span>
          {motivosDisponibles.map(motivo => (
            <button 
              key={motivo}
              onClick={() => setMotivoFiltro(motivo)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${motivoFiltro === motivo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}
            >
              {motivo}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE EX-SOCIOS */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/30">
                <th className="p-4 pl-6 font-medium">Ex-Miembro</th>
                <th className="p-4 font-medium text-center">Baja Hace</th>
                <th className="p-4 font-medium">Motivo Registrado</th>
                <th className="p-4 font-medium text-right pr-6">Acción de Recuperación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {exSociosFiltrados.length > 0 ? (
                exSociosFiltrados.map(socio => (
                  <tr key={socio.id} className="hover:bg-gray-800/40 transition-colors">
                    
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm">
                          {socio.iniciales}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{socio.nombre}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Últ. Plan: {socio.planAnterior}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-orange-400">{socio.tiempoBaja}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1"><CalendarX size={10}/> {socio.fechaBaja}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border 
                        ${socio.motivo === 'Económico' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          socio.motivo === 'Falta de tiempo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          socio.motivo === 'Lesión' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-gray-700/50 text-gray-300 border-gray-600'}`}>
                        {socio.motivo}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700" title="Enviar Email">
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => enviarPromoWhatsApp(socio)} 
                          className="px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                        >
                          <MessageCircle size={16} /> Enviar Promo 20%
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 text-sm">
                    No se encontraron ex-socios con esos filtros.
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

export default Reactivacion;