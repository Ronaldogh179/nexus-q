import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ─── Constantes de roles ──────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:      'ADMIN',
  RECEPCION:  'RECEPCION',
  ENTRENADOR: 'ENTRENADOR',
};

// ─── Mapa de permisos por rol ─────────────────────────────────────────────────
// null = sin restricción (ve todo). Set = tabs permitidos explícitamente.
const PERMISOS = {
  [ROLES.ADMIN]: null,

  [ROLES.RECEPCION]: new Set([
    'dashboard',
    'socios',       // solo la lista, no sub-ítems de métricas/alertas/etc.
    'caja',
    'facturacion',
    'pagos',
    'controlacceso',
    'ajustes',
  ]),

  [ROLES.ENTRENADOR]: new Set([
    'dashboard',
    'socios',       // solo la lista
    'diagnosticos',
    'entrenamiento',
    'ajustes',
  ]),
};

// ─── Metadatos de UI para cada rol ───────────────────────────────────────────
export const ROLE_META = {
  [ROLES.ADMIN]: {
    label:       'Admin',
    color:       'text-blue-400',
    bg:          'bg-blue-500/15',
    border:      'border-blue-500/30',
    activeBg:    'bg-blue-600',
    activeText:  'text-white',
  },
  [ROLES.RECEPCION]: {
    label:       'Recepción',
    color:       'text-emerald-400',
    bg:          'bg-emerald-500/15',
    border:      'border-emerald-500/30',
    activeBg:    'bg-emerald-600',
    activeText:  'text-white',
  },
  [ROLES.ENTRENADOR]: {
    label:       'Entrenador',
    color:       'text-purple-400',
    bg:          'bg-purple-500/15',
    border:      'border-purple-500/30',
    activeBg:    'bg-purple-600',
    activeText:  'text-white',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(ROLES.ADMIN);

  /** Devuelve true si el rol activo puede ver la pestaña indicada */
  const puedeVer = useCallback(
    (tab) => {
      const permisos = PERMISOS[role];
      if (permisos === null) return true; // ADMIN ve todo
      return permisos.has(tab);
    },
    [role]
  );

  const value = useMemo(
    () => ({ role, setRole, puedeVer, ROLE_META }),
    [role, puedeVer]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole debe usarse dentro de <RoleProvider>');
  return ctx;
};
