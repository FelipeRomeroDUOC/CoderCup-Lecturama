# Tarea 58: Instrumentación de Tracing Diagnóstico en Consola

## Descripción
Inyección de registros de telemetría y tracing en la consola del navegador para inspeccionar en tiempo real el ciclo de renderizado y flujo de estados en la rama `dev`:
1. **`[PDF-DOCUMENT]`**: Monitoreo de creación de Blob URLs y eventos `onLoadSuccess`.
2. **`[CHAPTER-EXTRACTION]`**: Registro de llamadas a `extractChapters` y resolución de esquemas de capítulos.
3. **`[GAMIFICATION]`**: Rastreo de cálculo de `firstPlayableIndex`, lectura de `localStorage` y actualizaciones de `maxUnlockedIndex`.
4. **`[VIEWER-RENDER]`**: Registro de cada ciclo de renderizado de `PdfViewer` con `startPage`, `endPage`, `scale` y dimensiones calculadas.
5. **`[OBSERVER]`**: Reporte de cada evento de `IntersectionObserver` y llamadas a `onVisiblePageChange`.
6. **`[AUTO-UNLOCK]`**: Registro de evaluaciones de sección preliminar y auto-desbloqueo.

## Propósito
- Identificar de manera concluyente qué componente o hook genera despachos repetidos hacia React.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**
2. **`src/components/PdfViewer.tsx`**
3. **`src/hooks/useChapters.ts`**
4. **`src/hooks/useGamification.ts`**

## Rama
- `dev` (en pruebas locales)
