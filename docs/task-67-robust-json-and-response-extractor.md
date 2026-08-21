# Tarea 67: Extractor Universal de Respuesta de Gemini y Parser de Arrays JSON

## Descripción
Blindaje del mecanismo de extracción de texto y parseo de respuestas en `src/lib/gemini.ts`:
1. **Extractor Universal (`extractResponseText`)**:
   - Acceso seguro al getter `response.text` con protección de excepciones.
   - Recorrido exhaustivo de candidatos (`response.candidates[0].content.parts`).
   - Detección de motivos de bloqueo de seguridad (`promptFeedback.blockReason`, `finishReason`).
2. **Parser JSON Resiliente con Prioridad de Arrays**:
   - Limpieza de bloques markdown.
   - Extracción directa de arrays `[ ... ]` para garantizar la recuperación íntegra de las 8 preguntas.

## Propósito
- Garantizar la materialización instantánea y fiable del JSON de preguntas en entornos de ejecución Next.js App Router.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
