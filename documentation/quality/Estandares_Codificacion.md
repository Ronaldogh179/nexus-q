# Estándares de Codificación — Nexus-Q

**Ámbito normativo:** ISO/IEC 25010 — *Mantenibilidad* (analizabilidad, modificabilidad, modularidad, reusabilidad).  
**Versión del documento:** 1.0  
**Stack:** React 19, JavaScript (ES modules), Vite 8, Tailwind CSS 4  

---

## 1. Propósito y alcance

Este documento define las **reglas de generación de código** para el repositorio **Nexus-Q**. Su finalidad es reducir la variabilidad arbitraria entre contribuciones, de modo que el software permanezca **uniforme, predecible y revisable**, en línea con los objetivos de **mantenibilidad** establecidos por **ISO/IEC 25010**.

La mantenibilidad se ve directamente afectada por la **homogeneidad** del código: cuanto más uniforme es el estilo, menor es el esfuerzo cognitivo en la *analizabilidad* y mayor la *eficiencia* de las revisiones por pares (*code review*).

---

## 2. Nomenclatura de archivos y módulos

### 2.1 Componentes React — PascalCase

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componente de página o sección | `PascalCase.jsx` | `Socios.jsx`, `Dashboard.jsx`, `Caja.jsx` |
| Subcomponente dedicado (si se extrae a archivo propio) | `PascalCase.jsx` | `StatCard.jsx` (si aplica en el futuro) |

**Justificación (Mantenibilidad — ISO/IEC 25010):**  
El uso de **PascalCase** para componentes alinea el nombre del archivo con el identificador del componente exportado, lo que mejora la **analizabilidad** en el árbol del proyecto y reduce ambigüedad en importaciones (`import Socios from './Socios.jsx'`). La *modificabilidad* se beneficia al localizar rápidamente el módulo responsable de una vista.

---

### 2.2 Hooks personalizados — camelCase con prefijo `use`

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Hook personalizado | `use` + `PascalCase` o camelCase coherente | `useSociosFilter.js`, `useGym.js` (si se extrajera lógica) |

**Justificación (Mantenibilidad):**  
El prefijo **`use`** es una convención del ecosistema React que permite distinguir hooks de utilidades puras. Un nombre consistente favorece la **reusabilidad** y la *analizabilidad* en búsquedas globales del repositorio.

---

### 2.3 Utilidades, contexto y tests

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Contexto | `PascalCase` + `Context` | `GymContext.jsx` |
| Utilidades puras (sin JSX) | `camelCase.js` | `formatCurrency.js` |
| Pruebas unitarias | Mismo nombre base + `.test.jsx` | `Socios.test.jsx` |

**Justificación (Mantenibilidad):**  
Separar por convención los **artefactos de prueba** del código de producción mejora la *modularidad* del repositorio y la trazabilidad entre implementación y verificación.

---

## 3. Orden de importaciones

**Regla obligatoria:** Agrupar las importaciones en bloques lógicos, separados por una línea en blanco, en el siguiente orden:

1. **React y APIs del núcleo** (`react`, hooks del propio React si se importan explícitamente).
2. **Módulos de terceros** (por ejemplo, `lucide-react`, librerías de gráficos).
3. **Alias internos del proyecto** (`src/...`), incluyendo contexto y utilidades.
4. **Importaciones relativas del mismo directorio** (`./`, `../`), si existen.

**Ejemplo orientativo:**

```javascript
import React, { useMemo, useState, useCallback } from 'react';

import { UserPlus, Search } from 'lucide-react';

import { useGym } from 'src/context/GymContext.jsx';
```

**Justificación (Mantenibilidad — ISO/IEC 25010):**  
Un orden fijo reduce el ruido en los *diffs* de control de versiones y acelera la **analizabilidad** del archivo: el revisor identifica de inmediato dependencias externas versus internas. Esto incrementa la **eficiencia del code review** y la *modificabilidad* al resolver conflictos de merge con menos ambigüedad.

---

## 4. Estructura de clases Tailwind CSS 4

Tailwind CSS 4 favorece utilidades atómicas y composición declarativa. Para Nexus-Q se establecen las siguientes reglas de **generación de clases** en JSX:

### 4.1 Orden sugerido dentro de `className` (template literals)

Aplicar bloques en este orden cuando el `className` sea extenso:

1. **Layout y caja:** `flex`, `grid`, `block`, `inline-flex`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `min-w-*`, `overflow-*`.
2. **Posicionamiento:** `relative`, `absolute`, `fixed`, `inset-*`, `z-*`.
3. **Tipografía:** `text-*`, `font-*`, `leading-*`, `tracking-*`, `uppercase`.
4. **Color y fondo:** `bg-*`, `text-*` (color de texto), `border-*`, opacidades (`/15`, etc.).
5. **Borde y radio:** `rounded-*`, `border`, `divide-*`.
6. **Efectos y transición:** `shadow-*`, `transition-*`, `animate-*`, `backdrop-*`.
7. **Estado y responsive (prefijos):** `hover:`, `focus:`, `dark:` (si se usa variante), `sm:`, `md:`, etc., agrupados al final del bloque lógico o intercalados de forma consistente con el patrón ya usado en el archivo.

**Justificación (Mantenibilidad):**  
Un patrón repetible en las listas de utilidades mejora la **analizabilidad** y reduce errores al duplicar bloques similares (por ejemplo, tarjetas en tema claro/oscuro). La *modificabilidad* del diseño se facilita al comparar visualmente dos componentes con la misma estructura de clases.

### 4.2 Template literals y tema (`theme`)

**Regla:** Cuando existan ramas `theme === 'dark' ? ... : ...`, mantener la rama **dark** primero o **light** primero de forma **consistente en todo el archivo** (alineado con el estilo predominante del componente existente).

**Justificación (Mantenibilidad):**  
La inconsistencia en el orden de las ramas dificulta la revisión visual y aumenta el riesgo de regresiones al copiar y pegar bloques.

### 4.3 Longitud del `className`

**Regla:** Si una sola cadena de clases supera aproximadamente **dos líneas de editor** de forma habitual, valorar extraer a:

- constantes de cadena al inicio del archivo (`const cardBase = '...'`), o  
- subcomponente con clases encapsuladas.

**Justificación (Mantenibilidad):**  
Cadenas excesivamente largas degradan la *analizabilidad* y dificultan el *code review* por desplazamiento horizontal.

---

## 5. Consistencia y revisión por pares (Code Review)

**Norma de consistencia:** Todo cambio integrado a la rama principal del proyecto debe ser **uniforme** con respecto a:

- nomenclatura de archivos y exports;
- orden de importaciones;
- patrones de Tailwind descritos en este documento;
- convenciones ya presentes en el archivo tocado (no introducir un segundo estilo en el mismo módulo sin consenso del equipo).

**Justificación (Mantenibilidad — ISO/IEC 25010):**  
La revisión por pares es un mecanismo de aseguramiento de la calidad que depende de la **predecibilidad** del código. La uniformidad reduce el tiempo de lectura (*analizabilidad*) y la probabilidad de que un revisor pase por alto un defecto al enfrentarse a estilos heterogéneos (*modificabilidad* y *capacidad de prueba* indirectamente, al facilitar la identificación de ramas muertas o lógica duplicada).

**Criterio de aceptación en revisión:**  
Si un PR introduce un patrón nuevo (por ejemplo, orden de imports distinto al resto del repositorio), debe **justificarse en la descripción del PR** o alinearse al estándar antes del merge.

---

## 6. Tabla resumen — Regla vs. atributo de calidad

| Regla | Subcaracterística de mantenibilidad (ISO/IEC 25010) principal |
|-------|----------------------------------------------------------------|
| PascalCase para componentes | Analizabilidad, modularidad |
| `use*` para hooks | Reusabilidad, analizabilidad |
| Orden de importaciones fijo | Analizabilidad, eficiencia del code review |
| Estructura ordenada de clases Tailwind | Analizabilidad, modificabilidad |
| Consistencia obligatoria entre PRs | Analizabilidad, colaboración en revisión |

---

## 7. Conclusión

Los estándares de codificación de Nexus-Q no persiguen la uniformidad como fin en sí mismo, sino como **medio técnico** para materializar la **mantenibilidad** exigida por **ISO/IEC 25010**. Un código uniforme es más barato de entender, de revisar y de evolucionar; por tanto, constituye una inversión directa en la calidad del producto de software.

---

*Documento interno Nexus-Q — Calidad estática / Mantenibilidad.*
