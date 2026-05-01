# Informe de Alineación Normativa — Nexus-Q

**Documento:** Cumplimiento_ISO.md  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Informe técnico interno — Calidad y cumplimiento normativo  
**Alcance del producto:** Aplicación web de gestión para gimnasio (React, Vite, Tailwind CSS)

---

## Resumen ejecutivo

El presente informe describe la **alineación orientativa** del proyecto **Nexus-Q** con tres marcos de referencia internacionalmente reconocidos: **ISO/IEC 25010** (calidad del producto de software), **ISO 9001** (sistemas de gestión de la calidad) e **ISO/IEC 27001** (gestión de la seguridad de la información). Se explicitan los vínculos entre las características de calidad normativas y las prácticas ya implementadas en el código y en la documentación de pruebas, sin constituir por sí mismo una certificación oficial.

---

## 1. Introducción y marco de referencia

Nexus-Q es un sistema modular que centraliza socios, caja, panel de control y otros dominios operativos. La adopción de estándares internacionales no implica únicamente el cumplimiento de requisitos documentales, sino la **traducción sistemática** de dichos requisitos en decisiones de arquitectura, diseño de interfaz, pruebas y controles de seguridad de la información aplicables al contexto del producto.

Este documento se elabora con fines de **gobernanza interna**, auditoría de diseño y preparación ante revisiones de calidad o seguridad en entornos académicos o corporativos.

---

## 2. ISO/IEC 25010 — Calidad del producto de software

La norma **ISO/IEC 25010** define un modelo de calidad del producto de software organizado en características y subcaracterísticas. A continuación se detalla la aplicación en Nexus-Q de tres de ellas, seleccionadas por su relevancia directa en el código base actual.

### 2.1 Adecuación funcional

La **adecuación funcional** abarca la completitud, corrección y pertinencia de las funciones respecto a las necesidades declaradas del usuario.

| Subcaracterística (ISO/IEC 25010) | Manifestación en Nexus-Q | Evidencia en el producto |
|-----------------------------------|--------------------------|---------------------------|
| Completitud funcional | Registro y gestión del ciclo de vida del socio; operaciones de caja con agregación de totales | Módulo `Socios` (altas, edición, filtros, métricas); módulo `Caja` (listado de transacciones, KPIs de ingresos/egresos/balance) |
| Corrección funcional | Cálculo coherente de días de membresía según plan; consistencia de estados (Activo / vencido) | Lógica de planes y `dias` en contexto y componentes de socios |
| Pertinencia funcional | Interfaz orientada a tareas frecuentes (búsqueda, filtro por plan, acciones por fila) | Tabla de socios, pastillas de filtro, modales de formulario |

**Síntesis:** Los módulos **Socios** y **Caja** constituyen los pilares funcionales sobre los que se demuestra la adecuación entre requisitos de negocio (membresías y flujo de efectivo) y comportamiento observable en la interfaz.

### 2.2 Usabilidad

La **usabilidad** comprende la capacidad del producto para ser usado con eficacia, eficiencia y satisfacción por usuarios específicos en un contexto de uso definido.

| Dimensión de usabilidad | Aplicación en Nexus-Q |
|---------------------------|------------------------|
| Eficacia | Navegación por módulos, acciones explícitas (ver, editar, eliminar), confirmación en operaciones destructivas |
| Eficiencia | Búsqueda por nombre o DNI; filtros por plan en una sola interacción; tablas con información densa pero escaneable |
| Satisfacción (percepción) | Soporte **Dark/Light** y **i18n** mediante `GymContext`, coherencia visual con Tailwind CSS |

**Síntesis:** La interfaz se concibe como **sistema usable** mediante patrones de diseño consistentes (tarjetas, tablas, modales) y accesibilidad básica (etiquetas, roles implícitos en controles nativos).

### 2.3 Mantenibilidad

La **mantenibilidad** incluye la modularidad, reusabilidad, analizabilidad, modificabilidad y capacidad de prueba del software.

| Subcaracterística | Práctica en Nexus-Q |
|--------------------|---------------------|
| Modularidad | Separación por componentes React (`Socios`, `Caja`, `Dashboard`, etc.) y estado global en `GymContext` |
| Modificabilidad | Toolchain moderna (**Vite**) con recarga rápida y alias de rutas (`src`) |
| Capacidad de prueba | Suite **Vitest** con pruebas unitarias en `src/tests/unit/` (p. ej. `Socios.test.jsx`) y plan manual en `documentation/testing/Plan_de_Pruebas.md` |

**Síntesis:** La pila **React + Vite** reduce el costo de cambio y favorece la **evolución controlada** del código, alineada con los principios de mantenibilidad de ISO/IEC 25010.

### 2.4 Tabla comparativa — Modelo ISO/IEC 25010 vs. Nexus-Q (extracto)

| Característica ISO/IEC 25010 | Grado de cobertura en Nexus-Q | Comentario |
|------------------------------|-------------------------------|------------|
| Adecuación funcional | **Alta** (módulos Socios y Caja) | Funcionalidad núcleo implementada y trazable en UI |
| Rendimiento | **Media / no cuantificada** | Sin perfiles de carga formal en este informe |
| Compatibilidad | **Media** | Navegadores modernos; sin matriz de compatibilidad certificada adjunta |
| Usabilidad | **Alta** (patrones UI + i18n + tema) | Criterios verificables en pruebas manuales UX |
| Fiabilidad | **Media** | Depende de robustez del front-end y de futuros backends |
| Seguridad | **Parcial** (véase ISO/IEC 27001) | Controles documentados; implementación en evolución |
| Mantenibilidad | **Alta** (estructura + tests) | Evidencia en repositorio y pipeline de prueba local |
| Usabilidad y eficiencia de operación | **Alta (entorno escritorio)** | Interfaz optimizada para estaciones de trabajo administrativas con navegación rápida por módulos y alta densidad de información accionable |

---

## 3. ISO 9001 — Sistemas de gestión de la calidad

La norma **ISO 9001** enfatiza el **enfoque a procesos**, la **orientación al cliente** y la **mejora continua** (ciclo Planificar-Hacer-Verificar-Actuar).

### 3.1 Enfoque en procesos

En Nexus-Q, los procesos de negocio relevantes se reflejan en flujos de software:

| Proceso de negocio | Representación en el sistema | Salida observable |
|--------------------|------------------------------|-------------------|
| Alta y mantenimiento de socios | Formularios, persistencia en contexto, tabla maestra | Lista actualizada de socios y métricas derivadas |
| Control de caja | Registro de transacciones, filtros, totales | Balance neto, ingresos y egresos agregados |
| Supervisión operativa | Dashboard con indicadores | Lectura rápida del estado del club |

### 3.2 Mejora continua y el Plan de Pruebas

El documento **`documentation/testing/Plan_de_Pruebas.md`** constituye un artefacto de **gestión de la calidad** alineado con ISO 9001 en los siguientes aspectos:

| Principio ISO 9001 | Cómo lo soporta el Plan de Pruebas |
|--------------------|------------------------------------|
| Enfoque al cliente (satisfacción) | Casos de prueba centrados en experiencia de usuario (registro, métricas, alertas) |
| Mejora continua | Registro de resultados observados, estados PASS/FAIL/BLOCKED y sección de gestión de defectos |
| Toma de decisiones basada en evidencia | Tablas de casos con pasos, precondiciones y resultados esperados reproducibles |
| Relación con las partes interesadas | Trazabilidad entre casos y funciones del código (matriz de trazabilidad en el propio plan) |

**Síntesis:** La combinación de **pruebas unitarias automatizadas** (Vitest) y **pruebas manuales documentadas** materializa el ciclo de verificación y retroalimentación propio de la mejora continua.

---

## 4. ISO/IEC 27001 — Gestión de la seguridad de la información

**ISO/IEC 27001** prescribe un Sistema de Gestión de Seguridad de la Información (SGSI) basado en controles del Anexo A y en el tratamiento del riesgo. Nexus-Q, en su estado actual como aplicación front-end, debe documentar **controles aplicables** y **limitaciones** con transparencia.

### 4.1 Protección de datos de socios

Los datos de socios (identidad, contacto, plan, estado de membresía) constituyen **información personal** en el sentido amplio del término. La alineación con ISO/IEC 27001 se expresa así:

| Control / tema (referencia conceptual) | Estado en Nexus-Q | Recomendación de maduración |
|----------------------------------------|-------------------|----------------------------|
| Confidencialidad (A.5, A.8 enfoque) | Datos en memoria del cliente; sin cifrado en tránsito documentado en este informe | Integrar API con TLS 1.2+ y políticas de retención |
| Integridad de datos | Estado centralizado en `GymContext`; coherencia UI ↔ estado | Persistencia en backend con auditoría de cambios |
| Disponibilidad | Depende del entorno de despliegue | Estrategia de backup y RTO/RPO definidos por infraestructura |

### 4.2 Integridad de registros financieros (módulo Caja)

El módulo **Caja** presenta transacciones tipificadas (ingreso/egreso), concepto, método de pago y monto, con **cálculos agregados** (totales y balance neto). Desde la perspectiva de seguridad de la información:

| Riesgo | Mitigación conceptual en el diseño actual | Nota |
|--------|-------------------------------------------|------|
| Alteración no autorizada de montos | Los totales se derivan de la colección de transacciones en el estado del componente | En producción: controles de autorización y registro inmutable en servidor |
| Repudio de operaciones | No aplicable sin firma digital ni bitácora normada | Requiere trazabilidad de usuario y timestamp en backend |
| Divulgación de movimientos sensibles | Interfaz sin autenticación documentada en este informe | Exigir autenticación, roles y registro de accesos |

**Síntesis:** La **integridad lógica** de los cálculos en Caja es coherente a nivel de presentación; la **integridad normativa** (no repudio, auditoría, segregación de funciones) demanda capas adicionales típicamente fuera del alcance exclusivo del front-end.

---

## 5. Matriz de cumplimiento consolidada

La siguiente matriz resume el **grado de alineación** entre cada norma y las prácticas observables en Nexus-Q. Los niveles se interpretan como **madurez documentada e implementada en el repositorio**, no como certificación externa.

| Norma | Ámbito principal | Nivel de alineación | Evidencia principal | Brechas reconocidas |
|-------|------------------|---------------------|---------------------|---------------------|
| ISO/IEC 25010 | Calidad del producto software | **Alta** (subconjunto) | UI modular, i18n, tests unitarios, módulos Socios/Caja | Rendimiento, portabilidad y fiabilidad no perfilados formalmente |
| ISO 9001 | Gestión de la calidad | **Media–Alta** | Plan de pruebas manual + scripts de prueba automatizados | Política de calidad formal, auditorías internas y KPIs organizacionales externos al repo |
| ISO/IEC 27001 | Seguridad de la información | **Media (documental)** | Identificación de activos (socios, caja) y riesgos descritos | SGSI completo, SoA, tratamiento de riesgos cuantificado y controles operativos en infraestructura |

**Leyenda de niveles:** *Baja* = intención o mención genérica; *Media* = prácticas parciales con evidencia; *Alta* = prácticas sistemáticas con artefactos en el repositorio.

---

## 6. Conclusiones

Nexus-Q exhibe una **convergencia razonable** con ISO/IEC 25010 en las dimensiones de adecuación funcional (Socios, Caja), usabilidad y eficiencia operativa (interfaz orientada a trabajo administrativo en escritorio/laptop) y mantenibilidad (React, Vite, pruebas). La adopción de ISO 9001 se apoya de manera explícita en el **Plan de Pruebas** y en la automatización de verificaciones, como mecanismos de mejora continua. La aproximación a ISO/IEC 27001 se centra en la **clasificación de activos** (datos de socios y movimientos de caja) y en la **integridad conceptual** de los registros financieros en interfaz, reconociendo que un SGSI pleno exige controles organizacionales y técnicos adicionales.

---

## 7. Referencias normativas (solo títulos)

- ISO/IEC 25010:2011 — *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models* (y revisiones posteriores del modelo de calidad).
- ISO 9001:2015 — *Quality management systems — Requirements*.
- ISO/IEC 27001:2022 — *Information security, cybersecurity and privacy protection — Information security management systems — Requirements*.

---

*Fin del informe.*
