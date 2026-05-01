# Stack Tecnológico — Nexus-Q

Este documento detalla las herramientas seleccionadas para Nexus-Q, priorizando el rendimiento y la norma ISO/IEC 25010.

## ⚛️ Frontend: React 19 + Vite 8
Elegimos esto porque la velocidad no es negociable. En un gimnasio, el flujo de personas es constante y el sistema debe responder al instante. Vite 8 nos da el entorno de desarrollo más rápido del mercado y React 19 la mejor gestión de componentes.

## 🎨 Estilos: Tailwind CSS 4
Para lograr consistencia visual sin sacrificar velocidad. Tailwind 4 nos permite manejar el Modo Oscuro y la responsividad de forma nativa, asegurando que el sistema se vea profesional en cualquier pantalla.

## ☁️ Backend: Supabase (PostgreSQL)
Necesitábamos la robustez de una base de datos relacional para la "Caja" y los registros de socios. Supabase nos da el poder de PostgreSQL con la agilidad de la nube, garantizando integridad y seguridad de datos (ISO 27001).

## 🚀 Hosting y Portabilidad: Vercel + PWA
Vercel automatiza nuestro despliegue. Sumado a la tecnología PWA, permitimos que Nexus-Q se "instale" en celulares como una App nativa sin costos de tiendas, maximizando la portabilidad.

**Actualización de arquitectura (Mayo 2026):** La configuración PWA quedó integrada con manifiesto y Service Worker en modo `autoUpdate`, fortaleciendo los criterios de **Adaptabilidad** e **Instalabilidad** definidos por ISO/IEC 25010.

## 🐳 Consistencia: Docker
Nuestra garantía de que el software corre igual en cualquier lugar. Docker elimina el riesgo de errores por diferencias de entorno entre desarrollo y producción.

---
