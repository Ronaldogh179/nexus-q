import React, { useMemo, useState } from 'react';
import { useGym } from '../context/GymContext';
import { Tags, Plus, Edit, Trash2, Check, X, Calendar } from 'lucide-react';

const DEFAULT_FEATURES = [
  'Clases de baile en horarios asignados',
  'Vestuarios y duchas',
  'Entrenador personalizado',
  'Plan de entrenamiento',
];

const emptyForm = () => ({
  nombre: '',
  precio: 100,
  duracion: '1 Mes',
  estado: 'Activo',
  caracteristicas: [...DEFAULT_FEATURES],
});

const Planes = () => {
  const { planes, agregarPlan, editarPlan, eliminarPlan, theme, t } = useGym();
  const [showModal, setShowModal] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [featuresText, setFeaturesText] = useState(DEFAULT_FEATURES.join(', '));

  const planesOrdenados = useMemo(
    () => [...planes].sort((a, b) => Number(a.id) - Number(b.id)),
    [planes]
  );

  const openCrearModal = () => {
    setPlanEditando(null);
    const base = emptyForm();
    setFormData(base);
    setFeaturesText(base.caracteristicas.join(', '));
    setShowModal(true);
  };

  const openEditarModal = (plan) => {
    setPlanEditando(plan);
    const normalized = {
      ...plan,
      caracteristicas: plan.caracteristicas?.length ? plan.caracteristicas : [...DEFAULT_FEATURES],
    };
    setFormData(normalized);
    setFeaturesText(normalized.caracteristicas.join(', '));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPlanEditando(null);
    setFormData(emptyForm());
    setFeaturesText(DEFAULT_FEATURES.join(', '));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const featuresList = featuresText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      nombre: formData.nombre.trim(),
      precio: Number(formData.precio) || 0,
      duracion: formData.duracion,
      estado: formData.estado,
      caracteristicas: featuresList.length ? featuresList : [...DEFAULT_FEATURES],
    };

    if (planEditando) await editarPlan(planEditando.id, payload);
    else await agregarPlan(payload);

    closeModal();
  };

  const handleDelete = async (plan) => {
    const msg = t('deletePlanConfirm').replace('{name}', plan.nombre);
    if (!window.confirm(msg)) return;
    await eliminarPlan(plan.id);
  };

  const cardClass =
    theme === 'dark'
      ? 'bg-[#1e293b] border-gray-800'
      : 'bg-white border-slate-200 shadow-md';

  return (
    <div
      className={`p-6 md:p-8 min-h-full ${
        theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="border-b border-slate-700/40 pb-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Tags className="text-blue-500" size={32} /> {t('plansManagement')}
          </h1>
          <p className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('plansSubtitle')}
          </p>
        </div>
        <button
          onClick={openCrearModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> {t('createNewPlan')}
        </button>
      </div>

      {planesOrdenados.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('noPlans')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {planesOrdenados.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 ${cardClass}`}
            >
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      plan.estado === 'Activo'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}
                  >
                    {plan.estado === 'Activo' ? t('activePlan') : t('inactivePlan')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditarModal(plan)}
                      className={`${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'} transition-colors`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className={`${theme === 'dark' ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'} transition-colors`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className={`text-xl font-bold leading-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {plan.nombre}
                </h3>
                <p className="text-4xl font-black text-blue-500">S/ {Number(plan.precio).toLocaleString()}</p>
                <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Calendar size={14} /> <span>{t('planDuration')}: {plan.duracion}</span>
                </div>
              </div>

              <div className="p-6 flex-1">
                <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  {t('planFeatures')}
                </p>
                <ul className="space-y-3">
                  {plan.caracteristicas?.map((feature, idx) => (
                    <li key={`${plan.id}-f-${idx}`} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-md border overflow-hidden ${cardClass}`}>
            <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Tags size={20} className="text-blue-500" />
                {planEditando ? t('editPlan') : t('createNewPlan')}
              </h2>
              <button
                onClick={closeModal}
                className={`${theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-800 bg-slate-100'} p-1.5 rounded-lg`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Precio (S/)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, precio: e.target.value }))}
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('planDuration')}</label>
                  <select
                    value={formData.duracion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duracion: e.target.value }))}
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option>1 Mes</option>
                    <option>3 Meses</option>
                    <option>6 Meses</option>
                    <option>12 Meses</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value }))}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Activo">{t('activePlan')}</option>
                  <option value="Inactivo">{t('inactivePlan')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('planFeatures')}
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className={`w-full border rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  {t('savePlan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planes;