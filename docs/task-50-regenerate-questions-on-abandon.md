# Tarea 50: Regeneración de Nuevas Preguntas al Abandonar el Quiz

## Descripción
Modificación del ciclo de vida y almacenamiento de preguntas para que cuando el usuario abandone explícitamente un quiz (`🏳️ Abandonar quiz`) o cambie de nivel de dificultad, el servidor invalide el set de preguntas previo y genere 5 preguntas totalmente nuevas y frescas en el próximo intento:
1. **Invalidación de Caché en Backend (`src/lib/quizStore.ts` y `route.ts`)**:
   - Se añade la función `deleteChapterQuiz(chapterIdOrPrefix)` en `quizStore.ts`.
   - Se añade soporte para el método `DELETE /api/chapters/[id]/questions` y el flag `forceFresh: true` en el `POST` para forzar la generación fresca con IA.
2. **Sincronización en Cliente (`src/components/PdfReader.tsx`)**:
   - Al abandonar un quiz o confirmar cambio de dificultad, se limpia tanto `localStorage` como la caché en el servidor para ese capítulo.
   - Al presionar **`🎯 Comenzar Quiz del Nivel`**, se envían parámetros para formular un nuevo desafío.

## Propósito
- Asegurar que al abandonar un quiz, el usuario obtenga una experiencia renovada con preguntas diferentes.

## Componentes y Cambios
1. **`src/lib/quizStore.ts`**: Métodos `deleteChapterQuiz` y `clearChapterQuizCache`.
2. **`src/app/api/chapters/[id]/questions/route.ts`**: Manejo de `DELETE` y `forceFresh`.
3. **`src/components/PdfReader.tsx`**: Invocación de limpieza de servidor en `onAbandon` y `handleDifficultyChange`.

## Rama
- `dev`
