-- ============================================================
--  NEXUS-Q — Esquema de Base de Datos Supabase / PostgreSQL
--  Versión: 1.2 | Junio 2026
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
                            CHECK (estado IN ('Activo', 'Vencida')),
  dias          INTEGER     NOT NULL DEFAULT 30,
  fecha_venc    DATE,
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
  -- Campos agregados en v1.2 para trazabilidad de pasarela de pagos
  pago_id       UUID,                -- FK a pagos.id (se añade tras crear la tabla pagos)
  origen        TEXT        NOT NULL DEFAULT 'efectivo'
                            CHECK (origen IN ('efectivo', 'mercadopago', 'pasarela')),
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
-- 5. TABLA: pagos
--    Registro de intentos y cobros procesados por pasarelas de pago.
--    Cada fila representa un ciclo completo de pago (pending→paid/failed).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pagos (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id              TEXT,                         -- Reservado para multitenancy futuro
  socio_id            BIGINT      REFERENCES public.socios (id) ON DELETE SET NULL,
  plan_id             BIGINT      REFERENCES public.planes (id) ON DELETE SET NULL,
  monto               NUMERIC     NOT NULL DEFAULT 0,
  moneda              TEXT        NOT NULL DEFAULT 'PEN',
  estado              TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (estado IN ('pending', 'paid', 'failed', 'refunded')),
  provider            TEXT        NOT NULL DEFAULT 'mercadopago'
                                  CHECK (provider IN ('mercadopago', 'culqi', 'efectivo')),
  provider_payment_id TEXT        UNIQUE,           -- ID externo de la pasarela (idempotencia)
  provider_payload    JSONB,                        -- Respuesta cruda del proveedor
  idempotency_key     TEXT        UNIQUE,           -- Previene cobros duplicados
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.pagos IS 'Registro de pagos procesados por pasarelas (Mercado Pago, etc.).';

CREATE INDEX IF NOT EXISTS idx_pagos_socio_id   ON public.pagos (socio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado      ON public.pagos (estado);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at  ON public.pagos (created_at DESC);

-- FK diferida: ventas.pago_id → pagos.id (añadir después de crear ambas tablas)
ALTER TABLE public.ventas
  ADD CONSTRAINT fk_ventas_pago_id
  FOREIGN KEY (pago_id) REFERENCES public.pagos (id) ON DELETE SET NULL
  NOT VALID;                                        -- NOT VALID para no bloquear filas existentes


-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
--    Habilitado pero con política pública para uso con anon key.
--    En producción, restringe por roles de usuario autenticado.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.planes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos       ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso abierto (anon key — desarrollo)
-- IMPORTANTE: En producción reemplazar por políticas basadas en auth.uid()
CREATE POLICY "allow_all_planes"      ON public.planes      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_socios"      ON public.socios      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ventas"      ON public.ventas      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_asistencias" ON public.asistencias FOR ALL USING (true) WITH CHECK (true);
-- pagos: solo accesible desde el servidor (service_role); anon no puede leer ni escribir
CREATE POLICY "allow_service_pagos"   ON public.pagos       FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 7. REALTIME
--    Activa la replicación en tiempo real para las tablas
--    que los componentes React escuchan vía canal Supabase.
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.socios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ventas;


-- ────────────────────────────────────────────────────────────
-- 8. DATOS BASE — Planes de membresía iniciales
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


-- ============================================================
--  MIGRACIÓN v1.1 — Normalización de tipos y estado canónico
--
--  EJECUTAR SOLO SI YA TIENES DATOS EN LA BASE.
--  Si acabas de crear la BD con este script, omite este bloque.
--
--  Pasos: Database → SQL Editor → pegar y ejecutar.
-- ============================================================

-- 1. Convertir fecha_venc de TEXT a DATE
--    Las filas con formato 'YYYY-MM-DD' se convierten directamente.
--    Las filas con formato diferente o NULL quedan como NULL.
ALTER TABLE public.socios
  ALTER COLUMN fecha_venc TYPE DATE
  USING CASE
    WHEN fecha_venc ~ '^\d{4}-\d{2}-\d{2}$' THEN fecha_venc::DATE
    ELSE NULL
  END;

-- 2. Unificar valor 'Vencido' → 'Vencida' (valor canónico único)
UPDATE public.socios
  SET estado = 'Vencida'
  WHERE estado = 'Vencido';

-- 3. Reemplazar la restricción de estado para eliminar 'Vencido'
ALTER TABLE public.socios
  DROP CONSTRAINT IF EXISTS socios_estado_check;

ALTER TABLE public.socios
  ADD CONSTRAINT socios_estado_check
  CHECK (estado IN ('Activo', 'Vencida'));

-- ============================================================
--  FIN MIGRACIÓN v1.1
-- ============================================================


-- ============================================================
--  MIGRACIÓN v1.2 — Integración Mercado Pago
--
--  EJECUTAR SOLO SI YA TIENES DATOS EN LA BASE.
--  Si ejecutaste este script desde cero, omite este bloque.
--
--  Pasos: Database → SQL Editor → pegar y ejecutar.
-- ============================================================

-- 1. Crear tabla pagos (si no existe)
CREATE TABLE IF NOT EXISTS public.pagos (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id              TEXT,
  socio_id            BIGINT      REFERENCES public.socios (id) ON DELETE SET NULL,
  plan_id             BIGINT      REFERENCES public.planes (id) ON DELETE SET NULL,
  monto               NUMERIC     NOT NULL DEFAULT 0,
  moneda              TEXT        NOT NULL DEFAULT 'PEN',
  estado              TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (estado IN ('pending', 'paid', 'failed', 'refunded')),
  provider            TEXT        NOT NULL DEFAULT 'mercadopago'
                                  CHECK (provider IN ('mercadopago', 'culqi', 'efectivo')),
  provider_payment_id TEXT        UNIQUE,
  provider_payload    JSONB,
  idempotency_key     TEXT        UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_socio_id  ON public.pagos (socio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado     ON public.pagos (estado);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON public.pagos (created_at DESC);

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_service_pagos" ON public.pagos FOR ALL USING (true) WITH CHECK (true);

-- 2. Añadir columnas a ventas (si no existen)
ALTER TABLE public.ventas
  ADD COLUMN IF NOT EXISTS pago_id UUID,
  ADD COLUMN IF NOT EXISTS origen  TEXT NOT NULL DEFAULT 'efectivo';

-- Añadir CHECK a la nueva columna origen
ALTER TABLE public.ventas
  DROP CONSTRAINT IF EXISTS ventas_origen_check;

ALTER TABLE public.ventas
  ADD CONSTRAINT ventas_origen_check
  CHECK (origen IN ('efectivo', 'mercadopago', 'pasarela'));

-- 3. FK ventas.pago_id → pagos.id (NOT VALID para no bloquear tablas existentes)
ALTER TABLE public.ventas
  DROP CONSTRAINT IF EXISTS fk_ventas_pago_id;

ALTER TABLE public.ventas
  ADD CONSTRAINT fk_ventas_pago_id
  FOREIGN KEY (pago_id) REFERENCES public.pagos (id) ON DELETE SET NULL
  NOT VALID;

-- ============================================================
--  FIN MIGRACIÓN v1.2
-- ============================================================


-- ============================================================
--  MIGRACIÓN v1.3 — Productos e Diagnósticos Físicos
--  Junio 2026
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 6. TABLA: productos
--    Inventario de artículos a la venta en el gimnasio.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.productos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  categoria   TEXT        NOT NULL DEFAULT 'General',
  precio      NUMERIC     NOT NULL DEFAULT 0,
  stock       INTEGER     NOT NULL DEFAULT 0,
  stock_minimo INTEGER    NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos (categoria);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_productos" ON public.productos
  FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 7. TABLA: diagnosticos
--    Evaluaciones físicas periódicas de los socios.
--    Nota: socio_id es BIGINT porque socios.id es BIGSERIAL.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id        BIGINT      REFERENCES public.socios (id) ON DELETE CASCADE,
  peso            NUMERIC,
  altura          NUMERIC,
  imc             NUMERIC,
  grasa_corporal  NUMERIC,
  masa_muscular   NUMERIC,
  notas           TEXT,
  fecha           DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Añade la columna a tablas ya creadas sin la columna (idempotente)
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS masa_muscular NUMERIC;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_socio_id  ON public.diagnosticos (socio_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha      ON public.diagnosticos (fecha DESC);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_diagnosticos" ON public.diagnosticos
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
--  FIN MIGRACIÓN v1.3
-- ============================================================


-- ============================================================
--  MIGRACIÓN v1.4 — Rutinas de Entrenamiento por Socio
--  Junio 2026
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 8. TABLA: rutinas
--    Una rutina activa por socio (upsert por socio_id).
--    ejercicios se almacena como JSONB: array de objetos
--    [{ nombre: str, series: int, reps: str }]
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rutinas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id    BIGINT      REFERENCES public.socios (id) ON DELETE CASCADE,
  nombre      TEXT        NOT NULL DEFAULT 'Sin nombre',
  nivel       TEXT        NOT NULL DEFAULT 'Principiante'
                          CHECK (nivel IN ('Principiante', 'Intermedio', 'Avanzado')),
  ejercicios  JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rutinas_socio_id ON public.rutinas (socio_id);
CREATE INDEX  IF NOT EXISTS idx_rutinas_nivel       ON public.rutinas (nivel);

ALTER TABLE public.rutinas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_rutinas" ON public.rutinas
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
--  FIN MIGRACIÓN v1.4
-- ============================================================
