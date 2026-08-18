# Tarea 18: Interfaz del Quiz Gamificado (Modal, 3 Vidas y Desbloqueo)

## Descripción
Implementación del componente interactivo `QuizModal` para responder las 5 preguntas generadas por capítulo con mecánica de 3 vidas, feedback pedagógico inmediato, estados de victoria/derrota y desbloqueo del siguiente capítulo.

## Propósito
- Conectar la extracción de texto del PDF y el backend de Gemini AI con la interfaz de usuario.
- Completar el bucle central de gamificación del lector de libros.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**:
   - Modal interactivo con animación de entrada.
   - Indicador visual de 3 vidas (❤️❤️❤️).
   - Barra de progreso (1 a 5 preguntas).
   - Opciones interactivas con estados de acierto/error y justificación pedagógica.
   - Pantalla de victoria con botón para desbloquear y avanzar al siguiente capítulo.
   - Pantalla de derrota con botón de reintento (sin llamadas adicionales a la IA).
2. **`src/components/PdfReader.tsx`**:
   - Disparador de extracción de texto y petición a `/api/chapters/[id]/questions`.
   - Apertura del `QuizModal` y guardado del estado de completado mediante `markChapterCompleted`.

## Rama
- `dev`
