import React from 'react';
import { Clock, Dumbbell, Eye, Plus, Target, UserPlus } from 'lucide-react';
import { useGym } from '../context/GymContext';

const getBadgeClasses = (nivel, theme) => {
  const isDark = theme === 'dark';

  if (nivel === 'Avanzado') {
    return isDark
      ? 'bg-red-500/15 text-red-300 border-red-500/30'
      : 'bg-red-100 text-red-700 border-red-200';
  }

  if (nivel === 'Intermedio') {
    return isDark
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return isDark
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';
};

const Entrenamiento = () => {
  const { rutinas, theme, t } = useGym();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen p-6 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}
    >
      <div className={`mb-6 border-b pb-5 ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              <Dumbbell className={isDark ? 'text-blue-400' : 'text-blue-600'} size={30} />
              {t('training')}
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('trainingCatalog')}</p>
          </div>

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <Plus size={18} />
            {t('createNewRoutine')}
          </button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t('trainingCatalog')}</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rutinas.map((rutina) => (
            <article
              key={rutina.id}
              className={`rounded-2xl border p-5 transition-all ${theme === 'dark' ? 'bg-[#1e293b] border-gray-800 hover:border-gray-700' : 'bg-white border-slate-200 shadow-md hover:shadow-lg'}`}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold leading-tight">{rutina.nombre}</h3>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${getBadgeClasses(rutina.nivel, theme)}`}>
                  {rutina.nivel}
                </span>
              </div>

              <div className={`mb-5 space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                <p className="flex items-center gap-2">
                  <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('level')}:</span>
                  <span className="font-medium">{rutina.nivel}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
                  <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('duration')}:</span>
                  <span className="font-medium">{rutina.duracion}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Target size={16} className={isDark ? 'text-violet-300' : 'text-violet-600'} />
                  <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('focus')}:</span>
                  <span className="font-medium">{rutina.enfoque}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => window.alert(`${t('viewExercises')}: ${rutina.nombre}`)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                  <Eye size={16} />
                  {t('viewExercises')}
                </button>
                <button
                  type="button"
                  onClick={() => window.alert(`${t('assignToMember')}: ${rutina.nombre}`)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <UserPlus size={16} />
                  {t('assignToMember')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Entrenamiento;