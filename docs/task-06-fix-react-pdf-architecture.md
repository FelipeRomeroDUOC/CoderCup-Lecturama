# Tarea 6: Refactorización de Arquitectura Estable para react-pdf

## Descripción
Refactorización de la estructura de renderizado de `react-pdf` para desacoplar el proveedor de contexto `<Document>` de los componentes de interfaz que sufren actualizaciones frecuentes de estado (scroll, navegación, zoom y barra lateral).

## Propósito
- Eliminar de raíz el problema de `Maximum update depth exceeded` en React 19 causado por la recarga del documento PDF durante las actualizaciones de interfaz.
- Optimizar el rendimiento garantizando que el documento se cargue una sola vez en memoria por archivo.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**:
   - Montaje del componente `<Document>` a nivel de contenedor principal con referencia de archivo estable.
   - Manejo de ciclo de carga inicial (`onDocumentLoadSuccess`) y extracción de capítulos una única vez por archivo.
2. **`src/components/PdfViewer.tsx`**:
   - Conversión a renderizador puro de la lista de páginas `<Page>` correspondientes al capítulo activo.
   - Monitoreo del scroll con `IntersectionObserver` sin afectar el ciclo de vida del documento.

## Rama
- `dev`
