import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useGym } from '../context/GymContext';
import { supabase } from '../lib/supabase';
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Users, Activity, DollarSign,
  UserPlus, BadgePercent, Award, Loader2,
} from 'lucide-react';

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORS_DONUT = ['#10b981', '#f97316', '#64748b']; // activos, vencidos, otros

// ─── Tooltip personalizado para el LineChart ─────────────────────────────────
const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-lg font-black text-emerald-400">
        S/ {Number(payload[0].value).toLocaleString('es-PE')}
      </p>
    </div>
  );
};

CustomLineTooltip.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.number })),
  label:   PropTypes.string,
};

// ─── Tooltip para Donut ───────────────────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-bold text-white">{payload[0].name}</p>
      <p className="text-lg font-black" style={{ color: payload[0].payload.fill }}>
        {payload[0].value} socios
      </p>
    </div>
  );
};

CustomPieTooltip.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name:    PropTypes.string,
      value:   PropTypes.number,
      payload: PropTypes.shape({ fill: PropTypes.string }),
    })
  ),
};

// ─── Datos demo (se usan cuando la BD está vacía) ─────────────────────────────
const DEMO_INGRESOS_MESES = [
  { mes: 'Ene', ingresos: 4200 },
  { mes: 'Feb', ingresos: 5800 },
  { mes: 'Mar', ingresos: 5100 },
  { mes: 'Abr', ingresos: 7300 },
  { mes: 'May', ingresos: 6800 },
  { mes: 'Jun', ingresos: 9200 },
];

const DEMO_PLANES = [
  { concepto: 'Plan Mensual',         cantidad: 24, total: 2880 },
  { concepto: 'Plan Trimestral',      cantidad: 12, total: 3600 },
  { concepto: 'Plan Semestral',       cantidad: 7,  total: 4200 },
  { concepto: 'Matrícula',            cantidad: 18, total: 900  },
  { concepto: 'Plan Anual Premium',   cantidad: 3,  total: 2700 },
];

// ─────────────────────────────────────────────────────────────────────────────

const Metricas = () => {
  const { socios, asistencias, dashboardMetrics, theme } = useGym();
  const [ventasLive, setVentasLive] = useState([]);
  const [cargando, setCargando]     = useState(true);

  // ── Cargar ventas con suscripción realtime ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const cargarVentas = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (!error) setVentasLive(data ?? []);
      setCargando(false);
    };

    void cargarVentas();

    const channel = supabase
      .channel('metricas-ventas-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, () => {
        void cargarVentas();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Cálculos de socios ────────────────────────────────────────────────────
  const sociosActivos = useMemo(
    () => socios.filter((s) => s.estado === 'Activo').length,
    [socios]
  );
  const sociosVencidos = useMemo(
    () => socios.filter((s) => s.estado === 'Vencida' || s.estado === 'Vencido').length,
    [socios]
  );
  const sociosOtros = Math.max(0, socios.length - sociosActivos - sociosVencidos);

  const tasaRetencion = socios.length
    ? ((sociosActivos / socios.length) * 100).toFixed(1)
    : '0.0';

  const { ingresosEsteMes, nuevosEsteMes } = dashboardMetrics;

  // ── Gráfico de líneas: evolución de ingresos últimos 6 meses ─────────────
  const dataLinea = useMemo(() => {
    const ahora = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const mes = d.toLocaleDateString('es-PE', { month: 'short' });
      const total = ventasLive
        .filter((v) => {
          if ((v.tipo ?? 'ingreso').toLowerCase() !== 'ingreso') return false;
          const fd = new Date(v.created_at ?? v.fecha ?? '');
          return !Number.isNaN(fd.getTime()) && fd.getFullYear() === yr && fd.getMonth() === mo;
        })
        .reduce((acc, v) => acc + Number(v.monto ?? 0), 0);
      return { mes, ingresos: total };
    });
  }, [ventasLive]);

  const usarDemoLinea = ventasLive.length === 0;

  // ── Donut: estado de la cartera ───────────────────────────────────────────
  const dataDonut = useMemo(() => {
    const items = [
      { name: 'Activos',  value: sociosActivos,  fill: COLORS_DONUT[0] },
      { name: 'Vencidos', value: sociosVencidos, fill: COLORS_DONUT[1] },
    ];
    if (sociosOtros > 0) items.push({ name: 'Otros', value: sociosOtros, fill: COLORS_DONUT[2] });
    return items.filter((d) => d.value > 0);
  }, [sociosActivos, sociosVencidos, sociosOtros]);

  // ── Tabla: planes más vendidos ────────────────────────────────────────────
  const planesMasVendidos = useMemo(() => {
    if (ventasLive.length === 0) return DEMO_PLANES;

    const map = new Map();
    ventasLive
      .filter((v) => (v.tipo ?? 'ingreso').toLowerCase() === 'ingreso')
      .forEach((v) => {
        const key = (v.concepto ?? 'Sin concepto').slice(0, 45); // truncar conceptos muy largos
        const prev = map.get(key) ?? { concepto: key, cantidad: 0, total: 0 };
        map.set(key, { concepto: key, cantidad: prev.cantidad + 1, total: prev.total + Number(v.monto ?? 0) });
      });

    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [ventasLive]);

  const maxTotalPlan = planesMasVendidos[0]?.total ?? 1;

  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`p-6 md:p-8 space-y-8 min-h-full ${theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-700/40 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Métricas y Análisis</h1>
          <p className={`text-sm font-medium mt-1 ${textSecondary}`}>
            Tablero de inteligencia de negocio · datos en tiempo real
          </p>
        </div>
        {cargando && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 size={14} className="animate-spin" /> Actualizando...
          </div>
        )}
      </div>

      {/* ── FILA 1: 4 KPIs estratégicos ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Ingresos del Mes"
          value={`S/ ${Number(ingresosEsteMes ?? 0).toLocaleString('es-PE')}`}
          icon={DollarSign}
          accent="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
          theme={theme}
        />
        <KpiCard
          title="Socios Activos"
          value={sociosActivos}
          icon={Users}
          accent="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
          theme={theme}
        />
        <KpiCard
          title="Tasa de Retención"
          value={`${tasaRetencion}%`}
          icon={BadgePercent}
          accent="text-purple-400"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
          theme={theme}
        />
        <KpiCard
          title="Nuevos Socios"
          value={nuevosEsteMes ?? 0}
          sub="Este mes"
          icon={UserPlus}
          accent="text-cyan-400"
          bg="bg-cyan-500/10"
          border="border-cyan-500/20"
          theme={theme}
        />
      </div>

      {/* ── FILA 2: LineChart (60%) + Donut (40%) ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Gráfico de líneas — Evolución de ingresos (6 meses) */}
        <section className={`xl:col-span-3 rounded-2xl border p-5 ${theme === 'dark' ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200 shadow-md'}`}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Evolución de Ingresos</h2>
            <span className={`text-xs font-semibold ${textSecondary}`}>Últimos 6 meses</span>
          </div>
          {usarDemoLinea && (
            <p className="text-xs text-amber-400/70 mb-3 font-medium">Vista de ejemplo — sin ventas reales registradas</p>
          )}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usarDemoLinea ? DEMO_INGRESOS_MESES : dataLinea} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e3a2f' : '#d1fae5'} vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `S/${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                  width={56}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Gráfico de dona — Estado de la cartera */}
        <section className={`xl:col-span-2 rounded-2xl border p-5 flex flex-col ${theme === 'dark' ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200 shadow-md'}`}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Estado de la Cartera</h2>
            <Users className={textSecondary} size={18} />
          </div>
          <p className={`text-xs font-semibold mb-3 ${textSecondary}`}>{socios.length} socios totales</p>

          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDonut.length ? dataDonut : [{ name: 'Sin datos', value: 1, fill: '#334155' }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="52%"
                  paddingAngle={3}
                >
                  {(dataDonut.length ? dataDonut : [{ fill: '#334155' }]).map((entry, i) => (
                    <Cell key={i} fill={entry.fill ?? COLORS_DONUT[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span className="text-xs font-semibold text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda numérica */}
          <div className="flex justify-around mt-2 pt-3 border-t border-gray-800">
            <Stat label="Activos"  value={sociosActivos}  color="text-emerald-400" />
            <Stat label="Vencidos" value={sociosVencidos} color="text-orange-400" />
            {sociosOtros > 0 && <Stat label="Otros" value={sociosOtros} color="text-gray-400" />}
          </div>
        </section>
      </div>

      {/* ── FILA 3: Tabla de planes más vendidos ──────────────────────── */}
      <section className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className={`p-5 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-800 bg-[#141b2d]/50' : 'border-slate-100'}`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award size={20} className="text-yellow-400" /> Conceptos / Planes más Vendidos
          </h2>
          {ventasLive.length === 0 && (
            <span className="text-xs text-amber-400/70 font-semibold">Vista de ejemplo</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-gray-500 bg-gray-900/20' : 'text-slate-400 bg-slate-50'}`}>
                <th className="p-4 pl-6">#</th>
                <th className="p-4">Plan / Concepto</th>
                <th className="p-4 text-center">Ventas</th>
                <th className="p-4 text-right">Total Recaudado</th>
                <th className="p-4 pr-6 w-40">Participación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {planesMasVendidos.map((plan, idx) => {
                const pct = Math.round((plan.total / maxTotalPlan) * 100);
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <tr key={plan.concepto} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="text-base">{medals[idx] ?? <span className="text-gray-500 font-bold text-sm">{idx + 1}</span>}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-sm text-gray-200 max-w-xs truncate" title={plan.concepto}>
                        {plan.concepto}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        {plan.cantidad}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-black text-emerald-400">
                        S/ {Number(plan.total).toLocaleString('es-PE')}
                      </p>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-bold w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const KpiCard = ({ title, value, sub, icon: Icon, accent, bg, border, theme }) => (
  <div className={`rounded-2xl border p-5 ${theme === 'dark' ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-slate-200 shadow-md'}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl border ${bg} ${border}`}>
        <Icon size={20} className={accent} />
      </div>
    </div>
    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
      {title}
    </p>
    <p className={`text-3xl font-black leading-none ${accent}`}>{value}</p>
    {sub && <p className={`text-xs mt-1.5 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
  </div>
);

const Stat = ({ label, value, color }) => (
  <div className="text-center">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 font-semibold mt-0.5">{label}</p>
  </div>
);

KpiCard.propTypes = {
  title:  PropTypes.string.isRequired,
  value:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub:    PropTypes.string,
  icon:   PropTypes.elementType.isRequired,
  accent: PropTypes.string.isRequired,
  bg:     PropTypes.string.isRequired,
  border: PropTypes.string.isRequired,
  theme:  PropTypes.string.isRequired,
};

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
};

export default Metricas;
