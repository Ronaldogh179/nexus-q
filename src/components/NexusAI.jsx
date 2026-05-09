import React, { useMemo, useState } from 'react';
import { useGym } from '../context/GymContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Bot, Sparkles, TrendingUp, AlertTriangle, Users, ShoppingBag, Send, Zap } from 'lucide-react';

const RECOMENDACIONES = [
  {
    id: 1,
    icon: TrendingUp,
    color: 'blue',
    titulo: 'Promo de Invierno',
    descripcion: 'El 50 % de tus socios están por vencer. Lanza un descuento del 20 % en planes trimestrales esta semana.',
    impacto: 'Alto',
  },
  {
    id: 2,
    icon: AlertTriangle,
    color: 'amber',
    titulo: 'Seguimiento WhatsApp',
    descripcion: 'Envía recordatorios automáticos a los socios con membresía vencida antes de que superen los 14 días.',
    impacto: 'Alto',
  },
  {
    id: 3,
    icon: Users,
    color: 'green',
    titulo: 'Referidos',
    descripcion: 'Los socios activos son tu mejor canal. Ofrece 1 semana gratis por cada referido que pague su primer mes.',
    impacto: 'Medio',
  },
  {
    id: 4,
    icon: ShoppingBag,
    color: 'purple',
    titulo: 'Combo Suplementos',
    descripcion: 'Los martes y jueves hay mayor afluencia. Coloca los productos más vendidos en el mostrador esos días.',
    impacto: 'Medio',
  },
];

const IMPACT_COLORS = {
  Alto: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Medio: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

const BAR_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#f97316'];

export default function NexusAI() {
  const { socios, ventas, dashboardMetrics, theme } = useGym();
  const [input, setInput] = useState('');

  const hoy = new Date();

  // Últimos 7 días de ingresos para el mini-gráfico
  const chartData = useMemo(() => {
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    });
    const sums = new Map(labels.map((l) => [l, 0]));
    (ventas ?? []).forEach((v) => {
      if ((v.tipo ?? 'ingreso').toLowerCase() !== 'ingreso') return;
      const raw = v.created_at ?? v.fecha;
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;
      const lbl = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      if (sums.has(lbl)) sums.set(lbl, sums.get(lbl) + Number(v.monto ?? 0));
    });
    return labels.map((l) => ({ label: l, ingresos: sums.get(l) ?? 0 }));
  }, [ventas]);

  const porcentajeVencidos = dashboardMetrics.totalSocios
    ? Math.round((dashboardMetrics.sociosVencidos / dashboardMetrics.totalSocios) * 100)
    : 0;

  const fechaFormateada = hoy.toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className={`min-h-full flex flex-col ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-slate-50'}`}>

      {/* HEADER */}
      <div className={`px-6 md:px-8 pt-8 pb-5 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Bot size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Nexus-AI
            </h1>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Asistente inteligente · {fechaFormateada}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            En línea
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">

        {/* BURBUJA DE BIENVENIDA */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <Bot size={18} className="text-white" />
          </div>
          <div className={`rounded-2xl rounded-tl-none px-5 py-4 shadow-md max-w-xl ${theme === 'dark' ? 'bg-[#1e293b] border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Nexus-AI</span>
            </div>
            <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              Hola <span className="text-blue-400 font-bold">Ronaldo</span>, soy tu asistente de Nexus-Q.
              Hoy el{' '}
              <span className={`font-black ${porcentajeVencidos >= 40 ? 'text-red-400' : 'text-amber-400'}`}>
                {porcentajeVencidos}% de tus socios
              </span>{' '}
              están por vencer o ya vencieron. Te recomiendo lanzar una{' '}
              <span className="text-green-400 font-bold">promo de invierno</span> para recuperarlos antes de que se vayan.
            </p>
          </div>
        </div>

        {/* MINI KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {[
            { label: 'Socios Activos', value: dashboardMetrics.sociosActivos, color: 'text-green-400' },
            { label: 'Membresías Vencidas', value: dashboardMetrics.sociosVencidos, color: 'text-red-400' },
            { label: 'Ingresos del Mes', value: `S/ ${(dashboardMetrics.ingresosEsteMes ?? 0).toLocaleString('es-PE')}`, color: 'text-blue-400' },
            { label: 'Asistencias Hoy', value: dashboardMetrics.asistenciasHoy ?? 0, color: 'text-purple-400' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                {kpi.label}
              </p>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* MINI GRÁFICO DE INGRESOS */}
        <div className={`rounded-2xl border p-5 max-w-3xl ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Flujo de Ingresos — Últimos 7 días
            </h3>
            <Zap size={16} className="text-blue-400" />
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `S/${v}`}
                />
                <Tooltip
                  formatter={(v) => [`S/ ${Number(v).toLocaleString('es-PE')}`, 'Ingresos']}
                  contentStyle={{
                    borderRadius: '10px',
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(148,163,184,0.07)' }}
                />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECOMENDACIONES */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-blue-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Recomendaciones de Nexus-AI
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECOMENDACIONES.map((rec) => {
              const Icon = rec.icon;
              const impact = IMPACT_COLORS[rec.impacto];
              return (
                <div
                  key={rec.id}
                  className={`rounded-xl border p-4 flex flex-col gap-2 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-${rec.color}-500/10 flex items-center justify-center`}>
                        <Icon size={16} className={`text-${rec.color}-400`} />
                      </div>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        {rec.titulo}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${impact.bg} ${impact.text} ${impact.border} whitespace-nowrap`}>
                      {rec.impacto}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {rec.descripcion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* INPUT ESTÉTICO (simulado) */}
      <div className={`border-t px-6 py-4 ${theme === 'dark' ? 'bg-[#0d1117] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <Bot size={16} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale algo a Nexus-AI... (próximamente)"
            className={`flex-1 bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-slate-300 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
          />
          <button
            type="button"
            onClick={() => setInput('')}
            className="w-8 h-8 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 flex items-center justify-center transition-colors"
          >
            <Send size={14} className="text-blue-400" />
          </button>
        </div>
        <p className={`text-center text-[10px] mt-2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
          Nexus-AI · Powered by Nexus-Q · Solo lectura de datos reales
        </p>
      </div>
    </div>
  );
}
