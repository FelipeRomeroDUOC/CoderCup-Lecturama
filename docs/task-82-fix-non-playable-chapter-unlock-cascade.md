# Tarea 82: Corrección de Desbloqueo Cascada al Saltar a Anexos y Secciones No Jugables

## Descripción
Corrección del error por el cual, al navegar a una sección informativa/no jugable al final del libro (glosario, créditos, notas, etc.), se desbloqueaban indebidamente todos los capítulos jugables anteriores:
1. **Causa Raíz**:
   - `PdfReader.tsx` ejecutaba un efecto de auto-completado sobre las secciones clasificadas como no jugables llamando a `markChapterCompleted(chapter.id, currentChapterIndex)`.
   - Al recibir un índice alto (por ejemplo, el último capítulo del libro), `useGamification.ts` actualizaba `maxUnlockedIndex` al final del libro, haciendo que la verificación `targetIndex <= maxUnlockedIndex` devolviera verdadero para todos los capítulos.
2. **Solución Aplicada**:
   - Eliminación del efecto de auto-marcado en `PdfReader.tsx`. Las secciones preliminares/anexos son leíbles libremente en cualquier momento a través de `isFiller(chapter)` sin alterar el estado de niveles superados.
   - Blindaje de `markChapterCompleted` en `useGamification.ts` para que el desbloqueo secuencial de niveles (`maxUnlockedIndex`) ocurra de manera progresiva y únicamente cuando se apruebe el quiz de un capítulo jugable.

## Propósito
- Mantener la integridad de la gamificación y el bloqueo de niveles independientemente de si el usuario navega a anexos o preliminares.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**
2. **`src/hooks/useGamification.ts`**

## Rama
- `dev` (en pruebas locales)
