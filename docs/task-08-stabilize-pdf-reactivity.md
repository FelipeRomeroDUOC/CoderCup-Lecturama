# Tarea 8: Estabilización de Reactividad y Renderizado de Páginas

## Descripción
Implementación de subcomponente memorizado para cada página (`PdfPageItem`), silenciado de eventos de visibilidad durante desplazamientos programáticos (saltos de capítulo/página) y estabilización de las propiedades de `<Document>`.

## Propósito
- Resolver definitivamente el bucle de renderizado en cascada (`Maximum update depth exceeded`) al interactuar con el visor de PDF en React 19.
- Garantizar que las páginas renderizadas en el canvas permanezcan estables y no se reinicien cuando cambie el estado de scroll o navegación del contenedor padre.

## Componentes y Cambios
1. **`src/components/PdfViewer.tsx`**:
   - Creación del subcomponente `PdfPageItem` memorizado con `React.memo` para aislar cada `<Page />`.
   - Control de scroll programático con bandera `isProgrammaticScroll` para evitar que el observador de visibilidad notifique páginas intermedias durante animaciones de desplazamiento.
   - Umbral y debounce de detección de página visible.
2. **`src/components/PdfReader.tsx`**:
   - Extracción de elementos estáticos `loading` y `error` para `<Document>`.
   - Memorización del archivo de entrada con `useMemo`.
3. **`src/hooks/useChapters.ts`**:
   - Extracción asíncrona de capítulos sin alterar el estado síncrono inicial del montaje.

## Rama
- `dev`
