import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useGym } from 'src/context/GymContext.jsx';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign,
  Search, Calendar, Filter, ArrowUpRight, ArrowDownRight,
  Download, Loader2, Plus, Banknote, CreditCard, CheckCircle2, Clock,
} from 'lucide-react';
import { exportCajaExcel } from 'src/lib/exportExcel.js';
import MembershipModal from './MembershipModal';

// ─── Demo rows — se muestran solo si la BD no tiene transacciones aún ─────────
const DEMO_ROWS = [
  {
    id: 'TRX-DEMO1', fecha: 'Hoy 09:15', socio: 'Ana García',
    concepto: 'Membresía Mensual', metodo: 'Efectivo',
    monto: 120, tipo: 'Ingreso', estado: 'Completado', _demo: true,
  },
  {
    id: 'TRX-DEMO2', fecha: 'Hoy 10:30', socio: 'Carlos Ruiz',
    concepto: 'Plan Trimestral', metodo: 'Mercado Pago',
    monto: 320, tipo: 'Ingreso', estado: 'Completado', _demo: true,
  },
  {
    id: 'TRX-DEMO3', fecha: 'Hoy 11:45', socio: 'María López',
    concepto: 'Matrícula + Plan Mensual', metodo: 'Efectivo',
    monto: 170, tipo: 'Ingreso', estado: 'Completado', _demo: true,
  },
  {
    id: 'TRX-DEMO4', fecha: 'Ayer 16:00', socio: '—',
    concepto: 'Compra insumos de limpieza', metodo: 'Efectivo',
    monto: 85, tipo: 'Egreso', estado: 'Completado', _demo: true,
  },
];

// ─── Normaliza una fila de `ventas` al shape de la tabla ──────────────────────
const mapVentaToTrx = (v, sociosMap) => {
  const tipoNorm = (v.tipo ?? 'ingreso').toLowerCase();
  const fechaDisplay = v.created_at
    ? new Date(v.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
    : (v.fecha ?? 'Hoy');

  const socioNombre = v.socio_id && sociosMap[v.socio_id]
    ? sociosMap[v.socio_id]
    : '—';

  return {
    id: v.id ? `TRX-${String(v.id).slice(-6).toUpperCase()}` : 'TRX-LOCAL',
    fecha: fechaDisplay,
    socio: socioNombre,
    concepto: v.concepto ?? '—',
    tipo: tipoNorm === 'ingreso' ? 'Ingreso' : 'Egreso',
    metodo: v.metodo ?? 'Efectivo',
    monto: Number(v.monto ?? 0),
    estado: 'Completado',
    _raw: v,
  };
};

// ─── Badge de método de pago ──────────────────────────────────────────────────
const MetodoBadge = ({ metodo }) => {
  const esMP = metodo?.toLowerCase().includes('mercado');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      esMP
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-gray-700/50 text-gray-300 border-gray-600/40'
    }`}>
      {esMP ? <CreditCard size={11} /> : <Banknote size={11} />}
      {metodo}
    </span>
  );
};

// ─── Badge de estado ──────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const completado = estado === 'Completado';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      completado
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }`}>
      {completado ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {estado}
    </span>
  );
};

MetodoBadge.propTypes = {
  metodo: PropTypes.string.isRequired,
};

EstadoBadge.propTypes = {
  estado: PropTypes.string.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────

const Caja = () => {
  const { ventas, socios, dashboardMetrics, loading } = useGym();

  const [searchTerm, setSearchTerm]     = useState('');
  const [filtroTipo, setFiltroTipo]     = useState('Todos');
  const [exporting, setExporting]       = useState(false);
  const [showModal, setShowModal]       = useState(false);

  const handleExport = useCallback(async () => {
    if (exporting || loading) return;
    setExporting(true);
    try { exportCajaExcel(ventas, dashboardMetrics); }
    finally { setExporting(false); }
  }, [ventas, dashboardMetrics, exporting, loading]);

  // Mapa id → nombre para cruzar ventas con socios
  const sociosMap = useMemo(
    () => Object.fromEntries(socios.map((s) => [s.id, s.nombre])),
    [socios]
  );

  const transacciones = useMemo(
    () => ventas.map((v) => mapVentaToTrx(v, sociosMap)),
    [ventas, sociosMap]
  );

  // ── KPIs principales (histórico) ────────────────────────────────────────────
  const { totalIngresos, totalEgresos, balanceNeto } = dashboardMetrics;

  // ── KPIs del día ────────────────────────────────────────────────────────────
  const hoyISO = new Date().toISOString().split('T')[0];

  const ingresosHoy = useMemo(
    () => ventas
      .filter((v) => v.tipo === 'ingreso' && (v.created_at ?? '').startsWith(hoyISO))
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0),
    [ventas, hoyISO]
  );

  const cobrosEfectivo = useMemo(
    () => ventas
      .filter((v) => v.tipo === 'ingreso' && !(v.metodo ?? '').toLowerCase().includes('mercado'))
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0),
    [ventas]
  );

  const cobrosMP = useMemo(
    () => ventas
      .filter((v) => v.tipo === 'ingreso' && (v.metodo ?? '').toLowerCase().includes('mercado'))
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0),
    [ventas]
  );

  // ── Filas visibles: reales si hay datos, demo si la BD está vacía ───────────
  const filasBase = ventas.length > 0 ? transacciones : DEMO_ROWS;
  const esDemo    = ventas.length === 0;

  const transaccionesFiltradas = useMemo(() => filasBase.filter((t) => {
    const coincideTexto =
      t.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.socio ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo;
    return coincideTexto && coincideTipo;
  }), [filasBase, searchTerm, filtroTipo]);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="text-blue-500" size={32} /> Control de Caja
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium flex items-center gap-2">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Sincronizando con Supabase...</>
              : 'Monitoriza ingresos, egresos y el flujo de caja · datos en vivo'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Acción principal */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Registrar Ingreso Manual
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-gray-700 transition-colors">
            <Calendar size={18} /> Este Mes
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="bg-green-600/10 text-green-500 hover:bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting
              ? <><Loader2 size={18} className="animate-spin" /> Generando...</>
              : <><Download size={18} /> Exportar Excel</>}
          </button>
        </div>
      </div>

      {/* ── FILA 1: KPIs del DÍA ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Ingresos del Día */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-emerald-500/20 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/3 pointer-events-none rounded-2xl" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <TrendingUp className="text-emerald-400" size={22} />
            </div>
            <span className="text-emerald-400/60 text-xs font-bold uppercase tracking-wider">Hoy</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos del Día</p>
          <p className="text-3xl font-black text-emerald-400">
            {loading ? '—' : `S/ ${ingresosHoy.toLocaleString('es-PE')}`}
          </p>
        </div>

        {/* Cobros en Efectivo */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-700/50 rounded-xl border border-gray-600/40">
              <Banknote className="text-gray-300" size={22} />
            </div>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Histórico</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cobros en Efectivo</p>
          <p className="text-3xl font-black text-white">
            {loading ? '—' : `S/ ${cobrosEfectivo.toLocaleString('es-PE')}`}
          </p>
        </div>

        {/* Cobros por Mercado Pago */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-blue-500/20 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <CreditCard className="text-blue-400" size={22} />
            </div>
            <span className="text-blue-400/60 text-xs font-bold uppercase tracking-wider">Histórico</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cobros por Mercado Pago</p>
          <p className="text-3xl font-black text-blue-400">
            {loading ? '—' : `S/ ${cobrosMP.toLocaleString('es-PE')}`}
          </p>
        </div>
      </div>

      {/* ── FILA 2: KPIs globales (secundaria) ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-gray-800 flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 shrink-0">
            <DollarSign className="text-blue-500" size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance Neto</p>
            <p className="text-xl font-black text-white">
              {loading ? '—' : `S/ ${balanceNeto.toLocaleString('es-PE')}`}
            </p>
          </div>
        </div>
        <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-gray-800 flex items-center gap-4">
          <div className="p-2.5 bg-green-500/10 rounded-lg border border-green-500/20 shrink-0">
            <ArrowUpRight className="text-green-500" size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Ingresos</p>
            <p className="text-xl font-black text-green-400">
              {loading ? '—' : `S/ ${totalIngresos.toLocaleString('es-PE')}`}
            </p>
          </div>
        </div>
        <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-gray-800 flex items-center gap-4">
          <div className="p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 shrink-0">
            <ArrowDownRight className="text-red-500" size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Egresos</p>
            <p className="text-xl font-black text-red-400">
              {loading ? '—' : `S/ ${totalEgresos.toLocaleString('es-PE')}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── BUSCADOR Y FILTROS ──────────────────────────────────────────────── */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex-1 w-full relative max-w-md">
          <Search className="absolute left-4 top-2.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por socio, concepto o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-400 px-2 flex items-center gap-2">
            <Filter size={14} /> Filtrar:
          </span>
          {['Todos', 'Ingreso', 'Egreso'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                filtroTipo === tipo
                  ? tipo === 'Ingreso' ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : tipo === 'Egreso'  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  :                     'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-400 hover:bg-gray-800'
              }`}
            >
              {tipo === 'Todos' ? 'Todos' : tipo === 'Ingreso' ? 'Ingresos' : 'Egresos'}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLA DE TRANSACCIONES ──────────────────────────────────────────── */}
      <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-blue-500 opacity-60" />
            <p className="text-sm font-medium">Cargando transacciones desde Supabase...</p>
          </div>
        ) : (
          <>
            {/* Banner demo */}
            {esDemo && (
              <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Clock size={13} /> Vista de diseño — datos de ejemplo. Los registros reales aparecerán aquí automáticamente.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#141b2d]/50">
                    <th className="p-4 pl-6 font-semibold">Fecha y Hora</th>
                    <th className="p-4 font-semibold">Socio</th>
                    <th className="p-4 font-semibold">Concepto</th>
                    <th className="p-4 font-semibold text-center">Método de Pago</th>
                    <th className="p-4 font-semibold text-right">Monto (S/)</th>
                    <th className="p-4 font-semibold text-center pr-6">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {transaccionesFiltradas.length > 0 ? (
                    transaccionesFiltradas.map((trx, i) => (
                      <tr
                        key={`${trx.id}-${i}`}
                        className={`hover:bg-gray-800/40 transition-colors ${trx._demo ? 'opacity-70' : ''}`}
                      >
                        {/* Fecha y Hora */}
                        <td className="p-4 pl-6">
                          <p className="font-mono text-xs text-gray-300 font-bold">{trx.id}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Calendar size={11} /> {trx.fecha}
                          </p>
                        </td>

                        {/* Socio */}
                        <td className="p-4">
                          <p className="text-sm font-semibold text-gray-200">{trx.socio}</p>
                        </td>

                        {/* Concepto */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              trx.tipo === 'Ingreso'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {trx.tipo === 'Ingreso'
                                ? <ArrowUpRight size={14} />
                                : <ArrowDownRight size={14} />}
                            </div>
                            <p className="text-sm text-gray-300 whitespace-normal max-w-xs">
                              {trx.concepto}
                            </p>
                          </div>
                        </td>

                        {/* Método */}
                        <td className="p-4 text-center">
                          <MetodoBadge metodo={trx.metodo} />
                        </td>

                        {/* Monto */}
                        <td className="p-4 text-right">
                          <p className={`text-base font-black ${
                            trx.tipo === 'Ingreso' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trx.tipo === 'Ingreso' ? '+' : '-'}S/ {trx.monto.toLocaleString('es-PE')}
                          </p>
                        </td>

                        {/* Estado */}
                        <td className="p-4 text-center pr-6">
                          <EstadoBadge estado={trx.estado} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-500">
                        <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">
                          No se encontraron transacciones para estos filtros.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#141b2d] flex justify-between items-center text-xs text-gray-500">
              <span>
                {esDemo
                  ? `${DEMO_ROWS.length} registros de ejemplo`
                  : `Mostrando ${transaccionesFiltradas.length} de ${transacciones.length} movimientos`}
              </span>
              <button className="text-blue-400 hover:text-blue-300 font-bold">
                Ver historial completo →
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── MODAL INGRESO MANUAL ────────────────────────────────────────────── */}
      {showModal && <MembershipModal closeModal={() => setShowModal(false)} />}
    </div>
  );
};

export default Caja;
