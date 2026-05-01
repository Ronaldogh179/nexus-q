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

// Normaliza una fila de la tabla `socios` al shape que usan los componentes
const mapSocio = (row) => ({
  ...row,
  iniciales: getIniciales(row.nombre),
  fechaVenc: row.fecha_venc ?? row.fechaVenc ?? '—',
  dias: typeof row.dias === 'number' ? row.dias : 0,
  apto: Boolean(row.apto),
});

// Extrae el monto numérico de strings como "Mensual (S/ 100)"
const getMontoByPlan = (planStr) => {
  const match = String(planStr || '').match(/S\/\s*(\d+)/);
  return match ? Number(match[1]) : 0;
};

// ─────────────────────────────────────────────────────────────────────────────

export const GymProvider = ({ children }) => {
  const { addToast } = useToast();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('ES');
  const [notificaciones, setNotificaciones] = useState([
    'Martín venció hoy',
    'Nueva venta registrada en caja',
  ]);

  // ── Estado principal de datos ─────────────────────────────────────────────
  const [socios, setSocios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  const featuresBase = [
    'Clases de baile en horarios asignados',
    'Vestuarios y duchas',
    'Entrenador personalizado',
    'Plan de entrenamiento',
  ];

  const [planes, setPlanes] = useState([
    { id: 1, nombre: 'Mensual', precio: 100, duración: '1 Mes', estado: 'Activo', caracteristicas: featuresBase },
    { id: 2, nombre: '3 Meses Promo', precio: 250, duración: '3 Meses', estado: 'Activo', caracteristicas: featuresBase },
    { id: 3, nombre: '6 Meses Promo', precio: 450, duración: '6 Meses', estado: 'Activo', caracteristicas: featuresBase },
    { id: 4, nombre: 'Plan Estudiantes', precio: 60, duración: '1 Mes', estado: 'Inactivo', caracteristicas: featuresBase },
  ]);

  const [asistencias, setAsistencias] = useState([
    { id: 101, nombre: 'Ana López', plan: 'Yoga', hora: '10:45', estado: 'Permitido', avatar: 'AL' },
  ]);

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
          { data: planesData, error: planesErr },
        ] = await Promise.all([
          supabase.from('socios').select('*').order('id', { ascending: false }),
          supabase.from('ventas').select('*').order('id', { ascending: false }),
          supabase.from('planes').select('*'),
        ]);

        if (sociosErr) throw sociosErr;
        if (ventasErr) throw ventasErr;

        setSocios((sociosData || []).map(mapSocio));
        setVentas(ventasData || []);

        // Solo reemplaza los planes si Supabase devuelve filas
        if (!planesErr && planesData && planesData.length > 0) {
          setPlanes(planesData);
        }
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
            setVentas((prev) => [payload.new, ...prev]);
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

    return () => {
      supabase.removeChannel(sociosChannel);
      supabase.removeChannel(ventasChannel);
    };
  }, []);

  // ── Mutaciones de Socios ──────────────────────────────────────────────────

  const agregarSocio = useCallback(async (nuevo) => {
    const socioPayload = {
      nombre: nuevo.nombre,
      dni: nuevo.dni,
      tel: nuevo.tel,
      mail: nuevo.mail,
      plan: nuevo.plan,
      apto: Boolean(nuevo.apto),
      estado: nuevo.estado || 'Activo',
      dias: typeof nuevo.dias === 'number' ? nuevo.dias : 30,
      fecha_venc: nuevo.fechaVenc ?? null,
    };

    const { data: insertedSocio, error: socioErr } = await supabase
      .from('socios')
      .insert(socioPayload)
      .select()
      .single();

    if (socioErr) {
      console.error('[Nexus-Q] Error al insertar socio:', socioErr.message);
      addToast({ message: `Error al registrar socio: ${socioErr.message}`, type: 'error' });
      return;
    }

    // Auto-genera registro en ventas (Caja) con el monto del plan
    const monto = getMontoByPlan(nuevo.plan);
    if (monto > 0) {
      const { error: ventaErr } = await supabase.from('ventas').insert({
        concepto: `Membresía: ${nuevo.nombre} — ${nuevo.plan}`,
        monto,
        metodo: 'Efectivo',
        tipo: 'ingreso',
        socio_id: insertedSocio.id,
      });

      if (ventaErr) {
        console.warn('[Nexus-Q] Socio creado pero error al registrar venta:', ventaErr.message);
      }
    }

    addToast({ message: `✓ Socio "${nuevo.nombre}" registrado y guardado en la nube.`, type: 'success' });
    // El Realtime actualizará el estado local automáticamente
  }, [addToast]);

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

    const dbPayload = {
      nombre: datosActualizados.nombre,
      dni: datosActualizados.dni,
      tel: datosActualizados.tel,
      mail: datosActualizados.mail,
      plan: datosActualizados.plan,
      apto: datosActualizados.apto,
      estado: datosActualizados.estado,
      dias: datosActualizados.dias,
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
    const ventaPayload = {
      concepto: v.concepto,
      monto: v.monto,
      metodo: v.metodo,
      tipo: v.tipo || 'ingreso',
    };

    const { error } = await supabase.from('ventas').insert(ventaPayload);
    if (error) {
      console.error('[Nexus-Q] Error al registrar venta:', error.message);
      addToast({ message: `Error al registrar venta: ${error.message}`, type: 'error' });
      // Fallback local para no bloquear el flujo
      setVentas((prev) => [{ ...v, id: `TRX-${Date.now()}`, fecha: 'Hoy' }, ...prev]);
    } else {
      addToast({ message: `Venta de S/ ${v.monto} registrada en Caja.`, type: 'success' });
    }
    // El Realtime actualizará el estado local
  }, [addToast]);

  // ── Mutaciones de Planes (local; Supabase opcional) ───────────────────────

  const agregarPlan = useCallback((nuevoPlan) => {
    setPlanes((prev) => [...prev, { ...nuevoPlan, id: Date.now() }]);
  }, []);

  const editarPlan = useCallback((id, planActualizado) => {
    setPlanes((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...planActualizado } : plan))
    );
  }, []);

  const eliminarPlan = useCallback((id) => {
    setPlanes((prev) => prev.filter((plan) => plan.id !== id));
  }, []);

  // ── Check-in: valida membresía, persiste en Supabase y actualiza estado local ──

  const realizarCheckIn = useCallback(
    async (dni) => {
      const normalized = String(dni ?? '').trim();
      const socio = socios.find((s) => String(s.dni).trim() === normalized);

      if (!socio) return { success: false, motivo: 'DNI no encontrado en el sistema' };

      const membresiaVencida = socio.estado === 'Vencida' || socio.estado === 'Vencido';
      const estadoAcceso = membresiaVencida ? 'Denegado' : 'Permitido';
      const motivo = membresiaVencida ? 'Membresía Vencida' : 'Socio Activo';

      const nuevoCheckIn = {
        id: Date.now(),
        nombre: socio.nombre,
        plan: socio.plan,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estado: estadoAcceso,
        motivo,
        avatar: socio.iniciales,
      };

      // Actualización optimista en el estado local
      setAsistencias((prev) => [nuevoCheckIn, ...prev]);

      // Persistencia en Supabase
      const { error } = await supabase.from('asistencias').insert({
        socio_id: socio.id,
        nombre: socio.nombre,
        plan: socio.plan,
        estado_acceso: estadoAcceso,
      });

      if (error) {
        console.warn('[Nexus-Q] Check-in registrado localmente, error en Supabase:', error.message);
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

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
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

    const sociosActivos = socios.filter((s) => s.estado === 'Activo').length;
    const sociosPorVencer = socios.filter(
      (s) => s.estado === 'Activo' && typeof s.dias === 'number' && s.dias > 0 && s.dias <= 7
    ).length;
    const sociosVencidos = socios.filter(
      (s) => s.estado === 'Vencida' || s.estado === 'Vencido'
    ).length;

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
    };
  }, [socios, ventas]);

  const t = useCallback(
    (key) => {
      const safeLanguage = translations[language] ? language : 'ES';
      return translations[safeLanguage][key] || key;
    },
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
