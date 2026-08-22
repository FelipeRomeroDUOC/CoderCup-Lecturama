# Tarea 92: Diseño Limpio de Estantería y Detección Automática de Autor

## Descripción
1. **Eliminación de Subtítulos Redundantes**:
   - Se removió el bloque de texto exterior debajo de las tarjetas en `src/components/BookLibraryShelf.tsx`.
   - La estantería ahora presenta tomos de libros limpios con toda la información integrada directamente en el diseño del tomo.

2. **Detección y Visualización del Autor (`author`)**:
   - `StoredBook` ahora incluye `author?: string`.
   - Extracción mediante:
     1. Metadatos de PDF `pdf.getMetadata().info.Author`.
     2. Detección de patrones en nombre de archivo (ej: `Titulo-Autor.pdf`).
     3. Scraping de líneas de texto de autoría en la primera página (portada).
   - Visualización dentro del overlay de la tarjeta: `✍️ [Nombre del Autor]`.

## Componentes y Cambios
1. **`src/lib/bookStorage.ts`**
2. **`src/components/PdfReader.tsx`**
3. **`src/components/BookLibraryShelf.tsx`**
4. **`src/app/page.tsx`**

## Rama
- `dev` (en pruebas locales)
