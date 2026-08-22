# Tarea 93: Barra de Progreso con Relleno Parcial de Semáforo y Formato X/Y Uniforme

## Descripción
1. **Eliminación del Ícono de Lápiz**:
   - Visualización de autor en texto plano y estilizado `text-zinc-300` sin emojis.
2. **Barra de Progreso Parcial con Colores de Semáforo y Fondo Negro**:
   - Base de la barra negra en todos los libros (`bg-black/75`, `border border-white/20`).
   - Relleno proporcional (`width: ${percent}%`):
     - **100% (Completado):** Dorado resplandeciente (`bg-amber-400`).
     - **60% - 99%:** Verde semáforo (`bg-emerald-500`).
     - **25% - 59%:** Amarillo semáforo (`bg-yellow-400`).
     - **1% - 24%:** Rojo semáforo (`bg-rose-500`).
     - **0%:** 0% relleno (barra negra completa).
3. **Conteo Uniforme X/Y**:
   - Insignia superior y pie de tarjeta reflejan `X/Y` quizes resueltos en todos los estados.

## Componentes y Cambios
1. **`src/components/BookLibraryShelf.tsx`**

## Rama
- `dev` (en pruebas locales)
