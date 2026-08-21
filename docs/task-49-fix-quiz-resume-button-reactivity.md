# Tarea 49: Reactividad Inmediata en el Botón de Comenzar/Continuar Quiz

## Descripción
Corrección de la sincronización reactiva de `activeQuizSession` en `PdfReader.tsx` para asegurar que el botón de acción al final de cada capítulo refleje inmediatamente el estado de `localStorage` al cambiar de dificultad o al abandonar un desafío:
1. **Disparador de Sincronización (`quizSessionVersion`)**:
   - Se incorpora un contador de versión y función `refreshQuizSession()` que invalida la caché de `useMemo` al cambiar de dificultad o resetear.
2. **Prop `onAbandon` en `QuizModal.tsx`**:
   - Al pulsar *"🏳️ Abandonar quiz"*, `QuizModal` notifica a `PdfReader` para vaciar el estado de preguntas y actualizar el botón a **"🎯 Comenzar Quiz del Nivel"** en 0ms sin recargar la página.

## Propósito
- Eliminar la desincronización visual del botón tras cambiar de nivel de dificultad o cancelar un quiz.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**: Soporte de prop `onAbandon`.
2. **`src/components/PdfReader.tsx`**: Integración de `quizSessionVersion` y refresco reactivo.

## Rama
- `dev`
