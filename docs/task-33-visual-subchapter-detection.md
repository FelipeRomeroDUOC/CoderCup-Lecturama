# Tarea 33: Detección Visual de Capítulos y Subcapítulos por Layout

## Descripción
Implementación de un detector de capítulos y subcapítulos basado en el análisis de texto y diseño tipográfico de las páginas del PDF (`pdfjs-dist`). Identifica números arábigos o romanos aislados (ej. "2", "II"), prefijos de capítulos ("Capítulo 2") y títulos destacados en la parte superior de la página, incluso si el PDF carece de outline/bookmarks embebidos.

## Propósito
- Segmentar automáticamente novelas y libros literarios sin metadatos de índice en niveles y capítulos jugables.

## Componentes y Cambios
1. **`src/lib/visualChapterDetector.ts`**:
   - Extracción de cabeceras visuales y numeración de capítulos en el tercio superior de las páginas.
   - Cálculo de rangos `startPage` y `endPage` para cada capítulo/subcapítulo identificado.
2. **`src/hooks/useChapters.ts`**:
   - Integración automática cuando el PDF no tiene outline embebido o para enriquecer divisiones grandes.

## Rama
- `dev`
