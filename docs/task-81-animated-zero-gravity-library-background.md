# Tarea 81: Fondo Animado Literario en Gravedad Cero ("Zero-Gravity Library & Warm Lamp")

## Descripción
Implementación de un fondo ambiental animado y cálido con temática 100% literaria para eliminar la sensación de negro plano y vacío:
1. **Componente de Gravedad Cero `src/components/LibraryFloatingBackground.tsx`**:
   - Elementos literarios flotantes con opacidad sutil (8% a 25%) y acento dorado ámbar:
     - 📖 Libros abiertos y pliegos con páginas curvadas.
     - 📚 Tomos antiguos encuadernados con cintas de tela.
     - 📜 Pergaminos desenrollados.
     - 🪶 Plumas de caligrafía.
     - 🔖 Marcapáginas colgantes.
     - ✨ Mopas de polvo dorado ambiental.
   - Animación de flotación orgánica en bucle suave (física de gravedad cero sin saturación de GPU).
   - Fondo en gradiente de grafito cálido (`#0E0D0C` a `#171513`) con halos radiales de luz ámbar.
2. **Armonización en el Lector de PDF (`src/components/PdfViewer.tsx`, `src/components/PdfReader.tsx`)**:
   - Fondo de lectura en atmósfera de escritorio de roble oscuro (`#161412`) con halo de luz de lámpara centrado detrás del pliego del libro.
   - Eliminación del negro puro sin profundidad.

## Propósito
- Dotar a la aplicación de dinamismo visual, profundidad y calidez estética acorde a un videojuego literario.

## Componentes y Cambios
1. **`src/components/LibraryFloatingBackground.tsx`** [NUEVO]
2. **`src/app/page.tsx`**
3. **`src/components/PdfViewer.tsx`**
4. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
