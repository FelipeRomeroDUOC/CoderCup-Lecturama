# Tarea 54: Corrección de Bucle en Carga de Páginas de React-PDF

## Descripción
Corrección del error `Maximum update depth exceeded` en `Page.useEffect.loadPage` (`react-pdf/dist/Page.js`) provocado por referencias inestables en props de `<Page />` y disparos concurrentes del `IntersectionObserver`:
1. **Memorización de Componente (`React.memo`) en `PdfViewer.tsx`**:
   - Evita re-renders de todo el visor de páginas durante cambios de estado auxiliares en el contenedor padre.
2. **Guarda de Notificación en `IntersectionObserver` (`lastReportedPageRef`)**:
   - Solo emite `onVisiblePageChange` si el número de página detectado difiere del último reportado.
3. **Estabilización de Props de `<Page />`**:
   - Se extrae el indicador de carga a un componente/elemento estático para evitar la recreación de objetos JSX inline en cada pase de renderizado.

## Propósito
- Garantizar renderizado estable de las páginas del PDF sin ciclos infinitos en el reducer interno de `react-pdf`.

## Componentes y Cambios
1. **`src/components/PdfViewer.tsx`**: Memorización y optimización de observer y props de `Page`.

## Rama
- `dev` (en pruebas locales)
