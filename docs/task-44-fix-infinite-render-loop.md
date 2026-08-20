# Tarea 44: Corrección de Bucle Infinito de Renderizado (Maximum Update Depth Exceeded)

## Descripción
Corrección del error `Maximum update depth exceeded` provocado por un ciclo reactivo entre el auto-desbloqueo de secciones no jugables y `markChapterCompleted`:
1. **Guarda en `markChapterCompleted` (`useGamification.ts`)**: Si el capítulo ya se encuentra en `completedChapterIds`, la función retorna inmediatamente sin ejecutar `setState`.
2. **Guarda en `PdfReader.tsx`**: El efecto de auto-desbloqueo verifica `!isChapterCompleted(activeChapter.id)` antes de invocar la acción de marcado.

## Propósito
- Eliminar el ciclo infinito de actualización de estado y garantizar un renderizado fluido y estable de las páginas en `PdfViewer`.

## Componentes y Cambios
1. **`src/hooks/useGamification.ts`**:
   - Guarda de idempotencia en `markChapterCompleted`.
2. **`src/components/PdfReader.tsx`**:
   - Condición estricta en el efecto de secciones de relleno.

## Rama
- `dev`
