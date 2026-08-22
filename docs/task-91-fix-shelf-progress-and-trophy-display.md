# Tarea 91: Corrección de Visualización de Barra de Progreso y Trofeo en la Estantería

## Descripción
Corrección del cálculo de progreso para libros existentes y renderizado garantizado de la barra de progreso dorada y el trofeo de victoria:

1. **Cálculo Resiliente de Progreso (`src/components/BookLibraryShelf.tsx`)**:
   - Infiere `totalChapters` desde `parsed.totalPlayableChapters`, `book.totalChapters`, o el conteo de niveles completados si el libro fue registrado antes de indexar capítulos.
   - Activa `isCompleted = true` si `completedCount >= totalChapters` (ej: 9 de 9).
   - Renderiza la barra dorada de progreso y el trofeo `🏆 ¡Completado!` siempre que `completedCount > 0`.

2. **Persistencia Enriquecida (`src/hooks/useGamification.ts`)**:
   - `saveProgress` ahora almacena `totalPlayableChapters` y el booleano `isAllCompleted` para sincronización instantánea con la estantería.

## Componentes y Cambios
1. **`src/components/BookLibraryShelf.tsx`**
2. **`src/hooks/useGamification.ts`**

## Rama
- `dev` (en pruebas locales)
