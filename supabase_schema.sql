-- ============================================================
--  NEXUS-Q — Esquema de Base de Datos Supabase / PostgreSQL
--  Versión: 1.0 | Mayo 2026
--
--  INSTRUCCIONES:
--  1. Abre tu proyecto en https://supabase.com/dashboard
--  2. Ve a: Database → SQL Editor → "New Query"
--  3. Pega TODO el contenido de este archivo y haz clic en "Run"
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. TABLA: planes
--    Catálogo de membresías disponibles en el gimnasio.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.planes (
  id            BIGSERIAL PRIMARY KEY,
  nombre        TEXT        NOT NULL,
  precio        NUMERIC     NOT NULL DEFAULT 0,
  duracion      TEXT        NOT NULL DEFAULT '1 Mes',
  estado        TEXT        NOT NULL DEFAULT 'Activo'
                            CHECK (estado IN ('Activo', 'Inactivo')),
  caracteristicas TEXT[]    DEFAULT ARRAY[]::TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.planes IS 'Catálogo de planes de membresía de Nexus-Q.';


-- ────────────────────────────────────────────────────────────
-- 2. TABLA: socios
--    Registro central de todos los miembros del gimnasio.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.socios (
  id            BIGSERIAL PRIMARY KEY,
  nombre        TEXT        NOT NULL,
  dni           TEXT        NOT NULL,
  tel           TEXT,
  mail          TEXT,
  plan          TEXT        NOT NULL,
  estado        TEXT        NOT NULL DEFAULT 'Activo'
                            CHECK (estado IN ('Activo', 'Vencido', 'Vencida')),
  dias          INTEGER     NOT NULL DEFAULT 30,
  fecha_venc    TEXT,
  apto          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.socios IS 'Registro de socios del gimnasio con estado de membresía.';

-- Índice para búsquedas rápidas por DNI
CREATE INDEX IF NOT EXISTS idx_socios_dni ON public.socios (dni);


-- ────────────────────────────────────────────────────────────
-- 3. TABLA: ventas
--    Historial de transacciones (ingresos y egresos) del módulo Caja.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ventas (
  id            BIGSERIAL PRIMARY KEY,
  concepto      TEXT        NOT NULL,
  monto         NUMERIC     NOT NULL DEFAULT 0,
  tipo          TEXT        NOT NULL DEFAULT 'ingreso'
                            CHECK (tipo IN ('ingreso', 'egreso')),
  metodo        TEXT        NOT NULL DEFAULT 'Efectivo',
  socio_id      BIGINT      REFERENCES public.socios (id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.ventas IS 'Registro de ingresos y egresos del control de Caja.';

-- Índice para reportes por tipo y fecha
CREATE INDEX IF NOT EXISTS idx_ventas_tipo       ON public.ventas (tipo);
CREATE INDEX IF NOT EXISTS idx_ventas_created_at ON public.ventas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_socio_id   ON public.ventas (socio_id);


-- ────────────────────────────────────────────────────────────
-- 4. TABLA: asistencias
--    Log de check-ins (control de acceso) por socio.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.asistencias (
  id            BIGSERIAL PRIMARY KEY,
  socio_id      BIGINT      REFERENCES public.socios (id) ON DELETE CASCADE,
  nombre        TEXT        NOT NULL,
  plan          TEXT,
  estado_acceso TEXT        NOT NULL DEFAULT 'Permitido'
                            CHECK (estado_acceso IN ('Permitido', 'Denegado')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.asistencias IS 'Log de asistencias y control de acceso al gimnasio.';

CREATE INDEX IF NOT EXISTS idx_asistencias_socio_id   ON public.asistencias (socio_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_created_at ON public.asistencias (created_at DESC);


-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
--    Habilitado pero con política pública para uso con anon key.
--    En producción, restringe por roles de usuario autenticado.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.planes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso abierto (anon key — desarrollo)
CREATE POLICY "allow_all_planes"      ON public.planes      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_socios"      ON public.socios      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ventas"      ON public.ventas      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_asistencias" ON public.asistencias FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 6. REALTIME
--    Activa la replicación en tiempo real para las tablas
--    que los componentes React escuchan vía canal Supabase.
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.socios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ventas;


-- ────────────────────────────────────────────────────────────
-- 7. DATOS BASE — Planes de membresía iniciales
-- ────────────────────────────────────────────────────────────
INSERT INTO public.planes (nombre, precio, duracion, estado, caracteristicas)
VALUES
  (
    'Mensual',
    100,
    '1 Mes',
    'Activo',
    ARRAY['Acceso completo al gimnasio', 'Vestuarios y duchas', 'Plan de entrenamiento básico']
  ),
  (
    '3 Meses Promo',
    250,
    '3 Meses',
    'Activo',
    ARRAY['Todo lo del plan Mensual', 'Clases grupales incluidas', 'Evaluación física inicial']
  ),
  (
    '6 Meses Promo',
    450,
    '6 Meses',
    'Activo',
    ARRAY['Todo lo del plan Trimestral', 'Entrenador personalizado (2 sesiones/mes)', 'Acceso a zona VIP']
  ),
  (
    'Anual',
    720,
    '12 Meses',
    'Activo',
    ARRAY['Todo lo del plan Semestral', 'Acceso ilimitado 24/7', 'Congelamiento gratuito hasta 30 días', 'Prioridad en reservas de clases']
  ),
  (
    'Plan Estudiantes',
    60,
    '1 Mes',
    'Inactivo',
    ARRAY['Acceso en horarios reducidos (7am-3pm)', 'Vestuarios y duchas', 'Descuento especial con carnet estudiantil']
  )
ON CONFLICT DO NOTHING;


-- ============================================================
--  FIN DEL SCRIPT
--  Nexus-Q estará operativo en tiempo real tras ejecutar esto.
-- ============================================================
