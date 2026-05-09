import React, { useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { AlertTriangle, BellRing, MessageCircle, CalendarX } from 'lucide-react';

const AlertasInactividad = () => {
  const { socios, theme, t } = useGym();

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Socios con membresía vencida: por estado O por fecha_venc < hoy
  const sociosVencidos = useMemo(() => {
    return socios
      .filter((s) => {
        if (s.estado === 'Vencida' || s.estado === 'Vencido') return true;
        const fv = s.fecha_venc ?? s.fechaVenc;
        if (fv && fv !== '—') {
          const d = new Date(fv);
          return !isNaN(d.getTime()) && d < hoy;
        }
        return false;
      })
      .map((s) => {
        const fv = s.fecha_venc ?? s.fechaVenc;
        let diasVencido = 0;
        if (fv && fv !== '—') {
          const d = new Date(fv);
          if (!isNaN(d.getTime())) {
            diasVencido = Math.max(0, Math.floor((hoy - d) / 86_400_000));
          }
        }
        const riesgo = diasVencido > 14 ? 'alto' : diasVencido >= 7 ? 'medio' : 'reciente';
        return { ...s, diasVencido, riesgo };
      })
      .sort((a, b) => b.diasVencido - a.diasVencido);
  }, [socios, hoy]);

  const riesgoCritico = sociosVencidos.filter((s) => s.riesgo === 'alto').length;
  const riesgoMedio = sociosVencidos.filter((s) => s.riesgo === 'medio').length;

  const handleWhatsApp = (socio) => {
    const mensaje = `Hola ${socio.nombre}, tu membresía en Nexus-Q ha vencido. ¡Renueva hoy y sigue entrenando! 💪`;
    window.open(`https://wa.me/${socio.tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const cardClass =
    theme === 'dark'
      ? 'bg-[#1e293b] border-gray-800'
      : 'bg-white border-slate-200 shadow-md';

  const formatFecha = (fv) => {
    if (!fv || fv === '—') return '—';
    const d = new Date(fv);
    if (isNaN(d.getTime())) return fv;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div
      className={`p-6 md:p-8 space-y-8 min-h-full ${
        theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="border-b border-slate-700/40 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={30} />
          Membresías Vencidas
        </h1>
        <p className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Socios cuya membresía ya expiró — requieren seguimiento inmediato
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title="Total Vencidas"
          value={sociosVencidos.length}
          subtitle="Membresías expiradas"
          icon={CalendarX}
          theme={theme}
          danger
        />
        <KpiCard
          title="Riesgo Crítico"
          value={riesgoCritico}
          subtitle="Más de 14 días vencidos"
          icon={AlertTriangle}
          theme={theme}
          danger
        />
        <KpiCard
          title="Riesgo Medio"
          value={riesgoMedio}
          subtitle="Entre 7 y 14 días vencidos"
          icon={BellRing}
          theme={theme}
        />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        {sociosVencidos.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarX size={48} className="mx-auto mb-4 text-slate-500 opacity-40" />
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              No hay membresías vencidas actualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] uppercase tracking-wider ${
                    theme === 'dark'
                      ? 'bg-slate-900/50 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <th className="px-6 py-4 font-bold">{t('member')}</th>
                  <th className="px-6 py-4 font-bold">Contacto</th>
                  <th className="px-6 py-4 font-bold text-center">Fecha Venc.</th>
                  <th className="px-6 py-4 font-bold text-center">Días Vencido</th>
                  <th className="px-6 py-4 font-bold text-center">Riesgo</th>
                  <th className="px-6 py-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className={theme === 'dark' ? 'divide-y divide-slate-700' : 'divide-y divide-slate-200'}>
                {sociosVencidos.map((socio) => (
                  <tr
                    key={socio.id}
                    className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/40' : 'hover:bg-slate-100'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${
                            theme === 'dark'
                              ? 'bg-red-900/30 border-red-700/50 text-red-300'
                              : 'bg-red-50 border-red-200 text-red-600'
                          }`}
                        >
                          {socio.iniciales || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {socio.nombre}
                          </p>
                          <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {socio.plan}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {socio.tel || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatFecha(socio.fecha_venc ?? socio.fechaVenc)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-black text-lg ${socio.riesgo === 'alto' ? 'text-red-500' : socio.riesgo === 'medio' ? 'text-amber-500' : 'text-orange-400'}`}>
                        {socio.diasVencido}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RiskBadge riesgo={socio.riesgo} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(socio)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-sm font-bold"
                        >
                          <MessageCircle size={16} />
                          Renovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, icon: Icon, theme, danger = false }) => (
  <div
    className={`rounded-2xl border p-5 ${
      theme === 'dark'
        ? 'bg-[#1e293b] border-gray-800'
        : 'bg-white border-slate-200 shadow-md'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {title}
      </p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : theme === 'dark' ? 'bg-slate-700/40' : 'bg-slate-100'}`}>
        <Icon size={20} className={danger ? 'text-red-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} />
      </div>
    </div>
    <p className={`text-3xl font-black leading-none ${danger ? 'text-red-500' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {value}
    </p>
    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
  </div>
);

const RiskBadge = ({ riesgo }) => {
  if (riesgo === 'alto') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-red-500/15 text-red-400 border-red-500/30">
        Crítico
      </span>
    );
  }
  if (riesgo === 'medio') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-500/15 text-amber-400 border-amber-500/30">
        Medio
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-orange-500/15 text-orange-400 border-orange-500/30">
      Reciente
    </span>
  );
};

export default AlertasInactividad;
