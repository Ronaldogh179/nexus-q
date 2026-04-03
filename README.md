# ⚡ NEXUS-Q v1.0
### Gestión Inteligente de Rendimiento y Membresías para Gimnasios

**Nexus-Q** es una plataforma integral desarrollada en **Laravel 11** diseñada para optimizar la administración de atletas y el control de accesos en tiempo real mediante un enfoque de "Búnker de Seguridad".

---

## 🔗 Acceso al Proyecto
* **Repositorio:** [https://github.com/Ronaldogh179/nexus-q](https://github.com/Ronaldogh179/nexus-q)
* **Estado:** Localhost (Desarrollo activo)

## 🔑 Credenciales de Prueba (Para Revisión)
Para facilitar la evaluación del sistema, utilice los siguientes datos:

| Módulo | Acceso / URL | Credencial |
| :--- | :--- | :--- |
| **Staff / Admin** | `/staff-login` | Contraseña: `admin123` |
| **Portal Socio** | `/portal` | DNI: `76446724` (o cualquier socio registrado) |
| **Puerta** | `/control-acceso` | Validación por DNI |

---

## 📖 Manual de Uso Rápido

### 1. Panel Administrativo (Staff)
1. Ingrese a `/staff-login` con la contraseña maestra.
2. Desde el **Dashboard**, observe las métricas de socios activos vs. vencidos.
3. En la sección **Socios**, puede registrar nuevos atletas, renovar membresías o eliminarlos.
4. Genere el **Reporte de Morosos** en PDF con un solo clic.

### 2. Portal del Atleta (Cliente)
1. El socio ingresa a `/portal` con su DNI.
2. Puede visualizar su **Carnet Digital** con código QR.
3. El sistema calcula automáticamente el **IMC** al registrar peso y talla.
4. Se muestra un historial visual del progreso físico.

### 3. Control de Acceso (Puerta)
1. El encargado de puerta ingresa el DNI en `/control-acceso`.
2. El sistema valida la fecha de vencimiento:
   - **Verde:** Membresía vigente (Acceso concedido).
   - **Rojo:** Membresía vencida o no encontrado (Acceso denegado).

---

## 🛠️ Stack Tecnológico
* **Core:** PHP 8.3 + Laravel 11
* **Database:** MySQL
* **Frontend:** Blade, Bootstrap 5, Chart.js
* **Reportes:** DomPDF

---
Desarrollado con ❤️ por **Ronaldogh179** - 2026