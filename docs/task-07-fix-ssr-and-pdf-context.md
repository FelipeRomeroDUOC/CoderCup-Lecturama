# Tarea 7: Corrección Definitiva de SSR y Contexto en react-pdf

## Descripción
Corrección integral de los errores de renderizado en servidor (`DOMMatrix is not defined`) y pérdida de contexto de documento en cliente (`Invariant failed: Attempted to load a page, but no document was specified`).

## Propósito
- Garantizar que `react-pdf` y `pdfjs-dist` se ejecuten exclusivamente en el navegador evitando intentos de pre-renderizado en Node.js.
- Garantizar el renderizado robusto e instantáneo de las páginas del PDF mediante el paso directo de la propiedad `pdf={pdfDocument}` a cada componente `<Page>`.

## Componentes y Cambios
1. **`src/components/PdfViewer.tsx`**:
   - Recepción explícita del objeto `pdf: PDFDocumentProxy`.
   - Paso directo `<Page pdf={pdf} pageNumber={pageNum} />` eliminando la dependencia en el contexto de `<Document>`.
2. **`src/components/PdfReader.tsx`**:
   - Componente `<Document>` encargado de cargar el archivo y almacenar el objeto `pdfDocument` (`PDFDocumentProxy`).
   - Renderizado condicional de `PdfViewer` pasando la referencia explícita del documento una vez cargado.
3. **`src/app/page.tsx`**:
   - Carga dinámica del lector mediante `next/dynamic` con `{ ssr: false }` para asegurar el aislamiento total de SSR.

## Rama
- `dev`
