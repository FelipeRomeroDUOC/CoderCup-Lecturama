# Tarea 9: Renderizado Perezoso (Lazy Loading) de Páginas y Ancho Estable

## Descripción
Implementación de renderizado diferido (lazy loading) para las páginas del capítulo y cálculo de ancho estable para evitar colisiones de estado en React 19 y resolver de raíz el error `Maximum update depth exceeded`.

## Propósito
- Evitar que todas las páginas de un capítulo se procesen simultáneamente en el canvas de PDF.js, cargando únicamente las páginas que entran en la ventana de visión o en su proximidad inmediata.
- Mantener un ancho estable sin provocar re-cálculos de `scale` durante la resolución de promesas de páginas en `react-pdf`.

## Componentes y Cambios
1. **`src/components/PdfViewer.tsx`**:
   - `PdfPageItem` con `isVisible` gestionado por `IntersectionObserver` local con `rootMargin: '400px'` para precargar suavemente la página antes de que entre al viewport.
   - Placeholder esqueleto con proporción estándar (A4/carta) mientras la página no está en rango de visualización.
   - Ancho estático por defecto (800px) con listener de `resize` pasivo que no muta dimensiones durante el render inicial.

## Rama
- `dev`
