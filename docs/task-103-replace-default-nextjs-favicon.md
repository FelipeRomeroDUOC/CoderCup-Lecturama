# Tarea 103: Reemplazo del Favicon Residual de Next.js y Cache-Busting

## Descripción
Corrección del ícono residual de Next.js/Vercel en la pestaña del navegador:
- Se reemplazó el archivo por defecto `src/app/favicon.ico` y `public/favicon.ico` con el nuevo emblema oficial dorado de Lecturama.
- Se añadió versión de cache-busting (`/app-icon.png?v=2`) en los metadatos de `src/app/layout.tsx` para forzar la actualización inmediata en navegadores locales y en producción (Vercel).

## Componentes y Cambios
1. **`src/app/favicon.ico`** (Sobrescrito)
2. **`public/favicon.ico`** (Creado)
3. **`src/app/layout.tsx`**

## Rama
- `dev` -> `main` (desplegado a producción)
