import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dumbbell, Search, Plus, X, Save, ChevronDown,
  CheckCircle2, Loader2, ClipboardList, Layers,
  BarChart2, Repeat2, Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGym } from '../context/GymContext';
import { useToast } from './Toast';

// ─── Constantes ───────────────────────────────────────────────────────────────

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'];

const NIVEL_COLOR = {
  Principiante: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Intermedio:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Avanzado:     'bg-red-500/15 text-red-300 border-red-500/30',
};

const EJERCICIO_VACIO = () => ({ id: Date.now() + Math.random(), nombre: '', series: '', reps: '' });

const FORM_VACIO = { nombre: '', nivel: 'Intermedio', ejercicios: [EJERCICIO_VACIO()] };

// ─── Rutina demo para la vista previa cuando no hay datos reales ──────────────

const RUTINA_DEMO = {
  nombre: 'Hipertrofia Fase 1',
  nivel: 'Intermedio',
  ejercicios: [
    { id: 1, nombre: 'Sentadilla con barra',   series: 4, reps: '8-10' },
    { id: 2, nombre: 'Press de banca plano',    series: 4, reps: '8-10' },
    { id: 3, nombre: 'Peso muerto convencional',series: 3, reps: '6-8'  },
    { id: 4, nombre: 'Remo con barra',          series: 3, reps: '10-12'},
    { id: 5, nombre: 'Press militar de pie',    series: 3, reps: '10-12'},
    { id: 6, nombre: 'Curl de bíceps',          series: 3, reps: '12-15'},
  ],
};

// ─── Sub-componente: fila de ejercicio dentro del formulario ──────────────────

const FilaEjercicio = ({ ejercicio, idx, onChange, onRemove, disabled }) => (
  <div className="flex items-center gap-2 group animate-in slide-in-from-top-1 duration-200">
    <span className="text-xs font-bold text-gray-600 w-5 text-center shrink-0">{idx + 1}</span>

    <input
      type="text"
      placeholder="Nombre del ejercicio"
      value={ejercicio.nombre}
      onChange={(e) => onChange(ejercicio.id, 'nombre', e.target.value)}
      disabled={disabled}
      className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
    />

    <input
      type="number"
      min="1"
      max="20"
      placeholder="Series"
      value={ejercicio.series}
      onChange={(e) => onChange(ejercicio.id, 'series', e.target.value)}
      disabled={disabled}
      className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-blue-500 disabled:opacity-40"
    />

    <input
      type="text"
      placeholder="Reps"
      value={ejercicio.reps}
      onChange={(e) => onChange(ejercicio.id, 'reps', e.target.value)}
      disabled={disabled}
      className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-blue-500 disabled:opacity-40"
    />

    <button
      type="button"
      onClick={() => onRemove(ejercicio.id)}
      disabled={disabled}
      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:hidden"
      title="Eliminar ejercicio"
    >
      <X size={14} />
    </button>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const Entrenamiento = () => {
  const { socios, loading: sociosLoading } = useGym();
  const { addToast } = useToast();

  // Buscador de socio
  const [busqueda, setBusqueda]           = useState('');
  const [showDropdown, setShowDropdown]   = useState(false);
  const [socioActivo, setSocioActivo]     = useState(null);

  // Formulario de rutina
  const [form, setForm]                   = useState(FORM_VACIO);
  const [guardando, setGuardando]         = useState(false);

  // Rutina guardada en BD para el socio activo
  const [rutinaGuardada, setRutinaGuardada] = useState(null);
  const [cargandoRutina, setCargandoRutina] = useState(false);

  // ── Filtrado de socios ──────────────────────────────────────────────────
  const sociosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return socios.slice(0, 8);
    const q = busqueda.toLowerCase();
    return socios
      .filter((s) =>
        s.nombre.toLowerCase().includes(q) ||
        String(s.dni ?? '').includes(busqueda.trim())
      )
      .slice(0, 8);
  }, [socios, busqueda]);

  // ── Seleccionar socio ───────────────────────────────────────────────────
  const seleccionarSocio = (socio) => {
    setSocioActivo(socio);
    setBusqueda(socio.nombre);
    setShowDropdown(false);
    setRutinaGuardada(null);
    setForm(FORM_VACIO);
    void cargarRutina(socio.id);
  };

  // ── Cargar rutina del socio desde Supabase ──────────────────────────────
  const cargarRutina = useCallback(async (socioId) => {
    setCargandoRutina(true);
    const { data, error } = await supabase
      .from('rutinas')
      .select('*')
      .eq('socio_id', socioId)
      .maybeSingle();
    setCargandoRutina(false);
    if (error) { console.warn('[Entrenamiento]', error.message); return; }
    if (data) {
      setRutinaGuardada(data);
      // Pre-cargar el formulario con la rutina existente para edición
      setForm({
        nombre:     data.nombre,
        nivel:      data.nivel,
        ejercicios: (data.ejercicios ?? []).map((e, i) => ({ ...e, id: i + Date.now() })),
      });
    }
  }, []);

  // ── Helpers del formulario ──────────────────────────────────────────────
  const agregarEjercicio = () =>
    setForm((prev) => ({ ...prev, ejercicios: [...prev.ejercicios, EJERCICIO_VACIO()] }));

  const actualizarEjercicio = (id, campo, valor) =>
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.map((e) => e.id === id ? { ...e, [campo]: valor } : e),
    }));

  const eliminarEjercicio = (id) =>
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((e) => e.id !== id),
    }));

  // ── Guardar / asignar rutina ────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!socioActivo) { addToast({ message: 'Selecciona un socio primero.', type: 'warning' }); return; }
    if (!form.nombre.trim()) { addToast({ message: 'El nombre del plan es obligatorio.', type: 'warning' }); return; }

    const ejerciciosValidos = form.ejercicios.filter((e) => e.nombre.trim());
    if (ejerciciosValidos.length === 0) { addToast({ message: 'Agrega al menos un ejercicio con nombre.', type: 'warning' }); return; }

    setGuardando(true);

    const payload = {
      socio_id:   socioActivo.id,
      nombre:     form.nombre.trim(),
      nivel:      form.nivel,
      ejercicios: ejerciciosValidos.map(({ nombre, series, reps }) => ({
        nombre,
        series: Number(series) || 3,
        reps:   reps || '10',
      })),
      updated_at: new Date().toISOString(),
    };

    // upsert por socio_id — crea si no existe, actualiza si ya existe
    const { data: nueva, error } = await supabase
      .from('rutinas')
      .upsert([payload], { onConflict: 'socio_id' })
      .select()
      .single();

    setGuardando(false);
    if (error) { addToast({ message: `Error al guardar: ${error.message}`, type: 'error' }); return; }

    setRutinaGuardada(nueva);
    addToast({ message: `Rutina "${nueva.nombre}" asignada a ${socioActivo.nombre}.`, type: 'success' });
  };

  // ── Vista de la rutina en el panel derecho ──────────────────────────────
  const rutinaVisible  = rutinaGuardada ?? (socioActivo ? RUTINA_DEMO : null);
  const esDemo         = !rutinaGuardada && socioActivo != null;

  const disabled = !socioActivo;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col gap-6">

      {/* ── CABECERA ──────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="text-blue-400" size={32} /> Entrenamiento
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            Crea y asigna rutinas personalizadas a cada socio.
          </p>
        </div>

        {/* Buscador de socios */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={sociosLoading ? 'Cargando socios...' : 'Buscar socio por nombre o DNI...'}
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            disabled={sociosLoading}
            className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:border-blue-500 text-sm transition-colors disabled:opacity-50"
          />
          <ChevronDown className="absolute right-4 top-3.5 text-gray-500" size={16} />

          {showDropdown && !sociosLoading && socios.length > 0 && (
            <ul className="absolute z-30 w-full mt-1 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
              {sociosFiltrados.length > 0 ? (
                sociosFiltrados.map((s) => (
                  <li key={s.id}>
                    <button
                      onMouseDown={() => seleccionarSocio(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-900/40 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {s.iniciales ?? s.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{s.nombre}</p>
                        <p className="text-xs text-gray-500">{s.dni ? `DNI: ${s.dni}` : s.plan ?? '—'}</p>
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500">No se encontraron socios.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* ── CUERPO: FORMULARIO (izquierda) + VISUALIZADOR (derecha) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">

        {/* ── PANEL IZQUIERDO: Creador de rutina ───────────────────────── */}
        <div className="lg:col-span-2 flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">

          {/* Header formulario */}
          <div className="p-5 border-b border-gray-800 bg-[#141b2d]/50">
            <h2 className="text-white font-bold flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-400" />
              {socioActivo ? `Rutina de ${socioActivo.nombre.split(' ')[0]}` : 'Crear Rutina'}
            </h2>
            {!socioActivo && (
              <p className="text-xs text-gray-500 mt-1">Selecciona un socio para habilitar el formulario.</p>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto p-5 space-y-5 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>

            {/* Nombre + Nivel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <Layers size={12} /> Nombre del Plan *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Hipertrofia Fase 1"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  disabled={disabled}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <BarChart2 size={12} /> Nivel
                </label>
                <div className="flex gap-2">
                  {NIVELES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, nivel: n }))}
                      disabled={disabled}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        form.nivel === n
                          ? NIVEL_COLOR[n]
                          : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de ejercicios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Dumbbell size={12} /> Ejercicios
                </label>
                {/* Encabezados de columnas */}
                <div className="flex gap-2 text-[10px] font-bold text-gray-600 uppercase">
                  <span className="w-16 text-center">Series</span>
                  <span className="w-20 text-center">Reps</span>
                  <span className="w-6" />
                </div>
              </div>

              <div className="space-y-2">
                {form.ejercicios.map((ej, idx) => (
                  <FilaEjercicio
                    key={ej.id}
                    ejercicio={ej}
                    idx={idx}
                    onChange={actualizarEjercicio}
                    onRemove={eliminarEjercicio}
                    disabled={disabled}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={agregarEjercicio}
                disabled={disabled}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={15} /> Agregar Ejercicio
              </button>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="p-4 border-t border-gray-800 bg-[#141b2d]/30 shrink-0">
            <button
              onClick={handleGuardar}
              disabled={guardando || disabled}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {guardando
                ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                : <><Save size={16} /> Guardar y Asignar Rutina</>}
            </button>
          </div>
        </div>

        {/* ── PANEL DERECHO: Visualizador ──────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">

          <div className="p-5 border-b border-gray-800 bg-[#141b2d]/50 flex items-center justify-between shrink-0">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              Rutina Asignada Actualmente
            </h2>
            {cargandoRutina && <Loader2 size={16} className="animate-spin text-gray-500" />}
            {esDemo && (
              <span className="text-xs text-amber-400/70 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                Vista de ejemplo
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!socioActivo ? (
              /* Estado vacío — sin socio */
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-16">
                <Dumbbell size={64} className="mb-4 text-gray-500" />
                <p className="text-lg font-bold text-gray-400">Selecciona un socio</p>
                <p className="text-sm text-gray-600">Verás aquí su rutina activa o un ejemplo de diseño.</p>
              </div>
            ) : rutinaVisible ? (
              <div className="space-y-6">
                {/* Encabezado de la rutina */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-black text-white leading-tight">{rutinaVisible.nombre}</h3>
                    {socioActivo && (
                      <p className="text-sm text-gray-400 mt-1">
                        Asignada a <span className="text-white font-semibold">{socioActivo.nombre}</span>
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${NIVEL_COLOR[rutinaVisible.nivel] ?? 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                    {rutinaVisible.nivel}
                  </span>
                </div>

                {/* Stats rápidos */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ejercicios', value: rutinaVisible.ejercicios?.length ?? 0, icon: Dumbbell, color: 'text-blue-400' },
                    { label: 'Series tot.', value: (rutinaVisible.ejercicios ?? []).reduce((a, e) => a + (Number(e.series) || 0), 0), icon: Repeat2, color: 'text-purple-400' },
                    { label: 'Nivel',       value: rutinaVisible.nivel?.slice(0, 3) ?? '—', icon: BarChart2, color: 'text-amber-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#0f172a] rounded-xl border border-gray-800 p-3 text-center">
                      <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                      <p className={`text-xl font-black ${color}`}>{value}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Lista de ejercicios */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Dumbbell size={12} /> Plan de ejercicios
                  </h4>
                  <div className="space-y-2">
                    {(rutinaVisible.ejercicios ?? []).map((ej, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-[#0f172a] rounded-xl border border-gray-800 px-4 py-3 group hover:border-gray-700 transition-colors"
                      >
                        {/* Número */}
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 shrink-0">
                          {idx + 1}
                        </div>

                        {/* Nombre */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{ej.nombre}</p>
                        </div>

                        {/* Series × Reps */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Repeat2 size={10} /> {ej.series ?? '—'} series
                          </span>
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                            × {ej.reps ?? '—'} reps
                          </span>
                        </div>

                        <CheckCircle2 size={16} className="text-gray-700 group-hover:text-emerald-500 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Cargando o sin rutina */
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-16">
                <ClipboardList size={48} className="mb-3 text-gray-500" />
                <p className="text-sm text-gray-500">
                  {cargandoRutina ? 'Cargando rutina...' : 'Este socio aún no tiene una rutina asignada.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entrenamiento;
