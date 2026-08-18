# Tarea 4: Scroll Continuo Acotado por Capítulo

## Descripción
Modificación del visor de PDF para implementar scroll vertical continuo acotado al capítulo activo, con detención natural al finalizar el capítulo y botones de transición entre capítulos.

## Propósito
- Mejorar la experiencia de lectura evitando tener que cambiar manualmente de página en página dentro del mismo capítulo.
- Establecer la delimitación de capítulos como niveles independientes, preparando la arquitectura para la futura integración de preguntas/quizzes de gamificación al final de cada capítulo.

## Componentes y Cambios
1. **`src/types/pdf.ts`**:
   - Ampliación de la interfaz `Chapter` para incluir `startPage` y `endPage`.
2. **`src/hooks/useChapters.ts`**:
   - Cálculo automático del rango de páginas (`startPage` a `endPage`) para cada capítulo basado en los inicios del siguiente capítulo o el total de páginas (`numPages`).
3. **`src/components/PdfViewer.tsx`**:
   - Renderizado en columna continua de todas las páginas correspondientes al rango del capítulo activo.
   - Detección de la página visible en pantalla mediante `IntersectionObserver` para mantener sincronizado el número de página actual.
   - Tarjeta interactiva de "Fin del Capítulo" al fondo con opciones para avanzar al siguiente capítulo o volver al anterior.
4. **`src/components/ChapterSidebar.tsx`**:
   - Selección directa de capítulo activando su rango correspondiente y scroll al inicio.
5. **`src/components/PdfReader.tsx` y `src/components/PdfNavigation.tsx`**:
   - Coordinación del capítulo actual (`activeChapter`), avance entre capítulos y navegación dentro del rango.

## Rama
- `dev`
