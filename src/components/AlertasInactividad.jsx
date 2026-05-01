import React, { useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { AlertTriangle, BellRing, MessageCircle, PhoneMissed } from 'lucide-react';

const AlertasInactividad = () => {
  const { socios, theme, t } = useGym();

  const sociosActivos = useMemo(
    () => socios.filter((socio) => socio.estado === 'Activo'),
    [socios]
  );

  const sociosInactivos = useMemo(() => {
    return sociosActivos
      .map((socio) => {
        const baseDias = typeof socio.dias === 'number' ? socio.dias : 10;
        const diasInactivos = ((Number(socio.id) + baseDias * 3) % 21) + 5;
        let riesgo = null;
        if (diasInactivos > 14) riesgo = 'alto';
        else if (diasInactivos >= 7) riesgo = 'medio';
        return { ...socio, diasInactivos, riesgo };
      })
      .filter((socio) => socio.riesgo !== null)
      .sort((a, b) => b.diasInactivos - a.diasInactivos);
  }, [sociosActivos]);

  const totalInactivos = sociosInactivos.length;
  const riesgoCritico = sociosInactivos.filter((s) => s.riesgo === 'alto').length;
  const recuperadosMes = Math.max(2, Math.min(12, Math.floor(sociosActivos.length * 0.35)));

  const handleWhatsApp = (socio) => {
    const mensaje = `Hola ${socio.nombre}, te extrañamos en Nexus-Q. Queremos ayudarte a retomar tu ritmo de entrenamiento.`;
    window.open(`https://wa.me/${socio.tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const cardClass =
    theme === 'dark'
      ? 'bg-[#1e293b] border-gray-800'
      : 'bg-white border-slate-200 shadow-md';

  return (
    <div
      className={`p-6 md:p-8 space-y-8 min-h-full ${
        theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="border-b border-slate-700/40 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('inactivityAlerts')}</h1>
        <p className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('inactivitySubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title={t('totalInactive')}
          value={totalInactivos}
          subtitle={t('mediumHighRisk')}
          icon={BellRing}
          theme={theme}
        />
        <KpiCard
          title={t('criticalRisk')}
          value={riesgoCritico}
          subtitle={t('over14Days')}
          icon={AlertTriangle}
          theme={theme}
          danger
        />
        <KpiCard
          title={t('recoveredThisMonth')}
          value={recuperadosMes}
          subtitle={t('estimatedValue')}
          icon={PhoneMissed}
          theme={theme}
        />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] uppercase tracking-wider ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-700 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <th className="px-6 py-4 font-bold">{t('member')}</th>
                <th className="px-6 py-4 font-bold">{t('contact')}</th>
                <th className="px-6 py-4 font-bold text-center">{t('daysWithoutComing')}</th>
                <th className="px-6 py-4 font-bold text-center">{t('riskLevel')}</th>
                <th className="px-6 py-4 font-bold text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'divide-y divide-slate-700' : 'divide-y divide-slate-200'}>
              {sociosInactivos.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-16 text-center text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('noInactivityAlerts')}
                  </td>
                </tr>
              ) : (
                sociosInactivos.map((socio) => (
                  <tr
                    key={socio.id}
                    className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/40' : 'hover:bg-slate-100'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-slate-200'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {socio.iniciales || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{socio.nombre}</p>
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
                      <span className={`font-bold ${socio.diasInactivos > 14 ? 'text-red-500' : 'text-amber-500'}`}>
                        {socio.diasInactivos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RiskBadge riesgo={socio.riesgo} t={t} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(socio)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <MessageCircle size={16} />
                          {t('sendWhatsApp')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700/40' : 'bg-slate-100'}`}>
        <Icon size={20} className={danger ? 'text-red-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} />
      </div>
    </div>
    <p className={`text-3xl font-black leading-none ${danger ? 'text-red-500' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {value}
    </p>
    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
  </div>
);

const RiskBadge = ({ riesgo, t }) => {
  if (riesgo === 'alto') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-500/15 text-red-500 border-red-500/30">
        {t('highRisk')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-500/15 text-amber-500 border-amber-500/30">
      {t('mediumRisk')}
    </span>
  );
};

export default AlertasInactividad;