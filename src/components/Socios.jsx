import React, { useMemo, useState, useCallback } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import {
  UserPlus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  CalendarClock,
  Sparkles,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const PLAN_OPTIONS = [
  'Mensual (S/ 100)',
  'Promo 3 Meses (S/ 250)',
  'Promo 6 Meses (S/ 450)',
  'Anual (S/ 720)',
];

const FILTER_OPTIONS = [
  { key: 'Todos', label: 'Todos' },
  { key: 'Mensual', label: 'Mensual' },
  { key: '3 Meses Promo', label: '3 Meses Promo' },
  { key: '6 Meses Promo', label: '6 Meses Promo' },
  { key: 'Anual', label: 'Anual' },
];

const getDiasByPlan = (planValue) => {
  const normalizedPlan = String(planValue || '').toLowerCase();
  if (normalizedPlan.includes('anual')) return 360;
  if (normalizedPlan.includes('6 meses')) return 180;
  if (normalizedPlan.includes('3 meses')) return 90;
  if (normalizedPlan.includes('mensual')) return 30;
  return 30;
};

const normalizePlanOption = (planValue) => {
  const normalizedPlan = String(planValue || '').toLowerCase();
  if (normalizedPlan.includes('anual')) return 'Anual (S/ 720)';
  if (normalizedPlan.includes('6 meses')) return 'Promo 6 Meses (S/ 450)';
  if (normalizedPlan.includes('3 meses')) return 'Promo 3 Meses (S/ 250)';
  if (normalizedPlan.includes('mensual')) return 'Mensual (S/ 100)';
  return PLAN_OPTIONS[0];
};

const emptyForm = () => ({
  nombre: '',
  dni: '',
  tel: '',
  mail: '',
  plan: PLAN_OPTIONS[0],
  apto: true,
});

// Usa created_at de Supabase (TIMESTAMPTZ) para contar altas reales del mes actual
const isSocioNuevoEsteMes = (socio) => {
  if (!socio.created_at) return false;
  const created = new Date(socio.created_at);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth()
  );
};

export const diasLabel = (socio) => {
  if (socio.estado === 'Vencida' || socio.estado === 'Vencido') return '—';
  if (typeof socio.dias !== 'number' || Number.isNaN(socio.dias)) return '—';
  return `${socio.dias}`;
};

const Socios = () => {
  const { socios, agregarSocio, editarSocio, eliminarSocio, theme, t } = useGym();

  const [searchTerm, setSearchTerm] = useState('');
  const [planFiltro, setPlanFiltro] = useState('Todos');
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalVer, setShowModalVer] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [socioViendo, setSocioViendo] = useState(null);
  const [socioEditando, setSocioEditando] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const totalSocios = socios.length;
  const activos = useMemo(() => socios.filter((s) => s.estado === 'Activo').length, [socios]);
  const porVencer = useMemo(
    () =>
      socios.filter(
        (s) => s.estado === 'Activo' && typeof s.dias === 'number' && s.dias > 0 && s.dias <= 7
      ).length,
    [socios]
  );
  const nuevosEsteMes = useMemo(() => socios.filter(isSocioNuevoEsteMes).length, [socios]);

  const q = searchTerm.trim().toLowerCase();

  const matchesPlan = (planValue, filtro) => {
    if (filtro === 'Todos') return true;
    const normalizedPlan = String(planValue || '').toLowerCase();
    if (filtro === '3 Meses Promo') return normalizedPlan.includes('3 meses');
    if (filtro === '6 Meses Promo') return normalizedPlan.includes('6 meses');
    return normalizedPlan.includes(filtro.toLowerCase());
  };

  const sociosFiltrados = useMemo(() => {
    return socios.filter((socio) => {
      const nombre = (socio.nombre || '').toLowerCase();
      const dni = String(socio.dni || '');
      const coincideTexto = !q || nombre.includes(q) || dni.includes(searchTerm.trim());
      const coincidePlan = matchesPlan(socio.plan, planFiltro);
      return coincideTexto && coincidePlan;
    });
  }, [socios, q, searchTerm, planFiltro]);

  const closeNuevoModal = useCallback(() => {
    setShowModalNuevo(false);
    setFormData(emptyForm());
  }, []);

  const closeEditarModal = useCallback(() => {
    setShowModalEditar(false);
    setSocioEditando(null);
    setFormData(emptyForm());
  }, []);

  const closeVerModal = useCallback(() => {
    setShowModalVer(false);
    setSocioViendo(null);
  }, []);

  const openNuevoSocio = useCallback(() => {
    setFormData(emptyForm());
    setShowModalNuevo(true);
  }, []);

  const openVerSocio = useCallback((socio) => {
    setSocioViendo(socio);
    setShowModalVer(true);
  }, []);

  const openEditarSocio = useCallback((socio) => {
    setSocioEditando(socio);
    setFormData({
      nombre: socio.nombre || '',
      dni: String(socio.dni || ''),
      tel: socio.tel || '',
      mail: socio.mail || '',
      plan: normalizePlanOption(socio.plan),
      apto: Boolean(socio.apto),
    });
    setShowModalEditar(true);
  }, []);

  const submitNuevoSocio = (e) => {
    e.preventDefault();
    const calculoDias = getDiasByPlan(formData.plan);
    agregarSocio({
      nombre: formData.nombre.trim(),
      dni: formData.dni.trim(),
      tel: formData.tel.trim(),
      mail: formData.mail.trim() || `${formData.dni.trim()}@socio.local`,
      plan: formData.plan,
      apto: formData.apto,
      estado: 'Activo',
      dias: calculoDias,
    });
    closeNuevoModal();
  };

  const submitEditarSocio = (e) => {
    e.preventDefault();
    if (!socioEditando) return;
    const calculoDias = getDiasByPlan(formData.plan);
    editarSocio(socioEditando.id, {
      nombre: formData.nombre.trim(),
      dni: formData.dni.trim(),
      tel: formData.tel.trim(),
      mail: formData.mail.trim() || `${formData.dni.trim()}@socio.local`,
      plan: formData.plan,
      apto: formData.apto,
      estado: 'Activo',
      dias: calculoDias,
    });
    closeEditarModal();
  };

  const handleEliminar = (socio) => {
    const msg = t('deleteConfirm').replace('{name}', socio.nombre);
    if (!window.confirm(msg)) return;
    eliminarSocio(socio.id);
  };

  const estadoBadge = (socio) => {
    const activo = socio.estado === 'Activo';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          activo
            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
            : 'bg-red-500/15 text-red-500 border-red-500/30'
        }`}
      >
        {activo ? t('activeStatus') : t('expiredStatus')}
      </span>
    );
  };


  return (
    <div
      className={`p-6 md:p-8 space-y-8 animate-in fade-in duration-500 min-h-full pb-24 ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}
      >
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {t('membersList')}
          </h1>
          <p className={`text-sm mt-1 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('managementCenter')}
          </p>
        </div>
        <button
          type="button"
          onClick={openNuevoSocio}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 border border-blue-500/40 transition-all"
        >
          <UserPlus size={20} />
          {t('newMember')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          theme={theme}
          title={t('totalMembers')}
          value={totalSocios}
          sub={t('inGlobalBase')}
          icon={Users}
          accent="slate"
        />
        <StatCard
          theme={theme}
          title={t('active')}
          value={activos}
          sub={t('activeMembership')}
          icon={UserCheck}
          accent="emerald"
        />
        <StatCard
          theme={theme}
          title={t('expiringSoon')}
          value={porVencer}
          sub={t('daysRemainingShort')}
          icon={CalendarClock}
          accent="amber"
        />
        <StatCard
          theme={theme}
          title={t('newThisMonth')}
          value={nuevosEsteMes}
          sub={t('recentSignups')}
          icon={Sparkles}
          accent="blue"
        />
      </div>

      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
        <input
          type="search"
          placeholder={t('searchMembers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-md'
          }`}
        />
      </div>

      <div
        className={`rounded-2xl border p-4 md:p-5 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('filterByPlan')}
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((plan) => (
            <button
              key={plan.key}
              type="button"
              onClick={() => setPlanFiltro(plan.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                planFiltro === plan.key
                  ? 'bg-blue-600 text-white border-blue-500'
                  : theme === 'dark'
                    ? 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
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
                <th className="px-6 py-4 font-bold">{t('status')}</th>
                <th className="px-6 py-4 font-bold text-center">{t('days')}</th>
                <th className="px-6 py-4 font-bold text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'divide-y divide-slate-700' : 'divide-y divide-slate-200'}>
              {sociosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-16 text-center text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('noMembersFound')}
                  </td>
                </tr>
              ) : (
                sociosFiltrados.map((socio) => (
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
                            {socio.plan} · DNI {socio.dni}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className={`text-sm flex items-center gap-2 min-w-0 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          <Mail size={14} className={theme === 'dark' ? 'text-slate-500 shrink-0' : 'text-slate-400 shrink-0'} />
                          <span className="truncate">{socio.mail || '—'}</span>
                        </p>
                        <p className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Phone size={14} className={theme === 'dark' ? 'text-slate-500 shrink-0' : 'text-slate-400 shrink-0'} />
                          {socio.tel || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{estadoBadge(socio)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-bold ${
                          socio.estado === 'Activo' && typeof socio.dias === 'number'
                            ? socio.dias > 10
                              ? theme === 'dark'
                                ? 'text-slate-200'
                                : 'text-slate-700'
                              : socio.dias > 0
                                ? 'text-amber-500'
                                : 'text-red-500'
                            : theme === 'dark'
                              ? 'text-slate-500'
                              : 'text-slate-400'
                        }`}
                      >
                        {diasLabel(socio)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title={t('view')}
                          onClick={() => openVerSocio(socio)}
                          className={`p-2.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700/80' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          title={t('edit')}
                          onClick={() => openEditarSocio(socio)}
                          className={`p-2.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700/80' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          title={t('delete')}
                          onClick={() => handleEliminar(socio)}
                          className={`p-2.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`px-6 py-3 border-t flex flex-wrap justify-between gap-2 text-xs font-medium ${
            theme === 'dark' ? 'border-slate-700 bg-slate-900/25 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <span>
            {t('showingMembers')} {sociosFiltrados.length} {t('of')} {totalSocios} {t('members')}
          </span>
          <span>{t('orderRecentFirst')}</span>
        </div>
      </div>

      {showModalNuevo && (
        <SocioFormModal
          theme={theme}
          t={t}
          title={t('newMember')}
          formData={formData}
          setFormData={setFormData}
          onClose={closeNuevoModal}
          onSubmit={submitNuevoSocio}
          submitLabel={t('saveMember')}
        />
      )}

      {showModalEditar && (
        <SocioFormModal
          theme={theme}
          t={t}
          title={t('editMember')}
          formData={formData}
          setFormData={setFormData}
          onClose={closeEditarModal}
          onSubmit={submitEditarSocio}
          submitLabel={t('edit')}
        />
      )}

      {showModalVer && socioViendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t('viewMember')}</h2>
              <button
                type="button"
                onClick={closeVerModal}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className={`rounded-2xl border p-5 ${theme === 'dark' ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex flex-col items-center text-center mb-5">
                <div
                  className={`w-20 h-20 rounded-full border flex items-center justify-center text-2xl font-black ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {socioViendo.iniciales || '?'}
                </div>
                <h3 className={`mt-3 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{socioViendo.nombre}</h3>
                {estadoBadge(socioViendo)}
              </div>
              <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                <p><span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>DNI:</span> {socioViendo.dni || '—'}</p>
                <p><span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('email')}:</span> {socioViendo.mail || '—'}</p>
                <p><span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('phone')}:</span> {socioViendo.tel || '—'}</p>
                <p><span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('currentPlan')}:</span> {socioViendo.plan || '—'}</p>
                <p><span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('remainingDays')}:</span> {diasLabel(socioViendo)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeVerModal}
              className={`mt-5 w-full py-3 rounded-xl font-bold transition-all ${
                theme === 'dark'
                  ? 'border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ACCENT = {
  slate: 'from-slate-500/20 to-slate-600/5 border-slate-500/25 text-slate-300',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/25 text-emerald-300',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/25 text-amber-300',
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/25 text-blue-300',
};

const StatCard = ({ theme, title, value, sub, icon: Icon, accent }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border bg-linear-to-br p-6 ${
      theme === 'dark' ? `${ACCENT[accent]}` : 'bg-white border-slate-200 shadow-md text-slate-700'
    }`}
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </p>
        <p className={`text-4xl font-black leading-none tabular-nums ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        <p className={`text-xs font-medium mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-black/25 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
        <Icon size={24} className="opacity-90" />
      </div>
    </div>
  </div>
);

const SocioFormModal = ({ theme, t, title, formData, setFormData, onClose, onSubmit, submitLabel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
    <div
      className={`w-full max-w-lg rounded-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'
      }`}
    >
      <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          <UserPlus className="text-blue-500" size={22} />
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          aria-label={t('close')}
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('fullName')}
            </label>
            <input
              required
              type="text"
              placeholder="Ej. Ana García"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              DNI
            </label>
            <input
              required
              type="text"
              placeholder="Sin puntos"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('phone')}
            </label>
            <input
              required
              type="text"
              placeholder="+54 9 ..."
              value={formData.tel}
              onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('email')}
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.mail}
              onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={`block text-[11px] font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('selectedPlan')}
            </label>
            <div className="relative">
              <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
              <select
                required
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className={`sm:col-span-2 flex items-center gap-3 rounded-xl border px-4 py-3 ${
              theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <input
              id="apto-fisico"
              type="checkbox"
              checked={formData.apto}
              onChange={(e) => setFormData({ ...formData, apto: e.target.checked })}
              className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="apto-fisico" className={`text-sm flex items-center gap-2 cursor-pointer select-none ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              <ShieldCheck size={16} className="text-emerald-500" />
              {t('medicalFit')}
            </label>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
              theme === 'dark'
                ? 'text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                : 'text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export { getDiasByPlan, normalizePlanOption };

export default Socios;
