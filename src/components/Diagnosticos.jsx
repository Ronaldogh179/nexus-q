import React, { useCallback, useMemo, useState } from 'react';
import {
  HeartPulse, Search, User, Activity, Scale, Ruler,
  FileText, Calendar, X, Save, TrendingUp, TrendingDown,
  History, Loader2, Dumbbell, Percent, ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGym } from '../context/GymContext';
import { useToast } from './Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcIMC = (peso, altura) => {
  const p = Number(peso);
  const a = Number(altura) / 100;
  if (!p || !a) return '';
  return String(Math.round((p / (a * a)) * 10) / 10);
};

const imcLabel = (imc) => {
  const v = Number(imc);
  if (!v) return { label: '—', color: 'text-gray-400' };
  if (v < 18.5) return { label: 'Bajo peso', color: 'text-blue-400' };
  if (v < 25)   return { label: 'Normal',    color: 'text-green-400' };
  if (v < 30)   return { label: 'Sobrepeso', color: 'text-orange-400' };
  return           { label: 'Obesidad',    color: 'text-red-400' };
};

const fmtFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Datos demo (se muestran cuando el socio no tiene registros reales) ────────

const DEMO_HISTORIAL = [
  { id: 'demo-1', fecha: '2026-04-15', peso: 82.5, altura: 175, imc: 26.9, grasa_corporal: 22, masa_muscular: 38, notas: 'Inicia rutina de hipertrofia. Leve molestia en rodilla derecha.' },
  { id: 'demo-2', fecha: '2026-05-15', peso: 81.0, altura: 175, imc: 26.4, grasa_corporal: 20, masa_muscular: 39.5, notas: 'Mejora en fuerza base. Bajó % de grasa.' },
  { id: 'demo-3', fecha: '2026-06-15', peso: 79.5, altura: 175, imc: 25.9, grasa_corporal: 18, masa_muscular: 41, notas: 'Excelente progreso. Se recomienda aumentar proteína.' },
];

// ─── Form inicial ─────────────────────────────────────────────────────────────

const FORM_VACIO = {
  fecha: new Date().toISOString().split('T')[0],
  peso: '',
  altura: '',
  imc: '',
  grasa_corporal: '',
  masa_muscular: '',
  notas: '',
};

// ─── Componente ───────────────────────────────────────────────────────────────

const Diagnosticos = () => {
  const { socios, loading: sociosLoading } = useGym();
  const { addToast } = useToast();

  const [busqueda, setBusqueda]       = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [socioActivo, setSocioActivo] = useState(null);

  const [diagnosticos, setDiagnosticos]     = useState([]);
  const [cargandoDiag, setCargandoDiag]     = useState(false);
  const [form, setForm]                     = useState(FORM_VACIO);
  const [guardando, setGuardando]           = useState(false);

  // ── Buscador de socios ────────────────────────────────────────────────────
  // Sin texto: muestra los primeros 8. Con texto: filtra por nombre O DNI.
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

  const seleccionarSocio = (socio) => {
    setSocioActivo(socio);
    setBusqueda(socio.nombre);
    setShowDropdown(false);
    setDiagnosticos([]);
    void cargarDiagnosticos(socio.id);
  };

  // ── Cargar historial ──────────────────────────────────────────────────────
  const cargarDiagnosticos = useCallback(async (socioId) => {
    setCargandoDiag(true);
    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('socio_id', socioId)
      .order('fecha', { ascending: false });
    setCargandoDiag(false);
    if (error) { addToast({ message: `Error al cargar historial: ${error.message}`, type: 'error' }); return; }
    setDiagnosticos(data ?? []);
  }, [addToast]);

  // ── IMC calculado como estado derivado (evita setState en efecto) ───────
  const imcDerivado = useMemo(
    () => (form.peso && form.altura ? calcIMC(form.peso, form.altura) : form.imc),
    [form.peso, form.altura, form.imc],
  );

  const handleField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ── Guardar diagnóstico ───────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!socioActivo) { addToast({ message: 'Selecciona un socio primero.', type: 'warning' }); return; }
    if (!form.peso || !form.altura) { addToast({ message: 'Peso y estatura son obligatorios.', type: 'warning' }); return; }

    setGuardando(true);
    const payload = {
      socio_id:       socioActivo.id,
      peso:           Number(form.peso),
      altura:         Number(form.altura),
      imc:            imcDerivado ? Number(imcDerivado) : null,
      grasa_corporal: form.grasa_corporal ? Number(form.grasa_corporal) : null,
      masa_muscular:  form.masa_muscular  ? Number(form.masa_muscular)  : null,
      notas:          form.notas.trim() || null,
      fecha:          form.fecha,
    };

    // .select().single() devuelve la fila insertada para actualización inmediata
    const { data: nuevo, error } = await supabase
      .from('diagnosticos')
      .insert([payload])
      .select()
      .single();

    setGuardando(false);
    if (error) { addToast({ message: `Error al guardar: ${error.message}`, type: 'error' }); return; }

    // ① Actualización optimista: añadir el nuevo registro al estado local al instante
    //    y re-ordenar por fecha DESC para que los KPIs se actualicen sin recargar.
    if (nuevo) {
      setDiagnosticos((prev) =>
        [nuevo, ...prev].sort((a, b) => {
          const da = new Date(b.fecha ?? b.created_at ?? 0).getTime();
          const db = new Date(a.fecha ?? a.created_at ?? 0).getTime();
          return da - db;
        })
      );
    }

    addToast({ message: 'Diagnóstico registrado correctamente.', type: 'success' });
    setForm(FORM_VACIO);

    // ② Refetch silencioso en background para sincronizar con otros cambios en BD
    void cargarDiagnosticos(socioActivo.id);
  };

  // useMemo garantiza que historialVisible y ultimoRegistro se recalculen
  // reactivamente cada vez que `diagnosticos` cambie (incluyendo el update optimista).
  const historialVisible = useMemo(
    () => diagnosticos.length > 0 ? diagnosticos : (socioActivo ? DEMO_HISTORIAL : []),
    [diagnosticos, socioActivo]
  );
  const esDemo = useMemo(
    () => diagnosticos.length === 0 && socioActivo != null,
    [diagnosticos, socioActivo]
  );
  // Primer elemento = más reciente (la query ya viene ordenada fecha DESC,
  // y el update optimista también re-ordena antes de setear).
  const ultimoRegistro   = historialVisible[0] ?? null;
  const { label: imcStr, color: imcColor } = imcLabel(ultimoRegistro?.imc);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col gap-6">

      {/* ── CABECERA ────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HeartPulse className="text-red-500" size={32} /> Diagnósticos y Evolución
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            Registra mediciones corporales y sigue el progreso físico de cada socio.
          </p>
        </div>

        {/* Buscador / selector de socio */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={sociosLoading ? 'Cargando socios...' : 'Buscar por nombre o DNI...'}
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            // setTimeout permite que onMouseDown del ítem dispare antes del blur
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            disabled={sociosLoading}
            className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:border-red-500 text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
          />
          <ChevronDown className="absolute right-4 top-3.5 text-gray-500" size={16} />

          {/* Dropdown: se abre con o sin texto, mientras haya socios cargados */}
          {showDropdown && !sociosLoading && socios.length > 0 && (
            <ul className="absolute z-30 w-full mt-1 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              {sociosFiltrados.length > 0 ? (
                sociosFiltrados.map((s) => (
                  <li key={s.id}>
                    <button
                      onMouseDown={() => seleccionarSocio(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-900/40 text-red-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {s.iniciales ?? s.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{s.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {s.dni ? `DNI: ${s.dni}` : s.plan ?? '—'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500">
                  No se encontraron socios con "{busqueda}"
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* ── KPIs del último registro (solo si hay socio) ─────────────────────── */}
      {socioActivo && ultimoRegistro && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Peso', value: `${ultimoRegistro.peso} kg`,   icon: Scale,      color: 'text-white' },
            { label: 'Estatura', value: `${ultimoRegistro.altura} cm`, icon: Ruler,   color: 'text-white' },
            { label: 'IMC',  value: ultimoRegistro.imc ?? '—',    icon: Activity,   color: imcColor, sub: imcStr },
            { label: '% Grasa', value: ultimoRegistro.grasa_corporal != null ? `${ultimoRegistro.grasa_corporal}%` : '—', icon: Percent, color: 'text-blue-400' },
            { label: 'Masa Muscular', value: ultimoRegistro.masa_muscular != null ? `${ultimoRegistro.masa_muscular} kg` : '—', icon: Dumbbell, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <Icon size={13} /> {label}
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              {sub && <p className={`text-xs font-semibold ${color} opacity-80`}>{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── CUERPO PRINCIPAL: FORMULARIO + HISTORIAL ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">

        {/* ── PANEL IZQUIERDO: Formulario de nuevo registro ────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">

            {/* Header del formulario */}
            <div className="p-5 border-b border-gray-800 bg-[#141b2d]/50">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Scale size={18} className="text-red-400" /> Nuevo Registro
              </h2>
              {socioActivo ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold">
                    {socioActivo.iniciales ?? socioActivo.nombre.slice(0,2)}
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{socioActivo.nombre}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Selecciona un socio para habilitar</p>
              )}
            </div>

            <div className={`p-5 space-y-4 transition-opacity ${!socioActivo ? 'opacity-40 pointer-events-none' : ''}`}>

              {/* Fecha */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <Calendar size={12} /> Fecha
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => handleField('fecha', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              {/* Peso + Estatura */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Scale size={12} /> Peso (kg) *
                  </label>
                  <input
                    type="number" step="0.1" min="0" placeholder="Ej. 75.5"
                    value={form.peso}
                    onChange={(e) => handleField('peso', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Ruler size={12} /> Estatura (cm) *
                  </label>
                  <input
                    type="number" min="0" placeholder="Ej. 175"
                    value={form.altura}
                    onChange={(e) => handleField('altura', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              {/* IMC (auto-calculado) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <Activity size={12} /> IMC (auto-calculado)
                </label>
                <div className="relative">
                  <input
                    type="number" step="0.1" placeholder="—"
                    value={imcDerivado}
                    onChange={(e) => handleField('imc', e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm pr-24"
                  />
                  {imcDerivado && (
                    <span className={`absolute right-3 top-3 text-xs font-bold ${imcLabel(imcDerivado).color}`}>
                      {imcLabel(imcDerivado).label}
                    </span>
                  )}
                </div>
              </div>

              {/* % Grasa + Masa Muscular */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Percent size={12} /> % Grasa
                  </label>
                  <input
                    type="number" step="0.1" min="0" max="70" placeholder="Ej. 18"
                    value={form.grasa_corporal}
                    onChange={(e) => handleField('grasa_corporal', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Dumbbell size={12} /> Masa Muscular (kg)
                  </label>
                  <input
                    type="number" step="0.1" min="0" placeholder="Ej. 35"
                    value={form.masa_muscular}
                    onChange={(e) => handleField('masa_muscular', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <FileText size={12} /> Notas / Observaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Objetivo: tonificación. Presenta molestia en hombro..."
                  value={form.notas}
                  onChange={(e) => handleField('notas', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 text-sm resize-none"
                />
              </div>

              {/* Botón guardar */}
              <button
                onClick={handleGuardar}
                disabled={guardando || !socioActivo}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {guardando
                  ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                  : <><Save size={16} /> Guardar Diagnóstico</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO: Historial ──────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">

          {/* Header historial */}
          <div className="p-5 border-b border-gray-800 bg-[#141b2d]/50 flex justify-between items-center shrink-0">
            <h2 className="text-white font-bold flex items-center gap-2">
              <History size={18} className="text-gray-400" /> Historial de Evaluaciones
            </h2>
            {socioActivo && (
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                {diagnosticos.length > 0 ? `${diagnosticos.length} registros reales` : 'Vista de ejemplo'}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {!socioActivo ? (
              /* Sin socio seleccionado */
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-16">
                <User size={64} className="mb-4 text-gray-500" />
                <p className="text-lg font-bold text-gray-400">Selecciona un socio</p>
                <p className="text-sm text-gray-600">Usa el buscador de arriba para ver su evolución.</p>
              </div>
            ) : cargandoDiag ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                <Loader2 size={20} className="animate-spin" /> Cargando historial...
              </div>
            ) : (
              <>
                {esDemo && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <Activity size={13} /> Datos de ejemplo — los registros reales aparecerán aquí al guardar.
                  </div>
                )}

                {historialVisible.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 opacity-50">
                    <FileText size={40} className="mx-auto mb-3" />
                    <p className="text-sm">Sin evaluaciones registradas.</p>
                  </div>
                ) : (
                  historialVisible.map((d, idx) => {
                    const { label: imcL, color: imcC } = imcLabel(d.imc);
                    const prevD = historialVisible[idx + 1];
                    const pesoTrend = prevD ? Number(d.peso) - Number(prevD.peso) : null;
                    return (
                      <div key={d.id} className="bg-[#0f172a] rounded-xl border border-gray-800 p-5 relative">
                        {idx === 0 && (
                          <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/30">
                            MÁS RECIENTE
                          </span>
                        )}

                        {/* Fecha + tendencia */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                            <Calendar size={14} /> {fmtFecha(d.fecha)}
                          </div>
                          {pesoTrend !== null && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                              pesoTrend < 0
                                ? 'bg-green-500/15 text-green-400'
                                : pesoTrend > 0
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {pesoTrend < 0 ? <TrendingDown size={11}/> : <TrendingUp size={11}/>}
                              {pesoTrend > 0 ? '+' : ''}{pesoTrend.toFixed(1)} kg vs anterior
                            </span>
                          )}
                        </div>

                        {/* Métricas en grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                          {[
                            { label: 'Peso',     value: d.peso != null ? `${d.peso} kg`   : '—', color: 'text-white'      },
                            { label: 'Estatura', value: d.altura != null ? `${d.altura} cm` : '—', color: 'text-white'    },
                            { label: 'IMC',      value: d.imc ?? '—', color: imcC, sub: imcL       },
                            { label: '% Grasa',  value: d.grasa_corporal != null ? `${d.grasa_corporal}%` : '—', color: 'text-blue-300' },
                            { label: 'Músculo',  value: d.masa_muscular  != null ? `${d.masa_muscular} kg` : '—', color: 'text-purple-300' },
                          ].map(({ label, value, color, sub }) => (
                            <div key={label} className="bg-gray-800/50 rounded-lg p-2.5 text-center">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                              <p className={`text-base font-black ${color}`}>{value}</p>
                              {sub && <p className={`text-[10px] font-semibold ${color} opacity-70`}>{sub}</p>}
                            </div>
                          ))}
                        </div>

                        {/* Notas */}
                        {d.notas && (
                          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <FileText size={10} /> Notas del Entrenador
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">{d.notas}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosticos;
