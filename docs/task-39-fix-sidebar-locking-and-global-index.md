# Tarea 39: Corrección de Bloqueo Visual y Mapeo Global de Índices en Sidebar

## Descripción
Corrección del cálculo de estado desbloqueado/bloqueado en la barra lateral (`ChapterSidebar`):
1. **Índice Global**: `isChapterUnlocked` ahora evalúa la posición del capítulo en la lista global plana de progresión lineal en lugar de depender del índice local de cada sub-árbol anidado.
2. **Estilo Bloqueado Consistente**:
   - Ícono de candado `🔒`
   - Opacidad reducida (`opacity-40 text-zinc-400 dark:text-zinc-500`)
   - Cursor de prohibición al hacer hover (`cursor-not-allowed`)

## Propósito
- Evitar que capítulos de secciones posteriores aparezcan visualmente abiertos cuando todavía no han sido alcanzados en el progreso del usuario.

## Componentes y Cambios
1. **`src/hooks/useGamification.ts`**:
   - Mapeo por `chapterId` en la lista global de capítulos.
2. **`src/components/ChapterSidebar.tsx`**:
   - Llamada a `isChapterUnlocked(chapter.id)` y estilos visuales de bloqueo y cursor.

## Rama
- `dev`
