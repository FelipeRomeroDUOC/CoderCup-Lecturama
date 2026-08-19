# Tarea 20: Corrección de Reinicio de Estado en QuizModal y Avance de Nivel

## Descripción
Corrección del ciclo de vida del estado en `QuizModal` para garantizar que cada nuevo capítulo inicie con 3 vidas, preguntas limpias y sin arrastrar el estado de victoria previo, asegurando además que al superar el quiz se desbloquee y avance automáticamente al siguiente nivel.

## Propósito
- Resolver el bug donde el modal abría directamente en la pantalla de victoria al transicionar entre capítulos.
- Mejorar el flujo de navegación tras ganar el quiz.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**:
   - `useEffect` que ejecuta `resetQuiz()` al abrirse o al recibir nuevas preguntas.
   - Callback `onAdvanceToNext` al presionar "Continuar Lectura ➔".
2. **`src/components/PdfReader.tsx`**:
   - `key` dinámica por capítulo en `<QuizModal />`.
   - Lógica de desbloqueo y transición inmediata al siguiente capítulo tras la victoria.

## Rama
- `dev`
