# Tarea 72: Pantalla de Changelog Sincronizada con GitHub

## Descripción
Implementación de una pantalla dedicada de historial de versiones y cambios en `/changelog`, conectada en tiempo real con la rama `main` del repositorio oficial de GitHub (`FelipeRomeroDUOC/CoderCup-Lecturama`):
1. **Servicio de GitHub (`src/lib/github.ts`)**:
   - Consulta la API pública de GitHub (`/repos/FelipeRomeroDUOC/CoderCup-Lecturama/commits?sha=main&per_page=30`).
   - Implementa caché de Next.js (`next: { revalidate: 300 }` — 5 min) para optimizar el rendimiento y prevenir rate-limiting.
   - Cuenta con respaldo (fallback) en caso de contingencia de red o API limits.
2. **Página de Changelog (`src/app/changelog/page.tsx`)**:
   - Diseño estilo Timeline con identificación visual de tipos de cambio (`feat`, `fix`, `chore`, `refactor`, `perf`).
   - Muestra autor, avatar, fecha relativa, mensaje y enlace directo al commit en GitHub.
   - Cabecera con botón de navegación *"← Volver a Lecturama"*.
3. **Acceso desde la Landing Page (`src/app/page.tsx`)**:
   - Botón *"📜 Changelog"* en la barra superior junto al botón de GitHub.

## Propósito
- Brindar transparencia y visibilidad del desarrollo activo del proyecto, sincronizado directamente con la fuente oficial de código en GitHub.

## Componentes y Cambios
1. **`src/lib/github.ts`** (Nuevo servicio de sincronización)
2. **`src/app/changelog/page.tsx`** (Nueva página de historial)
3. **`src/app/page.tsx`** (Integración del botón de navegación en la cabecera)

## Rama
- `dev` (en pruebas locales)
