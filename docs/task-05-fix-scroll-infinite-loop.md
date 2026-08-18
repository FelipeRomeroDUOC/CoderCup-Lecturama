# Tarea 5: Corrección de Bucle Infinito en Renderizado de Scroll (Maximum update depth exceeded)

## Descripción
Corrección del error de reactividad en el visor continuo donde el `IntersectionObserver` y las referencias inestables en `useEffect` provocaban un bucle infinito de actualizaciones de estado al renderizar las páginas del PDF.

## Propósito
- Eliminar el bloqueo de la aplicación garantizando que los observadores de scroll no disparen re-renders redundantes.
- Estabilizar las referencias de callbacks y arreglos de páginas con `useMemo` y `useCallback`.

## Componentes y Cambios
1. **`src/components/PdfViewer.tsx`**:
   - Memorización del arreglo `pages` con `useMemo([startPage, endPage])`.
   - Uso de `file` estable en `<Document file={file} />`.
   - Desacople y estabilización del ciclo de vida del `IntersectionObserver`.
2. **`src/components/PdfReader.tsx`**:
   - Memorización de `handleDocumentLoadSuccess` con `useCallback`.
   - Actualización condicional de `currentPage` en `handleVisiblePageChange` evitando ejecutar `setState` si la página visible no ha cambiado (`prev !== pageNum`).

## Rama
- `dev`
