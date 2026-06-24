/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { supabase } from 'src/lib/supabase.js';
import { useToast } from 'src/components/Toast.jsx';

const GymContext = createContext();

// ─── Helpers de mapeo ────────────────────────────────────────────────────────

const getIniciales = (nombre) =>
  (nombre || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'S';

// Normaliza una fila de `socios`: unifica estado 'Vencido'→'Vencida', mapea fecha_venc
const mapSocio = (row) => ({
  ...row,
  iniciales: getIniciales(row.nombre),
  fechaVenc: row.fecha_venc ?? '—',
  dias: typeof row.dias === 'number' ? row.dias : 0,
  estado: row.estado === 'Vencido' ? 'Vencida' : (row.estado ?? 'Activo'),
});

// Normaliza una fila de `planes` desde Supabase al shape de la aplicación
const mapPlan = (row) => ({
  ...row,
  duracion: row.duracion ?? '1 Mes',
  caracteristicas: Array.isArray(row.caracteristicas) ? row.caracteristicas : [],
});

// Convierte la columna `duracion` del plan (ej. "3 Meses") a días numéricos
const getDiasByDuracion = (duracion) => {
  const d = String(duracion || '').toLowerCase();
  if (d.includes('12') || d.includes('anual')) return 360;
  if (d.includes('6')) return 180;
  if (d.includes('3')) return 90;
  return 30;
};

// Devuelve YYYY-MM-DD para hoy + N días (fecha de vencimiento calculada)
const calcFechaVenc = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + (typeof dias === 'number' ? dias : 30));
  return d.toISOString().split('T')[0];
};

// Fallback: extrae precio embebido en strings como "Mensual (S/ 100)"
const getMontoByPlan = (planStr) => {
  const match = String(planStr || '').match(/S\/\s*(\d+)/);
  return match ? Number(match[1]) : 0;
};

// ─────────────────────────────────────────────────────────────────────────────

export const GymProvider = ({ children }) => {
  const { addToast } = useToast();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('ES');
  // IDs de notificaciones descartadas por el usuario (se limpian al cerrar sesión)
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());

  // ── Estado principal de datos ─────────────────────────────────────────────
  const [socios, setSocios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // planes se carga desde Supabase en el fetchData inicial
  const [planes, setPlanes] = useState([]);

  const [asistencias, setAsistencias] = useState([]);

  const [rutinas] = useState([
    { id: 1, nombre: 'Hipertrofia Total', nivel: 'Avanzado', duracion: '60 min', enfoque: 'Cuerpo Completo' },
    { id: 2, nombre: 'Cardio Express', nivel: 'Principiante', duracion: '30 min', enfoque: 'Piernas/Glúteos' },
    { id: 3, nombre: 'Fuerza Base', nivel: 'Intermedio', duracion: '45 min', enfoque: 'Tren Superior' },
  ]);

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDbError(null);
      try {
        const [
          { data: sociosData, error: sociosErr },
          { data: ventasData, error: ventasErr },
          { data: asistenciasData, error: asistenciasErr },
          { data: planesData, error: planesErr },
        ] = await Promise.all([
          supabase.from('socios').select('*').order('id', { ascending: false }),
          supabase.from('ventas').select('*').order('id', { ascending: false }),
          supabase.from('asistencias').select('*').order('id', { ascending: false }),
          supabase.from('planes').select('*').order('id', { ascending: true }),
        ]);

        if (sociosErr) throw sociosErr;
        if (ventasErr) throw ventasErr;
        if (asistenciasErr) throw asistenciasErr;
        if (planesErr) throw planesErr;

        setSocios((sociosData || []).map(mapSocio));
        setVentas(ventasData || []);
        setAsistencias(asistenciasData || []);
        setPlanes((planesData || []).map(mapPlan));
      } catch (err) {
        console.error('[Nexus-Q] Error cargando datos de Supabase:', err.message);
        setDbError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Suscripciones Realtime ────────────────────────────────────────────────
  useEffect(() => {
    const sociosChannel = supabase
      .channel('socios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'socios' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSocios((prev) => [mapSocio(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSocios((prev) =>
              prev.map((s) => (s.id === payload.new.id ? mapSocio(payload.new) : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setSocios((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const ventasChannel = supabase
      .channel('ventas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ventas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVentas((prev) => {
              if (prev.some((v) => v.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setVentas((prev) =>
              prev.map((v) => (v.id === payload.new.id ? payload.new : v))
            );
          } else if (payload.eventType === 'DELETE') {
            setVentas((prev) => prev.filter((v) => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const asistenciasChannel = supabase
      .channel('asistencias-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asistencias' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAsistencias((prev) => {
              if (prev.some((a) => a.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setAsistencias((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAsistencias((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sociosChannel);
      supabase.removeChannel(ventasChannel);
      supabase.removeChannel(asistenciasChannel);
    };
  }, []);

  // ── Mutaciones de Socios ──────────────────────────────────────────────────

  const agregarSocio = useCallback(async (nuevo) => {
    // Resuelve el plan desde la BD (exacto o por substrings para compatibilidad con formato antiguo)
    const planEncontrado = planes.find(
      (p) => p.nombre.toLowerCase() === String(nuevo.plan || '').toLowerCase()
    ) ?? planes.find(
      (p) => String(nuevo.plan || '').toLowerCase().includes(p.nombre.toLowerCase())
    );

    const diasCalculados = planEncontrado
      ? getDiasByDuracion(planEncontrado.duracion)
      : (typeof nuevo.dias === 'number' ? nuevo.dias : 30);

    const planNombre = planEncontrado ? planEncontrado.nombre : nuevo.plan;
    const montoCalculado = planEncontrado
      ? Number(planEncontrado.precio)
      : getMontoByPlan(nuevo.plan);

    const socioPayload = {
      nombre: nuevo.nombre,
      dni: nuevo.dni,
      tel: nuevo.tel,
      mail: nuevo.mail,
      plan: planNombre,
      estado: 'Activo',
      dias: diasCalculados,
      fecha_venc: calcFechaVenc(diasCalculados),
    };

    const { data: insertedSocio, error: socioErr } = await supabase
      .from('socios')
      .insert([socioPayload])
      .select()
      .single();

    if (socioErr || !insertedSocio) {
      console.error('[Nexus-Q] Error al insertar socio:', socioErr?.message);
      addToast({ message: `Error al registrar socio: ${socioErr?.message ?? 'Error desconocido'}`, type: 'error' });
      return { ok: false, error: socioErr };
    }

    if (montoCalculado > 0) {
      const metodoVenta = nuevo.metodo || 'Efectivo';
      // Mapear método legible → valor canónico de la columna `origen` (CHECK constraint)
      const origenVenta = metodoVenta.toLowerCase().includes('mercado')
        ? 'mercadopago'
        : 'efectivo';

      const { error: ventaErr } = await supabase.from('ventas').insert([
        {
          concepto: `Membresía: ${nuevo.nombre} — ${planNombre}`,
          monto: montoCalculado,
          metodo: metodoVenta,
          tipo: 'ingreso',
          origen: origenVenta,
          socio_id: insertedSocio.id,
        },
      ]);

      if (ventaErr) {
        console.error('[Nexus-Q] Error al registrar venta de membresía:', ventaErr.message);
        const { error: rollbackErr } = await supabase.from('socios').delete().eq('id', insertedSocio.id);
        if (rollbackErr) {
          addToast({
            message: `Error en caja y no se pudo revertir el socio: ${rollbackErr.message}`,
            type: 'error',
          });
        } else {
          addToast({
            message: `Error al registrar la venta en caja. El alta del socio no se guardó.`,
            type: 'error',
          });
        }
        return { ok: false, error: ventaErr };
      }
    }

    addToast({ message: `✓ Socio "${nuevo.nombre}" registrado y guardado en la nube.`, type: 'success' });
    return { ok: true };
  }, [planes, addToast]);

  const eliminarSocio = useCallback(async (id) => {
    const socioAEliminar = socios.find((s) => s.id === id);
    // Optimistic update
    setSocios((prev) => prev.filter((s) => s.id !== id));

    const { error } = await supabase.from('socios').delete().eq('id', id);
    if (error) {
      console.error('[Nexus-Q] Error al eliminar socio:', error.message);
      addToast({ message: `Error al eliminar: ${error.message}`, type: 'error' });
      // Recarga en caso de fallo
      const { data } = await supabase.from('socios').select('*').order('id', { ascending: false });
      if (data) setSocios(data.map(mapSocio));
    } else {
      addToast({
        message: `Socio "${socioAEliminar?.nombre ?? ''}" eliminado correctamente.`,
        type: 'warning',
      });
    }
  }, [socios, addToast]);

  const editarSocio = useCallback(async (id, datosActualizados) => {
    // Optimistic update local
    setSocios((prev) =>
      prev.map((socio) => {
        if (socio.id !== id) return socio;
        const merged = { ...socio, ...datosActualizados };
        return { ...merged, iniciales: getIniciales(merged.nombre) };
      })
    );

    const estadoNorm = datosActualizados.estado === 'Vencido'
      ? 'Vencida'
      : (datosActualizados.estado ?? 'Activo');

    const dbPayload = {
      nombre: datosActualizados.nombre,
      dni: datosActualizados.dni,
      tel: datosActualizados.tel,
      mail: datosActualizados.mail,
      plan: datosActualizados.plan,
      estado: estadoNorm,
      dias: datosActualizados.dias,
      ...(datosActualizados.fechaVenc
        ? { fecha_venc: datosActualizados.fechaVenc }
        : {}),
    };

    const { error } = await supabase.from('socios').update(dbPayload).eq('id', id);
    if (error) {
      console.error('[Nexus-Q] Error al editar socio:', error.message);
      addToast({ message: `Error al actualizar: ${error.message}`, type: 'error' });
    } else {
      addToast({ message: `Datos de "${datosActualizados.nombre}" actualizados en la nube.`, type: 'success' });
    }
  }, [addToast]);

  // ── Mutaciones de Ventas ──────────────────────────────────────────────────

  const registrarVenta = useCallback(async (v) => {
    const metodoVenta = v.metodo ?? 'Efectivo';
    const origenVenta = metodoVenta.toLowerCase().includes('mercado') ? 'mercadopago' : 'efectivo';

    const ventaPayload = {
      concepto: v.concepto,
      monto: v.monto,
      metodo: metodoVenta,
      tipo: v.tipo || 'ingreso',
      origen: origenVenta,
      socio_id: v.socio_id ?? null,
    };

    const { error } = await supabase.from('ventas').insert([ventaPayload]);
    if (error) {
      console.error('[Nexus-Q] Error al registrar venta:', error.message);
      addToast({ message: `Error al registrar venta: ${error.message}`, type: 'error' });
      return { ok: false, error };
    }

    addToast({ message: `Venta de S/ ${v.monto} registrada en Caja.`, type: 'success' });
    return { ok: true };
  }, [addToast]);

  // ── Mutaciones de Planes (persistidas en Supabase) ────────────────────────

  const agregarPlan = useCallback(async (nuevoPlan) => {
    const payload = {
      nombre: nuevoPlan.nombre,
      precio: Number(nuevoPlan.precio) || 0,
      duracion: nuevoPlan.duracion ?? nuevoPlan.duración ?? '1 Mes',
      estado: nuevoPlan.estado || 'Activo',
      caracteristicas: Array.isArray(nuevoPlan.caracteristicas) ? nuevoPlan.caracteristicas : [],
    };
    const { data, error } = await supabase.from('planes').insert([payload]).select().single();
    if (error) {
      console.error('[Nexus-Q] Error al crear plan:', error.message);
      addToast({ message: `Error al crear plan: ${error.message}`, type: 'error' });
      return;
    }
    setPlanes((prev) => [...prev, mapPlan(data)]);
    addToast({ message: `Plan "${data.nombre}" creado correctamente.`, type: 'success' });
  }, [addToast]);

  const editarPlan = useCallback(async (id, planActualizado) => {
    const payload = {
      nombre: planActualizado.nombre,
      precio: Number(planActualizado.precio) || 0,
      duracion: planActualizado.duracion ?? planActualizado.duración ?? '1 Mes',
      estado: planActualizado.estado || 'Activo',
      caracteristicas: Array.isArray(planActualizado.caracteristicas) ? planActualizado.caracteristicas : [],
    };
    const { error } = await supabase.from('planes').update(payload).eq('id', id);
    if (error) {
      console.error('[Nexus-Q] Error al actualizar plan:', error.message);
      addToast({ message: `Error al actualizar plan: ${error.message}`, type: 'error' });
      return;
    }
    setPlanes((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } : p)));
    addToast({ message: `Plan "${planActualizado.nombre}" actualizado.`, type: 'success' });
  }, [addToast]);

  const eliminarPlan = useCallback(async (id) => {
    const planAEliminar = planes.find((p) => p.id === id);
    const { error } = await supabase.from('planes').delete().eq('id', id);
    if (error) {
      console.error('[Nexus-Q] Error al eliminar plan:', error.message);
      addToast({ message: `Error al eliminar plan: ${error.message}`, type: 'error' });
      return;
    }
    setPlanes((prev) => prev.filter((p) => p.id !== id));
    addToast({ message: `Plan "${planAEliminar?.nombre ?? ''}" eliminado.`, type: 'warning' });
  }, [planes, addToast]);

  // ── Check-in: persiste en Supabase; la UI se actualiza vía Realtime (sin estado optimista) ──

  const realizarCheckIn = useCallback(
    async (dni) => {
      const normalized = String(dni ?? '').trim();
      const socio = socios.find((s) => String(s.dni).trim() === normalized);

      if (!socio) return { success: false, motivo: 'DNI no encontrado en el sistema' };

      const membresiaVencida = socio.estado === 'Vencida' || socio.estado === 'Vencido';
      const estadoAcceso = membresiaVencida ? 'Denegado' : 'Permitido';
      const motivo = membresiaVencida ? 'Membresía Vencida' : 'Socio Activo';

      const row = {
        socio_id: socio.id,
        nombre: socio.nombre,
        plan: socio.plan,
        estado_acceso: estadoAcceso,
      };

      const { error } = await supabase.from('asistencias').insert([row]);

      if (error) {
        console.error('[Nexus-Q] Error al registrar check-in en Supabase:', error.message);
        addToast({ message: `Error al registrar acceso: ${error.message}`, type: 'error' });
        return { success: false, motivo: error.message, socio };
      }

      if (estadoAcceso === 'Permitido') {
        addToast({
          message: `Acceso permitido — ${socio.nombre} · ${socio.dias} día${socio.dias !== 1 ? 's' : ''} restante${socio.dias !== 1 ? 's' : ''}.`,
          type: 'success',
        });
      } else {
        addToast({
          message: `Acceso denegado — ${socio.nombre}: membresía vencida.`,
          type: 'error',
        });
      }

      return { success: true, socio, estadoAcceso, motivo, diasRestantes: socio.dias };
    },
    [socios, addToast]
  );

  // ── UI helpers ────────────────────────────────────────────────────────────

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'ES' ? 'EN' : 'ES'));
  }, []);

  // ── Traducciones ──────────────────────────────────────────────────────────

  const translations = {
    ES: {
      appName: 'Nexus-Q',
      dashboard: 'Panel',
      dashboardDescription: 'Panel de control principal - Conectado al Sistema',
      members: 'Socios',
      newMember: 'Nuevo socio',
      quickActions: 'Acciones rápidas',
      registerSale: 'Registrar venta',
      register: 'Registrarse',
      membershipHealth: 'Estado de Salud de nuestras Membresías',
      expired: 'Vencidas',
      nextToExpire: '0 a 7 días',
      preventiveAlert: '8 a 15 días',
      upToDate: '15+ días',
      notifications: 'Notificaciones',
      clear: 'Limpiar',
      noNotifications: 'Sin notificaciones pendientes.',
      activeMembers: 'Socios activos',
      salesRecorded: 'Ventas registradas',
      attendancesToday: 'Asistencias hoy',
      quickMemberSignup: 'Alta de Socio Rápida',
      quickSale: 'Venta Rápida',
      fullName: 'Nombre Completo',
      phone: 'Teléfono',
      selectedPlan: 'Plan Elegido',
      product: 'Producto',
      amount: 'Cantidad',
      method: 'Método',
      totalToCharge: 'TOTAL A COBRAR:',
      processPayment: 'Procesar Pago',
      saveAndEnroll: 'Guardar e Inscribir',
      accessCheckin: 'Check-in Recepción',
      cancel: 'Cancelar',
      verifyAccess: 'Verificar Acceso',
      membersList: 'Lista de Socios',
      managementCenter: 'Gestión central · datos en vivo del sistema',
      totalMembers: 'Total Socios',
      active: 'Activos',
      activeStatus: 'Activo',
      expiringSoon: 'Por Vencer',
      newThisMonth: 'Nuevos este mes',
      inGlobalBase: 'En base global',
      activeMembership: 'Membresía vigente',
      daysRemainingShort: '1 a 7 días restantes',
      recentSignups: 'Altas con registro reciente',
      searchMembers: 'Buscar por nombre o DNI...',
      filterByPlan: 'Filtrar por plan',
      all: 'Todos',
      monthly: 'Mensual',
      threeMonthPromo: '3 Meses Promo',
      sixMonthPromo: '6 Meses Promo',
      member: 'Miembro',
      contact: 'Contacto',
      status: 'Estado',
      days: 'Días',
      actions: 'Acciones',
      noMembersFound: 'No hay socios que coincidan con la búsqueda o el plan seleccionado.',
      showingMembers: 'Mostrando',
      of: 'de',
      orderRecentFirst: 'Orden: más recientes primero',
      view: 'Ver',
      edit: 'Editar',
      delete: 'Eliminar',
      expiredMember: 'Vencido',
      expiredStatus: 'Vencido',
      close: 'Cerrar',
      email: 'Correo electrónico',
      currentPlan: 'Plan actual',
      remainingDays: 'Días restantes',
      saveMember: 'Guardar socio',
      editMember: 'Editar Socio',
      viewMember: 'Ver Socio',
      medicalFit: 'Apto médico al día',
      deleteConfirm: '¿Eliminar a {name} de la lista? Esta acción no se puede deshacer.',
      inactivityAlerts: 'Alertas de Inactividad',
      inactivitySubtitle: 'Socios activos sin asistencias recientes',
      totalInactive: 'Total Inactivos',
      criticalRisk: 'Riesgo Crítico',
      recoveredThisMonth: 'Recuperados este mes',
      mediumHighRisk: 'Riesgo medio + alto',
      over14Days: 'Más de 14 días',
      estimatedValue: 'Valor estimado',
      daysWithoutComing: 'Días sin venir',
      riskLevel: 'Nivel de Riesgo',
      highRisk: 'Riesgo Alto',
      mediumRisk: 'Riesgo Medio',
      sendWhatsApp: 'Enviar WhatsApp',
      noInactivityAlerts: 'No hay alertas de inactividad para mostrar.',
      plansManagement: 'Gestión de Planes',
      createNewPlan: 'Crear Nuevo Plan',
      activePlan: 'Activo',
      inactivePlan: 'Inactivo',
      planDuration: 'Duración',
      planFeatures: 'Características',
      editPlan: 'Editar Plan',
      savePlan: 'Guardar Plan',
      deletePlanConfirm: '¿Eliminar el plan {name}? Esta acción no se puede deshacer.',
      plansSubtitle: 'Configura las membresías, precios y beneficios de Nexus-Q.',
      noPlans: 'No hay planes disponibles.',
      training: 'Entrenamiento',
      trainingCatalog: 'Catálogo de Rutinas',
      level: 'Nivel',
      duration: 'Duración',
      focus: 'Enfoque',
      assignToMember: 'Asignar a Socio',
      createNewRoutine: 'Crear Nueva Rutina',
      viewExercises: 'Ver Ejercicios',
    },
    EN: {
      appName: 'Nexus-Q',
      dashboard: 'Dashboard',
      dashboardDescription: 'Main control panel - Connected to the System',
      members: 'Members',
      newMember: 'New member',
      quickActions: 'Quick actions',
      registerSale: 'Register sale',
      register: 'Check in',
      membershipHealth: 'Membership Health Status',
      expired: 'Expired',
      nextToExpire: '0 to 7 days',
      preventiveAlert: '8 to 15 days',
      upToDate: '15+ days',
      notifications: 'Notifications',
      clear: 'Clear',
      noNotifications: 'No pending notifications.',
      activeMembers: 'Active members',
      salesRecorded: 'Recorded sales',
      attendancesToday: 'Attendances today',
      quickMemberSignup: 'Quick Member Signup',
      quickSale: 'Quick Sale',
      fullName: 'Full Name',
      phone: 'Phone',
      selectedPlan: 'Selected Plan',
      product: 'Product',
      amount: 'Quantity',
      method: 'Method',
      totalToCharge: 'TOTAL TO CHARGE:',
      processPayment: 'Process Payment',
      saveAndEnroll: 'Save and Enroll',
      accessCheckin: 'Front Desk Check-in',
      cancel: 'Cancel',
      verifyAccess: 'Verify Access',
      membersList: 'Members List',
      managementCenter: 'Central management · live system data',
      totalMembers: 'Total Members',
      active: 'Active',
      activeStatus: 'Active',
      expiringSoon: 'Expiring Soon',
      newThisMonth: 'New This Month',
      inGlobalBase: 'In global base',
      activeMembership: 'Active membership',
      daysRemainingShort: '1 to 7 days remaining',
      recentSignups: 'Recent signups',
      searchMembers: 'Search by name or DNI...',
      filterByPlan: 'Filter by plan',
      all: 'All',
      monthly: 'Monthly',
      threeMonthPromo: '3 Month Promo',
      sixMonthPromo: '6 Month Promo',
      member: 'Member',
      contact: 'Contact',
      status: 'Status',
      days: 'Days',
      actions: 'Actions',
      noMembersFound: 'No members match the search or selected plan.',
      showingMembers: 'Showing',
      of: 'of',
      orderRecentFirst: 'Order: newest first',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      expiredMember: 'Expired',
      expiredStatus: 'Expired',
      close: 'Close',
      email: 'Email',
      currentPlan: 'Current plan',
      remainingDays: 'Remaining days',
      saveMember: 'Save member',
      editMember: 'Edit Member',
      viewMember: 'View Member',
      medicalFit: 'Medical clearance up to date',
      deleteConfirm: 'Delete {name} from the list? This action cannot be undone.',
      inactivityAlerts: 'Inactivity Alerts',
      inactivitySubtitle: 'Active members without recent attendances',
      totalInactive: 'Total Inactive',
      criticalRisk: 'Critical Risk',
      recoveredThisMonth: 'Recovered This Month',
      mediumHighRisk: 'Medium + high risk',
      over14Days: 'More than 14 days',
      estimatedValue: 'Estimated value',
      daysWithoutComing: 'Days absent',
      riskLevel: 'Risk level',
      highRisk: 'High Risk',
      mediumRisk: 'Medium Risk',
      sendWhatsApp: 'Send WhatsApp',
      noInactivityAlerts: 'No inactivity alerts to display.',
      plansManagement: 'Plans Management',
      createNewPlan: 'Create New Plan',
      activePlan: 'Active',
      inactivePlan: 'Inactive',
      planDuration: 'Duration',
      planFeatures: 'Features',
      editPlan: 'Edit Plan',
      savePlan: 'Save Plan',
      deletePlanConfirm: 'Delete plan {name}? This action cannot be undone.',
      plansSubtitle: 'Configure memberships, prices and benefits for Nexus-Q.',
      noPlans: 'No plans available.',
      training: 'Training',
      trainingCatalog: 'Routine Catalog',
      level: 'Level',
      duration: 'Duration',
      focus: 'Focus',
      assignToMember: 'Assign to Member',
      createNewRoutine: 'Create New Routine',
      viewExercises: 'View Exercises',
    },
  };

  // ── Métricas del Dashboard (Single Source of Truth) ──────────────────────
  // Todos los módulos que necesiten indicadores globales deben leer aquí.
  const dashboardMetrics = useMemo(() => {
    const ahora = new Date();

    const hoy = new Date(ahora);
    hoy.setHours(0, 0, 0, 0);

    const esVencido = (s) => {
      if (s.estado === 'Vencida' || s.estado === 'Vencido') return true;
      const fv = s.fecha_venc ?? s.fechaVenc;
      if (fv && fv !== '—') {
        const d = new Date(fv);
        return !Number.isNaN(d.getTime()) && d < hoy;
      }
      return false;
    };

    const sociosActivos = socios.filter((s) => s.estado === 'Activo' && !esVencido(s)).length;
    const sociosPorVencer = socios.filter(
      (s) => s.estado === 'Activo' && !esVencido(s) && typeof s.dias === 'number' && s.dias > 0 && s.dias <= 7
    ).length;
    const sociosVencidos = socios.filter(esVencido).length;

    // COUNT real usando created_at de Supabase (campo TIMESTAMPTZ)
    const nuevosEsteMes = socios.filter((s) => {
      if (!s.created_at) return false;
      const f = new Date(s.created_at);
      return (
        f.getFullYear() === ahora.getFullYear() &&
        f.getMonth() === ahora.getMonth()
      );
    }).length;

    // SUM real sobre filas de ventas desde Supabase
    const totalIngresos = ventas
      .filter((v) => (v.tipo ?? '').toLowerCase() === 'ingreso')
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0);
    const totalEgresos = ventas
      .filter((v) => (v.tipo ?? '').toLowerCase() === 'egreso')
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0);

    // SUM de ingresos solo del mes actual
    const ingresosEsteMes = ventas
      .filter((v) => {
        if ((v.tipo ?? '').toLowerCase() !== 'ingreso') return false;
        if (!v.created_at) return true;
        const f = new Date(v.created_at);
        return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth();
      })
      .reduce((acc, v) => acc + Number(v.monto ?? 0), 0);

    // Asistencias registradas hoy
    const fechaHoyISO = hoy.toISOString().split('T')[0];
    const asistenciasHoy = asistencias.filter((a) => {
      if (!a.created_at) return false;
      return a.created_at.startsWith(fechaHoyISO);
    }).length;

    return {
      totalSocios: socios.length,
      sociosActivos,
      sociosPorVencer,
      sociosVencidos,
      nuevosEsteMes,
      totalIngresos,
      totalEgresos,
      ingresosEsteMes,
      balanceNeto: totalIngresos - totalEgresos,
      totalVentas: ventas.length,
      asistenciasHoy,
    };
  }, [socios, ventas, asistencias]);

  // ── Notificaciones dinámicas derivadas de los socios ─────────────────────
  // Genera avisos en tiempo real: membresías vencidas y próximas a vencer (≤3 días).
  // El usuario puede limpiarlas (dismissedNotifs) pero reaparecerán si el estado cambia.
  const notificaciones = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const notifs = [];
    socios.forEach((s) => {
      const fv = s.fecha_venc ?? s.fechaVenc;
      const nombre = s.nombre ?? 'Un socio';

      if (s.estado === 'Vencida' || s.estado === 'Vencido') {
        notifs.push(`${nombre} tiene la membresía vencida`);
      } else if (fv && fv !== '—') {
        const d = new Date(fv);
        if (!Number.isNaN(d.getTime())) {
          const diffDays = Math.ceil((d.getTime() - hoy.getTime()) / 86_400_000);
          if (diffDays === 0) notifs.push(`${nombre} vence hoy`);
          else if (diffDays === 1) notifs.push(`${nombre} vence mañana`);
          else if (diffDays > 1 && diffDays <= 3) notifs.push(`${nombre} vence en ${diffDays} días`);
        }
      }
    });

    // Filtrar descartadas y limitar a 15 para no saturar la UI
    return notifs.filter((n) => !dismissedNotifs.has(n)).slice(0, 15);
  }, [socios, dismissedNotifs]);

  // limpiarNotificaciones DEBE ir después del useMemo de notificaciones
  const limpiarNotificaciones = useCallback(() => {
    setDismissedNotifs((prev) => new Set([...prev, ...notificaciones]));
  }, [notificaciones]);

  const t = useCallback(
    (key) => {
      const safeLanguage = translations[language] ? language : 'ES';
      return translations[safeLanguage][key] || key;
    },
    // `translations` es un objeto estático definido inline — su referencia cambia
    // en cada render pero su contenido nunca varía. Incluirlo en deps provocaría
    // reconstrucciones innecesarias de `t`; se omite de forma explícita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  return (
    <GymContext.Provider
      value={{
        // Datos
        socios,
        ventas,
        asistencias,
        rutinas,
        planes,
        // Estado de carga
        loading,
        dbError,
        // Métricas globales computadas
        dashboardMetrics,
        // Socios
        agregarSocio,
        editarSocio,
        eliminarSocio,
        // Ventas
        registrarVenta,
        // Planes
        agregarPlan,
        editarPlan,
        eliminarPlan,
        // Asistencias
        realizarCheckIn,
        // UI
        theme,
        language,
        notificaciones,
        toggleTheme,
        toggleLanguage,
        limpiarNotificaciones,
        t,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => useContext(GymContext);
