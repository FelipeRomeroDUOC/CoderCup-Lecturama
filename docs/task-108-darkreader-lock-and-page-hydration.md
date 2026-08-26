# Tarea 108: Bloqueo de DarkReader y Supresión de Hidratación en Landing

## Descripción
Prevención definitiva de mutaciones del DOM e inconsistencias de hidratación en SSR causadas por extensiones de modo oscuro (Dark Reader):
1. Se añadió la directiva oficial `<meta name="darkreader-lock" content="true" />` y metadatos en `src/app/layout.tsx` para desactivar la inyección arbitraria de estilos de Dark Reader sobre la paleta nativa de Lecturama.
2. Se añadió `suppressHydrationWarning` en el contenedor principal de `src/app/page.tsx`.

## Componentes y Cambios
1. **`src/app/layout.tsx`**
2. **`src/app/page.tsx`**

## Rama
- `dev`
