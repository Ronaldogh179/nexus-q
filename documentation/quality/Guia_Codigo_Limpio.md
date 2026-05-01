# Guía de Código Limpio — Nexus-Q

**Ámbito normativo:** ISO/IEC 25010 — Característica *Mantenibilidad* (subcaracterísticas: modularidad, reusabilidad, analizabilidad, modificabilidad).  
**Versión del documento:** 1.0  
**Stack de referencia:** React 19, Vite, Tailwind CSS 4  

---

## 1. Introducción

En ingeniería de sistemas de software, la **mantenibilidad** no es un atributo secundario: condiciona el costo total de propiedad del producto, la velocidad de corrección de defectos y la capacidad de incorporar nuevos requisitos sin degradar la arquitectura existente. La norma **ISO/IEC 25010** reconoce la mantenibilidad como una dimensión explícita de la calidad del producto.

El presente documento establece **principios de código limpio** (*Clean Code*) orientados al ecosistema **React 19** en el proyecto **Nexus-Q**, de modo que cada decisión de diseño pueda justificarse ante revisiones técnicas y auditorías de calidad bajo el prisma de la mantenibilidad normativa.

---

## 2. Principios aplicados a React 19

### 2.1 Componentes pequeños y con responsabilidad única

**Regla:** Preferir componentes acotados que resuelvan una única preocupación de presentación o de orquestación de UI.

**Justificación (Mantenibilidad — ISO/IEC 25010):**  
Un componente extenso incrementa la **complejidad cognitiva** y dificulta la *analizabilidad* (localizar fallos, entender flujos de datos). La *modificabilidad* se ve penalizada porque cualquier cambio local puede tener efectos colaterales no evidentes. La **modularidad** mejora cuando cada unidad tiene fronteras claras entre vista, estado local y efectos secundarios.

**Práctica en Nexus-Q:**  
Pantallas complejas (por ejemplo, listas con modales y métricas) deben descomponerse en subcomponentes presentacionales (`StatCard`, `SocioFormModal`, etc.) cuando el archivo supera de forma sostenida el umbral que el equipo defina para revisiones cómodas (orientativamente, varias centenas de líneas con múltiples responsabilidades mezcladas).

---

### 2.2 Props descriptivas y contratos explícitos

**Regla:** Nombrar las props de forma autoexplicativa (`theme`, `submitLabel`, `onClose`) y evitar prop drilling profundo sin abstracción (contexto o composición).

**Justificación (Mantenibilidad):**  
Las props constituyen el **contrato público** del componente. Nombres ambiguos (`data`, `info`, `flag`) reducen la *analizabilidad* y obligan a inferir tipos y semántica leyendo el cuerpo del componente. La *reusabilidad* aumenta cuando el consumidor del componente entiende el contrato sin abrir la implementación.

**Práctica en Nexus-Q:**  
Mantener coherencia con el contexto global (`useGym`) para datos transversales (`t`, `theme`) y reservar las props para variaciones locales del componente o callbacks explícitos (`onSubmit`, `onClose`).

---

### 2.3 Hooks personalizados para lógica “pesada”

**Regla:** Extraer a hooks personalizados (`useNombreDominio`) la lógica que combine varios `useState`, `useMemo`, `useCallback` o efectos, cuando esa lógica sea reutilizable o dificulte la lectura del componente principal.

**Justificación (Mantenibilidad):**  
La concentración de lógica en el cuerpo del componente de vista erosiona la **separación de preocupaciones** y la *modificabilidad*: un cambio en reglas de negocio obliga a navegar entre JSX y bloques de estado entrelazados. Un hook dedicado mejora la *analizabilidad* (un solo lugar para reglas) y favorece pruebas unitarias aisladas de la capa de presentación cuando corresponda.

**Práctica en Nexus-Q:**  
Ejemplos candidatos a extracción: filtrado y agregación reutilizable de socios, normalización de planes, o sincronización de formularios con modales. El criterio no es el tamaño absoluto del archivo, sino la **densidad de reglas** mezcladas con marcado.

---

### 2.4 Coherencia con React 19

**Regla:** Adoptar patrones estables de React 19 (composición, hooks, contexto) y evitar anti-patrones que dificulten la evolución del runtime (por ejemplo, mutación directa de estado compartido fuera de los mecanismos previstos por React).

**Justificación (Mantenibilidad):**  
Alinear el código con el modelo mental oficial del framework reduce la **deuda de conocimiento** del equipo y mejora la *modificabilidad* ante actualizaciones de dependencias y herramientas (Vite, ESLint).

---

## 3. Deuda técnica: concepto y gestión en Nexus-Q

### 3.1 Definición académica

La **deuda técnica** es una metáfora introducida en ingeniería de software para describir el costo implícito de decisiones de implementación que optimizan el corto plazo (velocidad de entrega) en detrimento de la calidad interna del producto. Al igual que la deuda financiera, genera **intereses**: cada ciclo de mantenimiento paga más esfuerzo del que habría sido necesario si el diseño hubiera sido más riguroso desde el origen.

Desde la perspectiva de **ISO/IEC 25010**, la deuda técnica impacta de forma directa la **mantenibilidad** (mayor tiempo para entender y cambiar el sistema) y, de forma indirecta, otras características como la **fiabilidad** y la **seguridad**, cuando atajos impiden aplicar controles de forma uniforme.

### 3.2 Fuentes comunes de deuda en front-end

| Origen de deuda | Síntoma | Impacto en mantenibilidad |
|-----------------|---------|---------------------------|
| Componentes monolíticos | Archivos difíciles de revisar | Analizabilidad y modificabilidad bajas |
| Duplicación de lógica | Misma regla copiada en varios módulos | Modularidad y reusabilidad bajas |
| Nombres opacos | Variables y funciones no autodocumentadas | Analizabilidad baja |
| Acoplamiento fuerte a detalles de UI | Lógica de negocio mezclada con clases Tailwind extensas | Modificabilidad baja ante cambios de diseño |

### 3.3 Cómo Nexus-Q busca minimizar la deuda técnica

Nexus-Q adopta un enfoque **proactivo** (prevenir) y **reactivo** (gestionar lo acumulado):

1. **Modularidad y convenciones:** Estructura por componentes y documentación de estándares de codificación (`Estandares_Codificacion.md`) para homogeneizar el estilo y reducir fricción en *code review*.
2. **Verificación automatizada:** Pruebas unitarias (Vitest) sobre lógica extraíble y regresiones en módulos críticos (por ejemplo, socios), alineado con la subcaracterística *capacidad de prueba* dentro de mantenibilidad.
3. **Plan de pruebas manual:** Casos documentados que actúan como criterio de aceptación y detectan divergencias entre intención de negocio y comportamiento observable antes de integrar cambios sensibles.
4. **Contexto centralizado (`GymContext`):** Reduce la proliferación de fuentes de verdad para datos transversales y favorece la *modificabilidad* de reglas globales (tema, idioma, socios).

**Principio rector:** Toda decisión que acelere la entrega pero degrade la claridad del código debe quedar **registrada** (comentario breve en PR, tarea de refactor o entrada en backlog técnico), de modo que la deuda sea **visible y priorizable**, no invisible.

---

## 4. Relación explícita con ISO/IEC 25010 (Mantenibilidad)

| Subcaracterística ISO/IEC 25010 | Cómo la soporta esta guía |
|---------------------------------|---------------------------|
| Modularidad | Componentes pequeños, separación vista / lógica vía hooks |
| Reusabilidad | Props claras, hooks reutilizables, menos duplicación |
| Analizabilidad | Nombres expresivos, menos complejidad por archivo |
| Modificabilidad | Menor acoplamiento, patrones React 19 alineados con documentación oficial |
| Capacidad de prueba | Lógica extraíble y cubierta por pruebas donde aplique |

---

## 5. Conclusión

La aplicación sistemática de código limpio en **React 19** no es un formalismo estético: es un instrumento de **ingeniería de sistemas** para preservar la **mantenibilidad** del producto Nexus-Q en el marco de **ISO/IEC 25010**. La gestión consciente de la **deuda técnica** convierte la calidad interna en un riesgo gobernado y medible, en coherencia con una cultura de mejora continua del software.

---

*Documento interno Nexus-Q — Calidad estática / Mantenibilidad.*
