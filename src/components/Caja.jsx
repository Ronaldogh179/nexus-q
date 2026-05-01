import React, { useState, useMemo } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign,
  Search, Calendar, Filter, ArrowUpRight, ArrowDownRight,
  Download, Loader2,
} from 'lucide-react';

// Normaliza una fila de `ventas` (Supabase) al shape que necesita la tabla de Caja
const mapVentaToTrx = (v) => {
  const tipoNorm = (v.tipo ?? 'ingreso').toLowerCase();
  const fechaDisplay = v.created_at
    ? new Date(v.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
    : (v.fecha ?? 'Hoy');

  return {
    id: v.id ? `TRX-${String(v.id).slice(-6).toUpperCase()}` : `TRX-LOCAL`,
    fecha: fechaDisplay,
    concepto: v.concepto ?? '—',
    tipo: tipoNorm === 'ingreso' ? 'Ingreso' : 'Egreso',
    metodo: v.metodo ?? 'Efectivo',
    monto: Number(v.monto ?? 0),
    _raw: v,
  };
};

const Caja = () => {
  const { ventas, dashboardMetrics, loading } = useGym();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  // Convierte las ventas del contexto al formato de display
  const transacciones = useMemo(() => ventas.map(mapVentaToTrx), [ventas]);

  // Métricas financieras desde el Single Source of Truth del contexto
  const { totalIngresos, totalEgresos, balanceNeto } = dashboardMetrics;

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter((t) => {
      const coincideTexto =
        t.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo;
      return coincideTexto && coincideTipo;
    });
  }, [transacciones, searchTerm, filtroTipo]);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">

      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="text-blue-500" size={32} /> Control de Caja
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium flex items-center gap-2">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Sincronizando con Supabase...</>
              : 'Monitoriza los ingresos, egresos y el flujo de caja diario · datos en vivo'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-gray-700 transition-colors">
            <Calendar size={18} /> Este Mes
          </button>
          <button className="bg-green-600/10 text-green-500 hover:bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
            <Download size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* KPIs FINANCIEROS — calculados desde dashboardMetrics del contexto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <DollarSign className="text-blue-500" size={24} />
            </div>
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
              Balance Neto
            </span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total en Caja</p>
          <p className="text-4xl font-black text-white">
            {loading ? '—' : `S/ ${balanceNeto.toLocaleString('es-PE')}`}
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <ArrowUpRight size={14} /> Ingresos totales
            </span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos</p>
          <p className="text-4xl font-black text-green-400">
            {loading ? '—' : `S/ ${totalIngresos.toLocaleString('es-PE')}`}
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">Gastos operativos</span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Egresos</p>
          <p className="text-4xl font-black text-red-400">
            {loading ? '—' : `S/ ${totalEgresos.toLocaleString('es-PE')}`}
          </p>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTROS */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex-1 w-full relative max-w-md">
          <Search className="absolute left-4 top-2.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por concepto o ID (Ej: TRX-001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-400 px-2 flex items-center gap-2">
            <Filter size={14} /> Filtrar por:
          </span>
          {['Todos', 'Ingreso', 'Egreso'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                filtroTipo === tipo
                  ? tipo === 'Ingreso'
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : tipo === 'Egreso'
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-400 hover:bg-gray-800'
              }`}
            >
              {tipo === 'Todos' ? 'Todos' : tipo === 'Ingreso' ? 'Ingresos' : 'Egresos'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE TRANSACCIONES */}
      <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-blue-500 opacity-60" />
            <p className="text-sm font-medium">Cargando transacciones desde Supabase...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#141b2d]/50">
                  <th className="p-4 pl-6 font-semibold">ID / Fecha</th>
                  <th className="p-4 font-semibold">Concepto / Detalle</th>
                  <th className="p-4 font-semibold text-center">Método de Pago</th>
                  <th className="p-4 font-semibold text-right pr-8">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {transaccionesFiltradas.length > 0 ? (
                  transaccionesFiltradas.map((trx) => (
                    <tr key={trx.id + trx.fecha} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-mono text-sm text-gray-300 font-bold">{trx.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} /> {trx.fecha}
                        </p>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                              trx.tipo === 'Ingreso'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {trx.tipo === 'Ingreso' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <p className="font-medium text-gray-200 text-sm whitespace-normal max-w-md">
                            {trx.concepto}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-[#0f172a] border border-gray-700 rounded-full text-xs font-semibold text-gray-300">
                          {trx.metodo}
                        </span>
                      </td>

                      <td className="p-4 pr-8 text-right">
                        <p
                          className={`text-base font-black ${
                            trx.tipo === 'Ingreso' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {trx.tipo === 'Ingreso' ? '+' : '-'}S/ {trx.monto.toLocaleString('es-PE')}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500">
                      <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">
                        {ventas.length === 0
                          ? 'No hay transacciones registradas aún. Al agregar socios, sus pagos aparecerán aquí automáticamente.'
                          : 'No se encontraron transacciones para estos filtros.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#141b2d] flex justify-between items-center text-xs text-gray-500">
          <span>
            Mostrando {transaccionesFiltradas.length} de {transacciones.length} movimientos
          </span>
          <button className="text-blue-400 hover:text-blue-300 font-bold">Ver historial completo →</button>
        </div>
      </div>
    </div>
  );
};

export default Caja;
