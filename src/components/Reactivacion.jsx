import React, { useMemo, useState } from 'react';
import { RotateCcw, Search, MessageCircle, Mail, Percent, Send, UserMinus, TrendingUp, CalendarX, X, CreditCard, Loader2 } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { createPaymentPreference } from '../services/payments';
import CheckoutMP from './CheckoutMP';

// Formatea una fecha ISO a 'DD/MM/YYYY'
const formatFecha = (fv) => {
  if (!fv || fv === '—') return '—';
  const d = new Date(fv);
  if (Number.isNaN(d.getTime())) return fv;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Calcula días transcurridos desde una fecha
const diasDesde = (fv) => {
  if (!fv || fv === '—') return 0;
  const d = new Date(fv);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
};

const Reactivacion = () => {
  const { socios, planes } = useGym();
  const [searchTerm, setSearchTerm] = useState('');
  const [preferenceId, setPreferenceId] = useState(null);
  const [loadingPago, setLoadingPago] = useState(false);
  const [socioRenovando, setSocioRenovando] = useState(null);
  const [errorPago, setErrorPago] = useState(null);

  // Socios con membresía vencida, mapeados al shape que usa el template
  const exSociosList = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return socios
      .filter((s) => {
        if (s.estado === 'Vencida' || s.estado === 'Vencido') return true;
        const fv = s.fecha_venc ?? s.fechaVenc;
        if (fv && fv !== '—') {
          const d = new Date(fv);
          return !Number.isNaN(d.getTime()) && d < hoy;
        }
        return false;
      })
      .map((s) => {
        const fv = s.fecha_venc ?? s.fechaVenc;
        const dias = diasDesde(fv);
        const tiempoBaja = dias === 0 ? 'hoy' : dias === 1 ? '1 día' : `${dias} días`;
        // Intentar encontrar el precio del plan para el flujo de cobro
        const planData = planes.find(
          (p) => p.nombre.toLowerCase() === (s.plan ?? '').toLowerCase()
        );
        return {
          id: s.id,
          iniciales: s.iniciales ?? (s.nombre ?? '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          nombre: s.nombre,
          planAnterior: s.plan ?? '—',
          planPrecio: planData ? Number(planData.precio) : 100,
          fechaBaja: formatFecha(fv),
          tiempoBaja,
          motivo: 'Membresía vencida',
          tel: s.tel ?? '',
        };
      })
      .sort((a, b) => diasDesde(b.fechaBaja) - diasDesde(a.fechaBaja));
  }, [socios, planes]);

  const handleRenovar = async (socio) => {
    setLoadingPago(true);
    setErrorPago(null);
    setSocioRenovando(socio);
    try {
      const id = await createPaymentPreference({
        socio_id: socio.id,
        monto: socio.planPrecio,
        titulo_plan: socio.planAnterior,
      });
      setPreferenceId(id);
    } catch (err) {
      setErrorPago(err.message);
      setSocioRenovando(null);
    } finally {
      setLoadingPago(false);
    }
  };

  const handleCerrarCheckout = () => {
    setPreferenceId(null);
    setSocioRenovando(null);
    setErrorPago(null);
  };

  const exSociosFiltrados = useMemo(
    () => exSociosList.filter((s) => s.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
    [exSociosList, searchTerm]
  );

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

      {/* TARJETAS DE MÉTRICAS DE REACTIVACIÓN — datos reales de Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Membresías Vencidas</p>
            <p className="text-3xl font-black text-white">{exSociosList.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
            <UserMinus size={24} className="text-red-500"/>
          </div>
        </div>
        
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vencidas +14 días</p>
            <p className="text-3xl font-black text-white">
              {exSociosList.filter(s => diasDesde(s.fechaBaja.split('/').reverse().join('-')) > 14).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
            <CalendarX size={24} className="text-orange-400"/>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Filtradas en búsqueda</p>
            <p className="text-3xl font-black text-white">{exSociosFiltrados.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-blue-500"/>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar socio vencido por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* TABLA DE EX-SOCIOS */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/30">
                <th className="p-4 pl-6 font-medium">Socio Vencido</th>
                <th className="p-4 font-medium text-center">Venció Hace</th>
                <th className="p-4 font-medium">Estado</th>
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
                      <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide border bg-red-500/10 text-red-400 border-red-500/20">
                        Vencida
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
                          <MessageCircle size={16} /> Promo 20%
                        </button>
                        <button
                          onClick={() => handleRenovar(socio)}
                          disabled={loadingPago}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPago && socioRenovando?.id === socio.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <CreditCard size={16} />
                          }
                          Renovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 text-sm">
                    {searchTerm
                      ? 'No se encontraron socios que coincidan con la búsqueda.'
                      : '¡Excelente! No hay membresías vencidas en este momento.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* OVERLAY DE CHECKOUT — visible cuando hay una preferencia activa */}
      {(preferenceId || errorPago) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-400" /> Renovar membresía
                </h2>
                {socioRenovando && (
                  <p className="text-gray-400 text-sm mt-0.5">{socioRenovando.nombre} — {socioRenovando.planAnterior}</p>
                )}
              </div>
              <button
                onClick={handleCerrarCheckout}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {errorPago ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {errorPago}
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-xs text-center">
                  Completa el pago de forma segura a través de Mercado Pago.
                </p>
                <CheckoutMP preferenceId={preferenceId} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reactivacion;