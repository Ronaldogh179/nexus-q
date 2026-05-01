# Plan de Pruebas de Software — Nexus-Q

**Proyecto:** Nexus-Q — Sistema de Gestión de Gimnasio  
**Versión del documento:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Pruebas de Experiencia de Usuario (UX/Manual)  
**Responsable:** QA Team — Nexus-Q  

---

## 1. Introducción

El presente documento define el **Plan de Pruebas de Software** para el módulo de gestión de socios y el panel de control (Dashboard) de la aplicación **Nexus-Q**. Establece los objetivos, el alcance, el enfoque metodológico y los casos de prueba manuales que deben ejecutarse para validar la calidad funcional y la experiencia de usuario de la plataforma.

Las pruebas aquí documentadas corresponden a la categoría de **pruebas de aceptación de usuario (UAT)** y **pruebas exploratorias de UX**, y se ejecutan directamente sobre la interfaz de la aplicación en un navegador real, sin instrumentación automatizada.

---

## 2. Alcance

### 2.1 Funcionalidades incluidas

| Área                        | Descripción                                                                          |
|-----------------------------|--------------------------------------------------------------------------------------|
| Módulo Socios               | Registro de nuevos socios, edición y eliminación                                    |
| Panel de Control (Dashboard) | Visualización de métricas: socios activos, ventas, asistencias                      |
| Alertas de Membresía        | Indicadores visuales de membresías vencidas o próximas a vencer en la lista de socios |
| Filtros por Plan            | Pastillas de filtro: Todos, Mensual, 3 Meses Promo, 6 Meses Promo, Anual           |
| Soporte Dual de Tema        | Comportamiento consistente en modo Dark y modo Light                                 |

### 2.2 Funcionalidades excluidas

- Integración con pasarelas de pago externas
- Autenticación y gestión de roles de usuario
- Exportación de reportes a PDF/Excel
- Módulo de Entrenamiento y Rutinas

### 2.3 Entorno de prueba

| Parámetro         | Valor                             |
|-------------------|-----------------------------------|
| Navegador         | Google Chrome 124+ / Edge 124+   |
| Resolución        | 1440 × 900 (escritorio)          |
| Sistema Operativo | Windows 10 / 11                  |
| Framework         | React 19 + Vite 8 + Tailwind 4   |
| Servidor          | `npm run dev` (localhost:5173)   |

---

## 3. Objetivos de Prueba

1. Verificar que el flujo de **registro de un nuevo socio** persiste correctamente en el estado global y refleja los cambios en la UI de forma inmediata.
2. Confirmar que las **métricas del Panel de Control** muestran valores coherentes con el estado real de los socios en el contexto.
3. Validar que las **alertas visuales de membresías vencidas o próximas a vencer** se activan bajo las condiciones establecidas en la regla de negocio (≤ 7 días restantes).
4. Comprobar que los **filtros por plan** presentan únicamente los socios correspondientes al plan seleccionado.
5. Garantizar que la interfaz mantiene consistencia visual en **modo Dark** y **modo Light**.

---

## 4. Criterios de Aceptación

- **Aprobado (PASS):** El resultado observado coincide exactamente con el resultado esperado definido en el caso de prueba.
- **Fallido (FAIL):** El resultado observado difiere del esperado; se debe registrar con captura de pantalla y descripción del defecto.
- **Bloqueado (BLOCKED):** No es posible ejecutar el caso por dependencia de otro módulo o error previo.

---

## 5. Casos de Prueba

### CP-001 — Registro de nuevo socio con plan Anual

| Campo              | Detalle                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| **ID**             | CP-001                                                                                    |
| **Módulo**         | Socios → Modal "Nuevo Socio"                                                              |
| **Prioridad**      | Alta                                                                                      |
| **Precondición**   | La aplicación está activa en `localhost:5173`. El módulo Socios está visible.            |
| **Pasos**          | 1. Hacer clic en el botón **"Nuevo socio"** (esquina superior derecha). <br>2. Completar el campo **Nombre Completo** con "Carlos Mendoza". <br>3. Completar **DNI** con "45123456". <br>4. Completar **Teléfono** con "+54 9 351 000 0000". <br>5. Dejar el correo vacío. <br>6. Seleccionar **Plan Elegido** = "Anual (S/ 720)". <br>7. Marcar el checkbox **Apto médico al día**. <br>8. Hacer clic en **"Guardar socio"**. |
| **Resultado esperado** | El modal se cierra. La fila de "Carlos Mendoza" aparece en la primera posición de la tabla. La columna **Días** muestra **360**. El badge de estado muestra **Activo** (color verde). |
| **Resultado observado** | _(Completar durante ejecución)_                                                       |
| **Estado**         | ⬜ PENDIENTE                                                                               |

---

### CP-002 — Visualización de métricas en el Panel de Control tras alta de socio

| Campo              | Detalle                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| **ID**             | CP-002                                                                                    |
| **Módulo**         | Dashboard → Tarjetas de métricas                                                          |
| **Prioridad**      | Alta                                                                                      |
| **Precondición**   | Hay al menos 3 socios registrados en el sistema, 2 de ellos con estado "Activo".         |
| **Pasos**          | 1. Navegar al módulo **Panel** (Dashboard) desde el Sidebar. <br>2. Observar el valor de la tarjeta **"Total Socios"**. <br>3. Observar el valor de la tarjeta **"Activos"**. <br>4. Volver a **Socios** y registrar un nuevo socio con plan "Mensual (S/ 100)". <br>5. Regresar al **Panel** y verificar los contadores. |
| **Resultado esperado** | La tarjeta **"Total Socios"** incrementa en 1. La tarjeta **"Activos"** incrementa en 1. Los valores son consistentes entre el módulo Socios y el Dashboard sin necesidad de recargar la página. |
| **Resultado observado** | _(Completar durante ejecución)_                                                       |
| **Estado**         | ⬜ PENDIENTE                                                                               |

---

### CP-003 — Alerta visual de membresía próxima a vencer (≤ 7 días)

| Campo              | Detalle                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| **ID**             | CP-003                                                                                    |
| **Módulo**         | Socios → Tabla → Columna "Días"                                                           |
| **Prioridad**      | Alta                                                                                      |
| **Precondición**   | Existe al menos un socio con `estado = "Activo"` y `dias = 5` en el estado del contexto. |
| **Pasos**          | 1. Navegar al módulo **Socios**. <br>2. Localizar el socio con 5 días restantes en la tabla. <br>3. Observar el color del valor en la columna **"Días"**. <br>4. Comparar con otro socio que tiene más de 10 días. |
| **Resultado esperado** | El valor "5" se muestra en **color ámbar** (`text-amber-500`). Un socio con más de 10 días muestra el número en **color neutro** (blanco/gris según tema). La tarjeta **"Por Vencer"** del Panel de Control cuenta este socio. |
| **Resultado observado** | _(Completar durante ejecución)_                                                       |
| **Estado**         | ⬜ PENDIENTE                                                                               |

---

### CP-004 — Filtro por plan "Anual" muestra únicamente socios del plan correcto

| Campo              | Detalle                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| **ID**             | CP-004                                                                                    |
| **Módulo**         | Socios → Filtros por plan (pastillas)                                                     |
| **Prioridad**      | Media                                                                                     |
| **Precondición**   | Existen socios con distintos planes (Mensual, 3 Meses, 6 Meses, Anual) en el sistema.   |
| **Pasos**          | 1. Navegar al módulo **Socios**. <br>2. Verificar que el filtro **"Todos"** está activo y la tabla muestra todos los socios. <br>3. Hacer clic en la pastilla **"Anual"**. <br>4. Observar los registros resultantes en la tabla. <br>5. Hacer clic en **"Todos"** para restablecer. |
| **Resultado esperado** | Al activar el filtro "Anual", la tabla muestra únicamente socios cuyo plan contiene "Anual". El contador de pie de tabla indica el subconjunto correcto (ej.: "Mostrando 1 de 4 socios"). Al volver a "Todos", se muestran todos los registros. |
| **Resultado observado** | _(Completar durante ejecución)_                                                       |
| **Estado**         | ⬜ PENDIENTE                                                                               |

---

### CP-005 — Membresía vencida muestra badge rojo y "—" en columna Días

| Campo              | Detalle                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| **ID**             | CP-005                                                                                    |
| **Módulo**         | Socios → Tabla → Columna "Estado" + Columna "Días"                                        |
| **Prioridad**      | Alta                                                                                      |
| **Precondición**   | Existe al menos un socio con `estado = "Vencida"` o `"Vencido"` en el sistema (ej.: "Martín" del dataset inicial). |
| **Pasos**          | 1. Navegar al módulo **Socios**. <br>2. Localizar el socio "Martín" (o cualquier socio con estado vencido). <br>3. Observar el badge en la columna **"Estado"**. <br>4. Observar el valor en la columna **"Días"**. <br>5. Hacer clic en el ícono **"Ver"** de ese socio y observar la sección "Días restantes" en el modal. |
| **Resultado esperado** | El badge muestra el texto **"Vencido"** sobre fondo rojo semitransparente (`bg-red-500/15`). La columna **"Días"** muestra el símbolo **"—"** (guión largo). En el modal de detalle, "Días restantes" también muestra **"—"**. |
| **Resultado observado** | _(Completar durante ejecución)_                                                       |
| **Estado**         | ⬜ PENDIENTE                                                                               |

---

## 6. Matriz de Trazabilidad

| ID Caso | Funcionalidad cubierta              | Función del código relacionada         | Prioridad |
|---------|-------------------------------------|----------------------------------------|-----------|
| CP-001  | Registro de socio + cálculo de días | `submitNuevoSocio`, `getDiasByPlan`    | Alta      |
| CP-002  | Métricas del Dashboard en tiempo real | `agregarSocio`, contadores en contexto | Alta      |
| CP-003  | Alerta visual días ≤ 7              | `diasLabel`, lógica CSS condicional    | Alta      |
| CP-004  | Filtro por plan                     | `matchesPlan`, `FILTER_OPTIONS`        | Media     |
| CP-005  | Estado vencido en UI                | `diasLabel`, `estadoBadge`             | Alta      |

---

## 7. Gestión de Defectos

Al identificar un defecto durante la ejecución manual, registrar la siguiente información:

| Campo             | Descripción                                            |
|-------------------|--------------------------------------------------------|
| **ID Defecto**    | DEF-XXX (numeración secuencial)                       |
| **ID Caso**       | Referencia al caso de prueba que lo detectó           |
| **Descripción**   | Descripción clara y reproducible del defecto          |
| **Severidad**     | Crítica / Alta / Media / Baja                         |
| **Captura**       | Adjuntar screenshot del comportamiento incorrecto     |
| **Estado**        | Abierto / En corrección / Cerrado                     |

---

## 8. Conclusión

Este plan de pruebas cubre los flujos críticos de usuario del sistema Nexus-Q con foco en la integridad de los datos de membresía, la coherencia de las métricas del panel de control y la correcta presentación de alertas de vencimiento. La ejecución satisfactoria de los cinco casos de prueba constituye el criterio mínimo de aceptación para considerar estable la versión actual del módulo de socios.
