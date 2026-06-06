import React, { useCallback, useMemo, useState } from 'react';
import { useGym } from '../context/GymContext';
import { Bot, Loader2, Sparkles, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function generarReporte(ingresos, activos, vencidos) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'No se encontró VITE_GEMINI_API_KEY. Verifica el archivo .env en la raíz del proyecto.'
    );
  }

  const prompt =
    `Actúa como un gerente experto de gimnasios. Los datos reales de hoy son: ` +
    `Ingresos de S/ ${ingresos}, ${activos} socios activos, y ${vencidos} socios con membresía vencida. ` +
    `Redacta un análisis gerencial directo y profesional de máximo 3 párrafos. ` +
    `Párrafo 1: Diagnóstico rápido. Párrafo 2 y 3: Dos recomendaciones estratégicas y accionables ` +
    `para recuperar clientes perdidos y aumentar ventas.`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message ?? detail;
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(`No se pudo conectar con Gemini (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!texto) {
    throw new Error('Gemini no devolvió un análisis. Intente de nuevo en unos momentos.');
  }

  return texto;
}

export default function NexusAI() {
  const { dashboardMetrics } = useGym();

  const [reporte, setReporte] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ingresosMes = dashboardMetrics.ingresosEsteMes ?? 0;
  const sociosActivos = dashboardMetrics.sociosActivos ?? 0;
  const sociosVencidos = dashboardMetrics.sociosVencidos ?? 0;

  const ingresosFormateados = useMemo(
    () => ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    [ingresosMes]
  );

  const fechaFormateada = useMemo(
    () =>
      new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const parrafosReporte = useMemo(() => {
    if (!reporte) return [];
    return reporte.split(/\n\s*\n/).filter(Boolean);
  }, [reporte]);

  const handleGenerarAnalisis = useCallback(async () => {
    setLoading(true);
    setError('');
    setReporte('');

    try {
      const texto = await generarReporte(ingresosMes, sociosActivos, sociosVencidos);
      setReporte(texto);
    } catch (err) {
      console.error('[Nexus-AI] Error al generar reporte:', err);
      setError(err.message ?? 'Ocurrió un error al procesar el análisis. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [ingresosMes, sociosActivos, sociosVencidos]);

  const tarjetasResumen = [
    {
      label: 'Ingresos del mes',
      value: `S/ ${ingresosFormateados}`,
      icon: TrendingUp,
      accent: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Socios activos',
      value: sociosActivos,
      icon: Users,
      accent: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Membresías vencidas',
      value: sociosVencidos,
      icon: AlertTriangle,
      accent: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-[#0d1117] text-slate-100">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center">
            <Bot size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Asistente Gerencial Inteligente
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Nexus-AI · Análisis basado en datos reales · {fechaFormateada}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Tarjetas resumen */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Datos analizados por la IA
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tarjetasResumen.map(({ label, value, icon: Icon, accent, iconBg }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-[#161b22] p-5 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg}`}>
                    <Icon size={18} className={accent} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${accent}`}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Acción principal */}
        <section className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleGenerarAnalisis}
            disabled={loading}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-900/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando datos del gimnasio…
              </>
            ) : (
              <>✨ Generar Análisis Gerencial</>
            )}
          </button>

          {loading && (
            <p className="text-sm text-slate-500 animate-pulse">
              Consultando Gemini con los indicadores del negocio…
            </p>
          )}
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300 leading-relaxed"
          >
            {error}
          </div>
        )}

        {/* Reporte Gemini */}
        {reporte && !loading && (
          <section className="rounded-2xl border border-slate-700/80 bg-[#161b22] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <Sparkles size={16} className="text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Análisis Gerencial
              </h2>
            </div>
            <div className="px-6 py-7 md:px-8 md:py-8 space-y-5">
              {parrafosReporte.length > 0 ? (
                parrafosReporte.map((parrafo, idx) => (
                  <p
                    key={idx}
                    className="text-[15px] md:text-base leading-7 md:leading-8 text-slate-300 font-normal"
                  >
                    {parrafo.trim()}
                  </p>
                ))
              ) : (
                <p className="text-[15px] leading-7 text-slate-300 whitespace-pre-wrap">{reporte}</p>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-slate-800 px-6 py-3 text-center">
        <p className="text-[10px] text-slate-600">
          Nexus-AI · Powered by Google Gemini · Datos en vivo desde Nexus-Q
        </p>
      </div>
    </div>
  );
}
