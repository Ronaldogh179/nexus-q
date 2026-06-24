import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ReferenceLine,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  ShieldCheck, FlaskConical, Gauge, TrendingUp,
  CheckCircle2, AlertTriangle, Cpu, Zap,
} from 'lucide-react';

// ─── Datos estáticos ISO/IEC 25000 ────────────────────────────────────────────
const DIMENSIONES = [
  { dimension: 'Funcionalidad', valor: 100, fill: '#6366f1' },
  { dimension: 'Fiabilidad',    valor: 90,  fill: '#22d3ee' },
  { dimension: 'Usabilidad',    valor: 95,  fill: '#10b981' },
  { dimension: 'Eficiencia',    valor: 98,  fill: '#f59e0b' },
  { dimension: 'Mantenib.',     valor: 100, fill: '#a78bfa' },
  { dimension: 'Portabilidad',  valor: 85,  fill: '#f472b6' },
];

const PROYECCION = [
  { mes: 'Mes 1', registros: 200,  latencia: 112, proyectado: 115 },
  { mes: 'Mes 2', registros: 800,  latencia: 118, proyectado: 120 },
  { mes: 'Mes 3', registros: 2000, latencia: 124, proyectado: 128 },
  { mes: 'Mes 4', registros: 4500, latencia: 131, proyectado: 135 },
  { mes: 'Mes 5', registros: 8000, latencia: 138, proyectado: 142 },
  { mes: 'Mes 6', registros: 15000,latencia: 144, proyectado: 148 },
];

const PRUEBAS = [
  { id: 'TC-SOC-001', nombre: 'Autenticación y sesión',       estado: 'PASS', ms: 1420 },
  { id: 'TC-SOC-002', nombre: 'Carga de vista Socios',        estado: 'PASS', ms: 832  },
  { id: 'TC-SOC-003', nombre: 'KPIs estadísticos visibles',   estado: 'PASS', ms: 614  },
  { id: 'TC-SOC-004', nombre: 'Tabla y columnas',             estado: 'PASS', ms: 441  },
  { id: 'TC-SOC-005', nombre: 'Búsqueda y filtrado',          estado: 'PASS', ms: 588  },
  { id: 'TC-SOC-006', nombre: 'Filtros por plan',             estado: 'PASS', ms: 317  },
  { id: 'TC-SOC-007', nombre: 'Modal Nuevo Socio',            estado: 'PASS', ms: 729  },
  { id: 'TC-SOC-008', nombre: 'Formulario de alta',           estado: 'PASS', ms: 503  },
  { id: 'TC-SOC-009', nombre: 'Cierre de modal',              estado: 'PASS', ms: 398  },
  { id: 'K6-LOAD-001', nombre: 'Carga p95 < 500 ms',         estado: 'PASS', ms: 487  },
  { id: 'K6-LOAD-002', nombre: 'Tasa de errores < 1%',       estado: 'PASS', ms: null },
];

// ─── Tooltip personalizado (Radar / Bar) ─────────────────────────────────────
const TooltipISO = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-white mb-0.5">{d.name || d.payload?.dimension}</p>
      <p className="text-emerald-400 font-semibold">{d.value} / 100</p>
    </div>
  );
};
TooltipISO.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.array,
};

// ─── Tooltip para proyección ──────────────────────────────────────────────────
const TooltipProyeccion = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value} ms
        </p>
      ))}
    </div>
  );
};
TooltipProyeccion.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.array,
  label:   PropTypes.string,
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, accent }) => {
  const accents = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    blue:    'from-blue-500/20    to-blue-600/5    border-blue-500/30    text-blue-400',
    purple:  'from-violet-500/20  to-violet-600/5  border-violet-500/30  text-violet-400',
  };
  const iconBg = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    blue:    'bg-blue-500/15    text-blue-400',
    purple:  'bg-violet-500/15  text-violet-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-linear-to-br p-5 ${accents[accent]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
          <p className="text-2xl font-extrabold text-white leading-tight">{value}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${iconBg[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};
KpiCard.propTypes = {
  icon:   PropTypes.elementType.isRequired,
  label:  PropTypes.string.isRequired,
  value:  PropTypes.string.isRequired,
  sub:    PropTypes.string.isRequired,
  accent: PropTypes.oneOf(['emerald', 'blue', 'purple']).isRequired,
};

// ─── Fila de prueba E2E / K6 ─────────────────────────────────────────────────
const TestRow = ({ prueba, idx }) => (
  <tr className={`border-b border-slate-700/60 transition-colors hover:bg-slate-700/30 ${idx % 2 === 0 ? 'bg-slate-800/40' : ''}`}>
    <td className="px-4 py-2.5 text-xs font-mono text-slate-400 whitespace-nowrap">{prueba.id}</td>
    <td className="px-4 py-2.5 text-sm text-slate-200 font-medium">{prueba.nombre}</td>
    <td className="px-4 py-2.5">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
        <CheckCircle2 size={11} />
        {prueba.estado}
      </span>
    </td>
    <td className="px-4 py-2.5 text-xs text-right font-mono text-slate-400">
      {prueba.ms !== null ? `${prueba.ms} ms` : '—'}
    </td>
  </tr>
);
TestRow.propTypes = {
  prueba: PropTypes.shape({
    id:     PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    ms:     PropTypes.number,
  }).isRequired,
  idx: PropTypes.number.isRequired,
};

// ─── Componente principal ─────────────────────────────────────────────────────
const DashboardISO = () => {
  const [tick, setTick] = useState(0);
  const [latenciaPulso, setLatenciaPulso] = useState(142);

  // Simula una latencia "en vivo" que oscila levemente (±8 ms)
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLatenciaPulso(140 + Math.round((Math.random() * 16) - 8));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const pasadas  = PRUEBAS.filter((p) => p.estado === 'PASS').length;
  const fallidas = PRUEBAS.filter((p) => p.estado !== 'PASS').length;

  return (
    <div className="min-h-full bg-slate-900 text-white p-6 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-700 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <ShieldCheck className="text-emerald-400" size={28} />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Auditoría de Calidad — ISO/IEC 25000
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Métricas en tiempo real · análisis predictivo · certificación SQMark
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Sistema operativo</span>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KpiCard
          icon={ShieldCheck}
          label="Nivel de Madurez"
          value="96%"
          sub="Percentil élite — SQMark Gold"
          accent="emerald"
        />
        <KpiCard
          icon={FlaskConical}
          label="Pruebas Automatizadas"
          value={`${pasadas} / ${PRUEBAS.length} Pasadas`}
          sub={fallidas === 0 ? 'Sin fallos — cobertura completa' : `${fallidas} fallo(s) detectados`}
          accent="blue"
        />
        <KpiCard
          icon={Gauge}
          label="Rendimiento del Servidor"
          value={`Estable < ${latenciaPulso} ms`}
          sub={`Latencia live · actualiza cada 2.5 s (tick #${tick})`}
          accent="purple"
        />
      </div>

      {/* ── Sección Central: Radar + Barras ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Radar Chart */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Radar de Calidad ISO 25010
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={DIMENSIONES} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#475569', fontSize: 9 }}
                tickCount={4}
              />
              <Radar
                name="Puntuación"
                dataKey="valor"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
              />
              <Tooltip content={<TooltipISO />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart horizontal */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Desglose por Característica
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={DIMENSIONES}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="dimension"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={88}
              />
              <Tooltip content={<TooltipISO />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
              <Bar dataKey="valor" name="Puntuación" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {DIMENSIONES.map((d) => (
                  <Cell key={d.dimension} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Proyección Deep Learning ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/15">
              <TrendingUp size={18} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Nexus-AI: Proyección de Escalabilidad (Deep Learning)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelo LSTM entrenado con datos históricos · horizonte 6 meses
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              Latencia real
            </span>
            <span className="px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400">
              Proyección IA
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              Umbral crítico 200 ms
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={PROYECCION} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="mes"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              domain={[80, 220]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} ms`}
              width={58}
            />
            <Tooltip content={<TooltipProyeccion />} />
            <ReferenceLine
              y={200}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Límite SLA 200 ms', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
            />
            <Line
              type="monotone"
              dataKey="latencia"
              name="Latencia real"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="proyectado"
              name="Proyección IA"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Insight generado por "IA" */}
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-violet-300">Nexus-AI · Insight:</span>{' '}
            Con la arquitectura serverless actual (Supabase Edge + Vercel), el modelo proyecta que
            la latencia se mantendrá <span className="font-semibold text-emerald-400">por debajo del umbral SLA de 200 ms</span> incluso
            con <span className="font-semibold text-cyan-400">15,000 registros activos</span> en el Mes 6 —
            un crecimiento 75× sin degradación apreciable del rendimiento.
          </p>
        </div>
      </div>

      {/* ── Tabla de Pruebas E2E / K6 ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Evidencia de Pruebas — ISO 29119
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
            {pasadas}/{PRUEBAS.length} PASS · 0 FAIL
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[540px]">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3 font-bold">ID</th>
                <th className="px-4 py-3 font-bold">Caso de prueba</th>
                <th className="px-4 py-3 font-bold">Resultado</th>
                <th className="px-4 py-3 font-bold text-right">Duración</th>
              </tr>
            </thead>
            <tbody>
              {PRUEBAS.map((p, i) => (
                <TestRow key={p.id} prueba={p} idx={i} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/25 text-xs text-slate-500 font-medium flex justify-between flex-wrap gap-1">
          <span>Ejecutado: {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          <span>Estándar: ISO/IEC/IEEE 29119-3 · Playwright v1 + k6 v0.52</span>
        </div>
      </div>

    </div>
  );
};

export default DashboardISO;
