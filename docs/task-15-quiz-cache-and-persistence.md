# Tarea 15: Caché y Persistencia de Preguntas de Capítulos

## Descripción
Implementación del módulo de almacenamiento `quizStore` para persistir los sets de 5 preguntas generados por capítulo y gestionar las 3 vidas del progreso del usuario, evitando realizar llamadas duplicadas a la API de Gemini.

## Propósito
- Cumplir con la regla de negocio de `AGENTS.md`: generar las preguntas de un capítulo una sola vez y reutilizarlas en reintentos.
- Proteger la cuota gratuita de la API de IA y reducir los tiempos de respuesta a menos de 5ms en solicitudes posteriores.

## Componentes y Cambios
1. **`src/lib/quizStore.ts`**:
   - Métodos para guardar y recuperar preguntas (`getChapterQuiz`, `saveChapterQuiz`).
   - Métodos para gestionar el progreso y vidas del usuario por sesión (`getUserChapterProgress`, `updateUserLives`, `completeChapter`).
2. **`src/app/api/chapters/[id]/questions/route.ts`**:
   - Verificación previa del caché antes de invocar a Gemini.
   - Retorno inmediato de preguntas guardadas si ya existen, o generación, almacenamiento y retorno si es la primera vez.

## Rama
- `dev`
