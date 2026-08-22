# Tarea 99: Corrección de Desbordamiento en Conteo de Quizes Completados (9/8 Fix)

## Descripción
Corrección del conteo `9/8` en la estantería:
- Se acotó el cálculo `completedCount = Math.min(rawCompleted, totalChapters)` en `src/components/BookLibraryShelf.tsx` para evitar que IDs de secciones no jugables o datos antiguos en localStorage superen el total de niveles jugables.
- En `src/hooks/useGamification.ts`, se aseguró que el cálculo de completitud filtre estrictamente secciones no jugables.

## Componentes y Cambios
1. **`src/components/BookLibraryShelf.tsx`**
2. **`src/hooks/useGamification.ts`**

## Rama
- `dev` (en pruebas locales)
