# Tarea 87: Estantería de Libros ("Mi Biblioteca Personal") con IndexedDB y Portadas 3D

## Descripción
Implementación del sistema integral de biblioteca local persistente para Lecturama:

1. **Almacenamiento Local Robusto con `IndexedDB` (`src/lib/bookStorage.ts`)**:
   - Base de datos local `lecturama_library_db` (almacén de objetos `books`).
   - Guarda el binario (`Blob`), título del libro, portada en miniatura (Data URL renderizada en Canvas), tamaño del archivo, total de páginas, última página leída, progreso de capítulos y fecha de última lectura.
   - Permite almacenar libros grandes sin límites de cuota de `localStorage`.

2. **Extracción Rápida del Título del Libro**:
   - Lectura de metadatos `info.Title` de `pdfjs-dist`.
   - Si no está presente, análisis de texto destacado de la página 1 (portada).
   - Fallback limpio con normalización de caracteres del nombre de archivo.

3. **Renderizado Instantáneo de Portadas**:
   - Al cargar el PDF, se renderiza la primera página en un `HTMLCanvasElement` ligero y se guarda comprimida en IndexedDB.
   - La estantería carga las portadas al instante sin volver a instanciar el motor PDF.

4. **Componente de Estantería Virtual (`src/components/BookLibraryShelf.tsx`)**:
   - Rejilla de tomos estilo libro 3D con lomo, sombras y textura encuadernada.
   - Animación dinámica en hover: elevación física del libro (`-translate-y-2.5`), rotación sutil (`rotate-[-1.5deg]`) y halo dorado.
   - Toda la miniatura funciona como botón de acceso rápido para reanudar la lectura en 1 clic.
   - Medalla de progreso (`x/y niveles superados • %`) e insignia de estado (`📖 En lectura` / `🏆 Conquistado`).
   - Botón discreto de eliminación con confirmación.

5. **Integración en `src/app/page.tsx`**:
   - Al arrastrar o subir un libro en `PdfUploader`, se registra automáticamente en la biblioteca.
   - Si hay libros guardados, la estantería se presenta en la landing page para reanudar cualquier lectura al instante.

## Rama
- `dev` (en pruebas locales)
