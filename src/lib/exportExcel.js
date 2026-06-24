import * as XLSX from 'xlsx';

// ─── Helpers internos ─────────────────────────────────────────────────────────

const normTipo = (v) =>
  (v.tipo ?? 'ingreso').toLowerCase() === 'ingreso' ? 'Ingreso' : 'Egreso';

const fmtFecha = (iso) => {
  if (!iso) return 'N/D';
  try {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

// Asigna anchos de columna a un worksheet (wch = ancho en caracteres)
const setColWidths = (ws, widths) => {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
};

// Convierte una fila de `ventas` (Supabase) al objeto de tabla
const mapTrx = (v) => ({
  'ID Transacción': v.id ? `TRX-${String(v.id).slice(-6).toUpperCase()}` : 'TRX-LOCAL',
  'Fecha y Hora': fmtFecha(v.created_at),
  Concepto: v.concepto ?? '—',
  'Método de Pago': v.metodo ?? 'Efectivo',
  'Monto (S/)': Number(v.monto ?? 0),
});

// Fila vacía de tabla (para sheets sin datos)
const emptyTrxRow = () => ({
  'ID Transacción': 'Sin registros',
  'Fecha y Hora': '',
  Concepto: '',
  'Método de Pago': '',
  'Monto (S/)': 0,
});

// ─── Exportador principal ─────────────────────────────────────────────────────

/**
 * Genera y descarga un archivo .xlsx con 4 hojas:
 *   1. Resumen        — KPIs financieros y conteos globales
 *   2. Ingresos       — Detalle de todas las transacciones de ingreso
 *   3. Egresos        — Detalle de todas las transacciones de egreso
 *   4. Por Método de Pago — Totales agrupados por método
 *
 * @param {Array}  ventas    Filas crudas de la tabla `ventas` (Supabase)
 * @param {Object} metricas  dashboardMetrics del contexto (totalIngresos, etc.)
 */
export function exportCajaExcel(ventas = [], metricas = {}) {
  if (!ventas.length) {
    alert('No hay transacciones registradas para exportar.');
    return;
  }

  const wb = XLSX.utils.book_new();
  const ahora = new Date();
  const fechaGen = ahora.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaGen = ahora.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const ingresos = ventas.filter((v) => normTipo(v) === 'Ingreso');
  const egresos  = ventas.filter((v) => normTipo(v) === 'Egreso');

  const totalIng = ingresos.reduce((s, v) => s + Number(v.monto ?? 0), 0);
  const totalEgr = egresos.reduce((s, v) => s + Number(v.monto ?? 0), 0);
  const balanceNeto = totalIng - totalEgr;

  // ── HOJA 1: RESUMEN ──────────────────────────────────────────────────────
  const resumenAOA = [
    ['NEXUS-Q — Reporte Financiero de Caja'],
    [`Generado: ${fechaGen} a las ${horaGen}`],
    [`Registros exportados: ${ventas.length}`],
    [],
    ['INDICADOR FINANCIERO', 'IMPORTE (S/)'],
    ['Total Ingresos', metricas.totalIngresos ?? totalIng],
    ['Total Egresos', metricas.totalEgresos ?? totalEgr],
    ['Balance Neto', metricas.balanceNeto ?? balanceNeto],
    ['Ingresos del Mes Actual', metricas.ingresosEsteMes ?? '—'],
    [],
    ['CONTEO DE TRANSACCIONES', 'CANTIDAD'],
    ['Transacciones de Ingreso', ingresos.length],
    ['Transacciones de Egreso', egresos.length],
    ['Total de Transacciones', ventas.length],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenAOA);
  setColWidths(wsResumen, [40, 20]);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // ── HOJA 2: INGRESOS ─────────────────────────────────────────────────────
  const wsIngresos = XLSX.utils.json_to_sheet(
    ingresos.length ? ingresos.map(mapTrx) : [emptyTrxRow()]
  );
  setColWidths(wsIngresos, [16, 20, 48, 20, 14]);
  // Fila de total al pie
  XLSX.utils.sheet_add_aoa(
    wsIngresos,
    [['', '', '', 'TOTAL INGRESOS', totalIng]],
    { origin: -1 }
  );
  XLSX.utils.book_append_sheet(wb, wsIngresos, 'Ingresos');

  // ── HOJA 3: EGRESOS ──────────────────────────────────────────────────────
  const wsEgresos = XLSX.utils.json_to_sheet(
    egresos.length ? egresos.map(mapTrx) : [emptyTrxRow()]
  );
  setColWidths(wsEgresos, [16, 20, 48, 20, 14]);
  XLSX.utils.sheet_add_aoa(
    wsEgresos,
    [['', '', '', 'TOTAL EGRESOS', totalEgr]],
    { origin: -1 }
  );
  XLSX.utils.book_append_sheet(wb, wsEgresos, 'Egresos');

  // ── HOJA 4: POR MÉTODO DE PAGO ───────────────────────────────────────────
  const metodosMap = {};
  ventas.forEach((v) => {
    const key = v.metodo ?? 'Efectivo';
    if (!metodosMap[key]) {
      metodosMap[key] = { ingresos: 0, egresos: 0, transacciones: 0 };
    }
    if (normTipo(v) === 'Ingreso') metodosMap[key].ingresos += Number(v.monto ?? 0);
    else metodosMap[key].egresos += Number(v.monto ?? 0);
    metodosMap[key].transacciones++;
  });

  const metodosRows = Object.entries(metodosMap).map(([metodo, data]) => ({
    'Método de Pago':   metodo,
    'N° Transacciones': data.transacciones,
    'Ingresos (S/)':    data.ingresos,
    'Egresos (S/)':     data.egresos,
    'Neto (S/)':        data.ingresos - data.egresos,
  }));

  // Fila de totales globales al pie
  const totalesFila = {
    'Método de Pago':   'TOTAL GENERAL',
    'N° Transacciones': ventas.length,
    'Ingresos (S/)':    totalIng,
    'Egresos (S/)':     totalEgr,
    'Neto (S/)':        balanceNeto,
  };

  const wsMetodos = XLSX.utils.json_to_sheet(
    metodosRows.length ? [...metodosRows, totalesFila] : [{ 'Método de Pago': 'Sin datos' }]
  );
  setColWidths(wsMetodos, [22, 18, 16, 16, 16]);
  XLSX.utils.book_append_sheet(wb, wsMetodos, 'Por Método de Pago');

  // ── Descarga ─────────────────────────────────────────────────────────────
  const stamp = ahora.toISOString().split('T')[0];
  XLSX.writeFile(wb, `Nexus-Q_Caja_${stamp}.xlsx`);
}
