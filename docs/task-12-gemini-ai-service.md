# Tarea 12: Servicio de IA con Gemini API y Tipos de Quiz

## Descripción
Implementación del servicio de servidor para la generación de 5 preguntas estructuradas en JSON utilizando la API de Gemini (Google AI Studio), optimizado para ejecutarse dentro de los límites de tiempo de las funciones Serverless de Vercel.

## Propósito
- Cumplir con la sección "Backend: generación de preguntas con IA" de `AGENTS.md`.
- Generar preguntas de comprensión bajo demanda a partir del texto del capítulo, con formato estructurado estricto y manejo de errores 429 mediante reintentos con backoff acotado.

## Componentes y Cambios
1. **Dependencia**:
   - `@google/genai`: SDK oficial de Google AI Studio.
2. **Tipos (`src/types/quiz.ts`)**:
   - Interfaces explícitas para `QuizQuestion` y `ChapterQuiz`.
3. **Servicio (`src/lib/gemini.ts`)**:
   - Función `generateChapterQuiz(chapterText, chapterTitle)`:
     - Uso del modelo `gemini-2.5-flash` con *Structured Outputs* (esquema JSON estricto).
     - Validación de `process.env.GEMINI_API_KEY`.
     - Reintentos con backoff exponencial acotado (máximo 2 reintentos con esperas de 1s y 2s) y timeout interno de 15s por petición para garantizar compatibilidad con Vercel Serverless.
4. **Plantilla de Entorno (`.env.example`)**:
   - Documentación de la variable `GEMINI_API_KEY`.

## Rama
- `dev`
