# Tarea 57: Desacoplamiento del Scroll de Capítulos y Corrección de Props de Gamificación

## Descripción
Corrección de la causa raíz del bucle de concurrencia y de la visualización de capítulos en `PdfReader.tsx`:
1. **Desacoplamiento de `IntersectionObserver` y `activeChapterId`**:
   - El `IntersectionObserver` solo actualiza el indicador de página informativa en la barra inferior (`currentPage`).
   - Se elimina el `useEffect` que alteraba automáticamente el rango de páginas (`activeChapterId`) durante el scroll dentro de un capítulo, erradicando el ciclo infinito de montaje y desmontaje de `<Page />`.
2. **Corrección de Enlace de Props en `PdfViewer`**:
   - Corrección de las props `isCurrentChapterCompleted`, `isNextChapterUnlocked` e `isNonPlayable` para evaluar correctamente el estado de bloqueo de cada nivel.

## Propósito
- Estabilidad total en el lector, navegación fluida sin recargas de página y respeto estricto del bloqueo de capítulos.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**: Eliminación del efecto cíclico y enlace correcto de propiedades.

## Rama
- `dev` (en pruebas locales)
