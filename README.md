# Nexus-Q – Sistema de Gestión para Gimnasios v1.0

Plataforma SaaS (Software as a Service) moderna y eficiente para la digitalización, control financiero y administración integral de centros fitness en tiempo real.

## 🚀 Características Principales
* **Módulo de Autenticación:** Control de acceso restringido para personal autorizado mediante validación de seguridad de tokens JWT.
* **Gestión de Socios:** Control completo del ciclo de vida de los miembros (altas, bajas, modificaciones) y automatización en el monitoreo de estados y vencimientos de membresías.
* **Control de Caja:** Registro cronológico de transacciones financieras (ingresos y egresos) con cálculo inmediato del balance neto del negocio.
* **Control de Acceso:** Sistema de check-in mediante validación de DNI para el registro inmediato de asistencias en la nube.
* **Nexus-AI (Asistente Gerencial Inteligente):** Integración con el motor avanzado de Inteligencia Artificial de Google Gemini para procesar los KPIs del día y generar análisis estratégicos automáticos.

## 🛠️ Pila Tecnológica (Stack)
* **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router DOM 7, Recharts.
* **Capa Backend y Persistencia:** Plataforma Supabase (Motor relacional PostgreSQL gestionado en la nube).
* **Capa de Inteligencia Artificial:** API REST de Google Gemini (Modelo de producción `gemini-2.5-flash`).

## 💻 Instrucciones de Instalación Local
1. Clonar el repositorio localmente.
2. Instalar las dependencias de producción ejecutando en la terminal:
   ```bash
   npm install