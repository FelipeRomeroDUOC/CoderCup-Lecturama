# Tarea 76: Identidad Visual (Paso 2: Visor de PDF, Sidebar de Capítulos y Navegación "Biblioteca Interactiva")

## Descripción
Implementación de la segunda fase de la identidad visual de Lecturama bajo el estilo **"Biblioteca Interactiva"** en el entorno de lectura:
1. **Lector de PDF y Encabezado Editorial (`src/components/PdfReader.tsx`)**:
   - Encabezado con el Isotipo oficial `LecturamaLogo`, título del libro formateado, selector de dificultad estilo píldora con acentos ámbar y controles de zoom ergonómicos.
   - Actualización del overlay de generación de quiz a **8 preguntas**.
2. **Índice de Capítulos y Niveles (`src/components/ChapterSidebar.tsx`)**:
   - Estética de índice de tomo encuadernado con fondo cálido de biblioteca (`#FAF8F5`), bordes sutiles, estados visuales claros (`🔒` bloqueado, `📖` en lectura, `✅` superado con honores, `📄` preliminar) y marbetes de página numerados.
3. **Visor de Páginas y Tarjeta de Desafío (`src/components/PdfViewer.tsx`)**:
   - Marco de lectura continuo con fondo lino/pergamino suave (`#F4F0E8` en tema claro / `zinc-950` en oscuro) para eliminar la fatiga por brillo blanco.
   - Sombreado de pliego de libro (`shadow-2xl ring-1 ring-zinc-900/5`).
   - Tarjeta de fin de capítulo rediseñada como **Reto de Nivel de Biblioteca** con acento dorado cálido, insignia `✨ Desafío de Nivel` y micro-animaciones.
4. **Navegación Flotante (`src/components/PdfNavigation.tsx`)**:
   - Cápsula flotante estilizada con fondo translúcido, selector rápido de página y controles anterior/siguiente.

## Propósito
- Brindar una experiencia de lectura inmersiva, acogedora y gamificada con alta ergonomía visual.

## Componentes y Cambios
1. **`src/components/ChapterSidebar.tsx`**
2. **`src/components/PdfViewer.tsx`**
3. **`src/components/PdfNavigation.tsx`**
4. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
