/**
 * ============================================================
 *  NEXUS-Q — Test Suite: Gestión de Socios
 *  Norma: ISO/IEC/IEEE 29119 (Software Testing)
 *
 *  Identificador del plan: TP-SOC-001
 *  Módulo bajo prueba: Socios.jsx
 *  Tipo de prueba: End-to-End (E2E) funcional y de usabilidad
 *  Entorno: Desarrollo local · http://localhost:5173
 *  Prerrequisito: `npm run dev` en ejecución
 *
 *  Casos de prueba incluidos:
 *    TC-SOC-001  Autenticación y redirección al dashboard
 *    TC-SOC-002  Navegación a la sección de Socios
 *    TC-SOC-003  Verificación del encabezado y KPIs
 *    TC-SOC-004  Renderizado de la tabla y sus columnas
 *    TC-SOC-005  Funcionalidad de búsqueda de socios
 *    TC-SOC-006  Filtros por plan de membresía
 *    TC-SOC-007  Apertura del modal "Nuevo Socio"
 *    TC-SOC-008  Validación del formulario de alta de socio
 *    TC-SOC-009  Cierre del modal sin guardar
 * ============================================================
 */

import { test, expect, type Page } from '@playwright/test';

// ── Constantes de entorno ──────────────────────────────────────────────────────
const BASE_URL   = process.env.BASE_URL        ?? 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL      ?? 'ronaldogh1579@gmail.com';
const TEST_PASS  = process.env.TEST_PASSWORD   ?? 'Nexusq2026*';

// ── Textos esperados de la UI (Spanish locale por defecto) ────────────────────
const UI = {
  appTitle:        'Nexus-Q',
  loginButton:     'Iniciar sesión',
  sidebarSocios:   'Socios',          // t('members')
  pageHeading:     'Lista de Socios', // t('membersList')
  pageSubtitle:    'Gestión central', // t('managementCenter') — primer fragmento
  newMemberBtn:    'Nuevo socio',     // t('newMember')
  searchPlaceholder: 'Buscar por nombre o DNI...', // t('searchMembers')
  filterByPlan:    'Filtrar por plan', // t('filterByPlan')
  filterAll:       'Todos',           // t('all')
  colMember:       'Miembro',         // t('member')
  colContact:      'Contacto',        // t('contact')
  colStatus:       'Estado',          // t('status')
  colDays:         'Días',            // t('days')
  colActions:      'Acciones',        // t('actions')
  kpiTotal:        'Total Socios',    // t('totalMembers')
  kpiActive:       'Activos',         // t('active')
  kpiExpiring:     'Por Vencer',      // t('expiringSoon')
  kpiNew:          'Nuevos este mes', // t('newThisMonth')
  modalTitle:      'Nuevo socio',     // t('newMember') reutilizado como título
  saveMemberBtn:   'Guardar socio',   // t('saveMember')
  noResults:       'No hay socios que coincidan', // t('noMembersFound') primer fragmento
};

// ── Helper: flujo de login completo ───────────────────────────────────────────
async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto(BASE_URL);

  // Esperar a que aparezca el formulario de login (el spinner de auth puede
  // tardar un momento antes de mostrar el formulario)
  await expect(page.locator('h1')).toHaveText(UI.appTitle, { timeout: 10_000 });

  // Rellenar credenciales usando los id= definidos en Login.jsx
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  // Click en el botón de submit
  await page.getByRole('button', { name: UI.loginButton }).click();

  // Esperar a que la aplicación principal cargue (el sidebar es la señal de
  // que la sesión está activa y el router redirigió a '/')
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 15_000 });
}

// ── Helper: navegar a la sección Socios desde el sidebar ─────────────────────
async function navigateToSocios(page: Page): Promise<void> {
  // 1. Identificamos ambos botones de forma única
  const parentButton = page.getByRole('button', { name: UI.sidebarSocios, exact: true }).first();
  const childLink = page.getByRole('button', { name: UI.sidebarSocios, exact: true }).nth(1);

  // 2. Si el sub-menú (hijo) no está visible, hacemos clic en el padre para expandirlo
  if (!(await childLink.isVisible())) {
    await parentButton.click();
  }

  // 3. Hacemos clic en el enlace real
  await childLink.click();

  // 4. Esperar a que el encabezado de la página de Socios esté visible
  await expect(page.getByRole('heading', { name: UI.pageHeading })).toBeVisible({
    timeout: 8_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

test.describe('TP-SOC-001 · Gestión de Socios', () => {
  // Ejecutar los casos en serie para reutilizar el estado de sesión y
  // evitar logins repetidos que ralenticen la suite
  test.describe.configure({ mode: 'serial' });

  // ── Precondición común: sesión autenticada en la vista de Socios ───────────
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASS);
    await navigateToSocios(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-001 · Autenticación y redirección al panel
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-001: La autenticación redirige al dashboard principal', async ({ page }) => {
    // El login se ejecuta en beforeEach; aquí sólo verificamos el estado
    // posterior desde la vista de Socios (ya navegamos)
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-002 · Navegación a la sección de Socios
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-002: La sección Socios carga y muestra su encabezado', async ({ page }) => {
    // Criterio de aceptación: el <h1> visible contiene el título de página
    const heading = page.getByRole('heading', { name: UI.pageHeading });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(UI.pageHeading);

    // El subtítulo también debe estar presente
    await expect(page.getByText(UI.pageSubtitle, { exact: false })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-003 · Verificación de KPIs estadísticos
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-003: Los cuatro KPIs de socios son visibles', async ({ page }) => {
    const kpis = [UI.kpiTotal, UI.kpiActive, UI.kpiExpiring, UI.kpiNew];

    for (const label of kpis) {
      await expect(
        page.getByText(label, { exact: true }),
        `KPI "${label}" debe ser visible`
      ).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-004 · Renderizado de la tabla y sus columnas de cabecera
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-004: La tabla de socios se renderiza con todas sus columnas', async ({ page }) => {
    // La tabla debe existir en el DOM
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Verificar cada columna por su texto en el <thead>
    const expectedColumns = [
      UI.colMember,
      UI.colContact,
      UI.colStatus,
      UI.colDays,
      UI.colActions,
    ];

    for (const col of expectedColumns) {
      await expect(
        page.getByRole('columnheader', { name: col }),
        `La columna "${col}" debe aparecer en el encabezado de la tabla`
      ).toBeVisible();
    }

    // El pie de tabla con el conteo de socios debe estar presente
    await expect(page.getByText('Mostrando', { exact: false })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-005 · Funcionalidad de búsqueda de socios
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-005: El buscador filtra la lista de socios', async ({ page }) => {
    const searchInput = page.getByPlaceholder(UI.searchPlaceholder);

    // El campo de búsqueda debe estar presente e interactuable
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();

    // Escribir un término que es muy improbable que exista
    const terminoInexistente = 'XXXXXNOMBREQUENOEXISTEXXXXX';
    await searchInput.fill(terminoInexistente);

    // Esperar a que React procese el cambio de estado y filtre
    await page.waitForTimeout(300);

    // La tabla debe mostrar el mensaje de "sin resultados"
    await expect(
      page.getByText(UI.noResults, { exact: false })
    ).toBeVisible();

    // Limpiar la búsqueda
    await searchInput.clear();
    await page.waitForTimeout(300);

    // La tabla debe volver a mostrar el contenido normal
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-006 · Filtros por plan de membresía
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-006: Los botones de filtro por plan son visibles y clicables', async ({ page }) => {
    // El label del grupo de filtros
    await expect(page.getByText(UI.filterByPlan, { exact: true })).toBeVisible();

    // El botón "Todos" siempre debe existir
    const btnTodos = page.getByRole('button', { name: UI.filterAll, exact: true });
    await expect(btnTodos).toBeVisible();

    // Clicar "Todos" no debe romper la interfaz
    await btnTodos.click();
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-007 · Apertura del modal "Nuevo Socio"
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-007: El botón "Nuevo socio" abre el modal de alta', async ({ page }) => {
    // Localizar el botón de acción principal por su texto
    const btnNuevo = page.getByRole('button', { name: UI.newMemberBtn });
    await expect(btnNuevo).toBeVisible();
    await expect(btnNuevo).toBeEnabled();

    await btnNuevo.click();

    // El modal debe aparecer — se identifica por su título
    await expect(
      page.getByRole('heading', { name: UI.modalTitle })
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-008 · Validación del formulario de alta de socio
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-008: El formulario de alta contiene todos sus campos requeridos', async ({ page }) => {
    // Abrir el modal
    await page.getByRole('button', { name: UI.newMemberBtn }).click();
    await expect(
      page.getByRole('heading', { name: UI.modalTitle })
    ).toBeVisible({ timeout: 5_000 });

    // Verificar la presencia de cada campo por su id (añadidos en el refactor a11y)
    const campos: Array<{ id: string; description: string }> = [
      { id: '#soc-nombre', description: 'Nombre completo' },
      { id: '#soc-dni',    description: 'DNI'             },
      { id: '#soc-tel',    description: 'Teléfono'        },
      { id: '#soc-mail',   description: 'Correo'          },
      { id: '#soc-plan',   description: 'Plan'            },
    ];

    for (const campo of campos) {
      await expect(
        page.locator(campo.id),
        `El campo "${campo.description}" (${campo.id}) debe estar presente`
      ).toBeVisible();
    }

    // El botón de guardar debe estar presente y habilitado
    await expect(
      page.getByRole('button', { name: UI.saveMemberBtn })
    ).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  TC-SOC-009 · Cierre del modal sin guardar (cancelar)
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-SOC-009: El modal se cierra correctamente sin modificar la lista', async ({ page }) => {
    // Abrir el modal
    await page.getByRole('button', { name: UI.newMemberBtn }).click();
    await expect(
      page.getByRole('heading', { name: UI.modalTitle })
    ).toBeVisible({ timeout: 5_000 });

    // Escribir algo en el campo nombre para confirmar que el formulario
    // es interactuable, y luego cerrar SIN guardar
    await page.locator('#soc-nombre').fill('Test E2E - No guardar');

    // Cerrar usando el botón "Cancelar" del pie del modal (texto visible único,
    // evita colisión con el aria-label "Cerrar" del botón X del navbar)
    const btnCerrar = page.getByRole('button', { name: 'Cancelar', exact: true });
    await expect(btnCerrar).toBeVisible();
    await btnCerrar.click();

    // El modal NO debe ser visible
    await expect(
      page.getByRole('heading', { name: UI.modalTitle })
    ).not.toBeVisible({ timeout: 3_000 });

    // La lista de socios debe seguir visible (el cierre no rompe la UI)
    await expect(
      page.getByRole('heading', { name: UI.pageHeading })
    ).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
