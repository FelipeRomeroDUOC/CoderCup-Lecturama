# Tarea 43: Corrección de Reinicio de Estado en Quiz tras Reset

## Descripción
Corrección en el ciclo de vida de `QuizModal.tsx` para garantizar que cuando no exista una sesión activa en `localStorage` (como ocurre inmediatamente después de presionar el botón `[DEV] Reset` o cuando se genera un nuevo set de preguntas), el estado local de React se restablezca limpiamente a la Pregunta 1 con 3 vidas.

## Propósito
- Evitar que una nueva sesión de quiz comience en una pregunta intermedia residual tras un reinicio de desarrollo.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**:
   - Evaluación estricta de `savedSession` al abrir el modal; si es `null` o el set de preguntas cambió, se invoca `resetQuiz()`.

## Rama
- `dev`
