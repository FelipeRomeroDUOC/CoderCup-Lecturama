# Tarea 17: Sistema de Niveles y Bloqueo de Capítulos Posteriores

## Descripción
Implementación de la mecánica de niveles gamificados en la barra lateral de capítulos y en la navegación del lector, asegurando que los capítulos posteriores permanezcan bloqueados (🔒) hasta que se complete el capítulo actual, mientras que los capítulos anteriores superados (✅) permanecen accesibles para relectura libre.

## Propósito
- Cumplir con la visión del lector gamificado donde cada capítulo funciona como un nivel a superar.
- Evitar que el lector salte a capítulos avanzados sin haber respondido las preguntas de los capítulos previos.

## Componentes y Cambios
1. **`src/types/quiz.ts`**:
   - Tipos de estado de nivel (`completedChapterIds`, `unlockedChapterIndex`).
2. **`src/hooks/useGamification.ts`**:
   - Hook que gestiona los capítulos completados, el nivel actual desbloqueado y las funciones para marcar capítulos como completados.
3. **`src/components/ChapterSidebar.tsx`**:
   - Indicadores visuales por capítulo:
     - ✅ **Completado**: Accesible libremente para relectura sin quiz.
     - 📖 **Activo / En curso**: Nivel que se está leyendo.
     - 🔒 **Bloqueado**: Deshabilitado visualmente y sin acción de clic.
4. **`src/components/PdfReader.tsx` y `src/components/PdfNavigation.tsx`**:
   - Restricción de salto de página manual hacia páginas pertenecientes a capítulos aún bloqueados.

## Rama
- `dev`
