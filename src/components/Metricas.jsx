import React, { useMemo } from 'react';
import { useGym } from '../context/GymContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users, Activity, DollarSign } from 'lucide-react';

const PLACEHOLDER_VENTAS = [
  { label: 'Lun', ingresos: 180 },
  { label: 'Mar', ingresos: 240 },
  { label: 'Mie', ingresos: 210 },
  { label: 'Jue', ingresos: 290 },
  { label: 'Vie', ingresos: 360 },
  { label: 'Sab', ingresos: 320 },
  { label: 'Dom', ingresos: 260 },
];

const Metricas = () => {
  const { socios, ventas, asistencias, theme, t } = useGym();

  const tx = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const totalIngresos = useMemo(
    () => ventas.reduce((acc, venta) => acc + (Number(venta.monto) || 0), 0),
    [ventas]
  );

  const sociosActivos = useMemo(
    () => socios.filter((s) => s.estado === 'Activo'),
    [socios]
  );

  const sociosVencidos = useMemo(
    () => socios.filter((s) => s.estado === 'Vencida' || s.estado === 'Vencido'),
    [socios]
  );

  const dataEstadoSocios = useMemo(
    () => [
      { name: tx('activeStatus', 'Activos'), value: sociosActivos.length },
      { name: tx('expiredStatus', 'Vencidos'), value: sociosVencidos.length },
    ],
    [sociosActivos.length, sociosVencidos.length]
  );

  const dataVentas = useMemo(() => {
    if (!ventas.length) return PLACEHOLDER_VENTAS;

    return ventas
      .slice(0, 7)
      .reverse()
      .map((venta, index) => ({
        label: venta.fecha || `Día ${index + 1}`,
        ingresos: Number(venta.monto) || 0,
      }));
  }, [ventas]);

  const totalSocios = socios.length;
  const tasaRetencion = totalSocios
    ? ((sociosActivos.length / totalSocios) * 100).toFixed(1)
    : '0.0';

  const formatSoles = (value) => `S/ ${Number(value || 0).toLocaleString()}`;

  const cardClass =
    theme === 'dark'
      ? 'bg-[#1e293b] border-gray-800'
      : 'bg-white border-slate-200 shadow-md';

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const barColor = theme === 'dark' ? '#38bdf8' : '#0284c7';
  const pieColors = ['#10b981', '#f97316'];

  return (
    <div
      className={`p-6 md:p-8 space-y-8 min-h-full ${
        theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="border-b border-slate-700/40 pb-5">
        <h1 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>
          {tx('metricsAnalysis', 'Métricas y Análisis')}
        </h1>
        <p className={`text-sm font-medium mt-1 ${textSecondary}`}>
          {tx('metricsSubtitle', 'Tablero analítico en tiempo real de Nexus-Q')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title={tx('totalIncome', 'Ingresos Totales')}
          value={formatSoles(totalIngresos)}
          icon={DollarSign}
          theme={theme}
        />
        <KpiCard
          title={tx('todayAttendances', 'Asistencias de Hoy')}
          value={asistencias.length}
          icon={Activity}
          theme={theme}
        />
        <KpiCard
          title={tx('retentionRate', 'Tasa de Retención')}
          value={`${tasaRetencion}%`}
          icon={TrendingUp}
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className={`rounded-2xl border p-5 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              {tx('incomeFlow', 'Flujo de Ingresos')}
            </h2>
            <span className={`text-xs font-medium ${textSecondary}`}>
              {tx('lastRecords', 'Últimos registros')}
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataVentas}>
                <XAxis
                  dataKey="label"
                  stroke={axisColor}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  stroke={axisColor}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={(value) => `S/${value}`}
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.16)' }}
                  formatter={(value) => [formatSoles(value), tx('totalIncome', 'Ingresos Totales')]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="ingresos"
                  name={tx('income', 'Ingresos')}
                  radius={[8, 8, 0, 0]}
                  fill={barColor}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`rounded-2xl border p-5 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              {tx('memberStatusRatio', 'Proporción de Estado de Socios')}
            </h2>
            <Users className={textSecondary} size={18} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataEstadoSocios}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={4}
                  label
                >
                  {dataEstadoSocios.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, tx('members', 'Socios')]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, theme }) => (
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
        <Icon size={20} className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} />
      </div>
    </div>
    <p className={`text-3xl font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {value}
    </p>
  </div>
);

export default Metricas;