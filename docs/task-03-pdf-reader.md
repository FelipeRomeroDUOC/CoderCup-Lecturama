# Tarea 3: Visor de PDF Completo con Navegación y Capítulos

## Descripción
Implementación completa de la interfaz del lector de PDFs, incluyendo visor de páginas, navegación entre páginas y menú lateral de capítulos basado en el outline embebido del PDF.

## Propósito
- Cumplir con los Puntos 2, 3, 4 y 5 del alcance de la interfaz del lector definidos en `AGENTS.md`.
- Permitir la visualización fluida de libros PDF, pasar de página (o saltar directamente a una página específica) y navegar entre capítulos de forma libre sin bloqueos.

## Componentes y Cambios
1. **Dependencias**:
   - `react-pdf`: Componentes `<Document />` y `<Page />` junto con la configuración del worker de `pdfjs-dist`.
2. **Tipos (`src/types/pdf.ts`)**:
   - Estructuras para `Chapter`, `PdfDocumentProxy`, `OutlineItem` y estados de navegación.
3. **Hook (`src/hooks/useChapters.ts`)**:
   - Extracción recursiva del outline/TOC embebido del PDF resolviendo referencias a números de página.
   - `TODO` explícito para casos donde el PDF no disponga de outline embebido.
4. **Componentes (`src/components/`)**:
   - `PdfNavigation.tsx`: Controles de página (anterior, siguiente, input de salto directo, atajos de teclado).
   - `ChapterSidebar.tsx`: Barra lateral con la lista de capítulos para salto directo a cada sección.
   - `PdfViewer.tsx`: Renderizador de páginas de `react-pdf` con manejo de escala y estados de carga.
   - `PdfReader.tsx`: Vista principal del lector que integra visor, controles de navegación y menú de capítulos.
5. **Página (`src/app/page.tsx`)**:
   - Transición fluida entre la pantalla de carga (`PdfUploader`) y el lector (`PdfReader`).

## Rama
- `dev`
