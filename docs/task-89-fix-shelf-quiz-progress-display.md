# Tarea 89: Visualización Precisa del Progreso de Quizes en la Estantería de Libros

## Descripción
Corrección y enriquecimiento de la visualización del progreso de quizes en `src/components/BookLibraryShelf.tsx`:

1. **Unificación de Clave de Persistencia**:
   - Lectura de `codercup_${userId}_${cleanTitle}_progress` en `localStorage` (matching con `useGamification.ts`).
2. **Persistencia de Total de Capítulos en IndexedDB**:
   - `StoredBook` ahora almacena `totalChapters?: number`.
   - `src/components/PdfReader.tsx` actualiza este campo al detectar los capítulos jugables.
3. **Indicadores Visuales en Cada Libro**:
   - **Insignia superior**: `⚔️ X/Y Niveles` o `🏆 Conquistado`.
   - **Barra de Progreso Dorada**: Barra integrada en la base de la miniatura que avanza con cada nivel superado.
   - **Subtítulo**: `X de Y niveles superados (Z%)` o `Página P • Sin quizes aún`.

## Componentes y Cambios
1. **`src/lib/bookStorage.ts`**
2. **`src/components/PdfReader.tsx`**
3. **`src/components/BookLibraryShelf.tsx`**

## Rama
- `dev` (en pruebas locales)
