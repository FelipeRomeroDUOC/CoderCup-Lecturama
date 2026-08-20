# Tarea 31: Sistema de Fallback y Resiliencia Multicapa en Gemini

## Descripción
Implementación de tolerancia a fallos ante errores `503 UNAVAILABLE` (alta demanda/sobrecarga temporal en Google AI Studio) y `429 RESOURCE_EXHAUSTED` mediante:
1. **Model Fallback**: Conmutación automática del modelo principal `gemini-3.6-flash` al modelo de respaldo `gemini-3.5-flash`.
2. **Reintentos con Backoff**: Manejo de reintentos con retraso progresivo (1s y 2s) ante picos de demanda transitorios.
3. **Resiliencia en Clasificación**: Retorno seguro ante caídas totales para no bloquear la experiencia de lectura.

## Propósito
- Evitar caídas y errores de servicio cuando el modelo de Google experimente picos de demanda globales.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Soporte de lista de modelos (`[process.env.GEMINI_MODEL || 'gemini-3.6-flash', 'gemini-3.5-flash']`).
   - Detección de errores 503 / 429 en `generateChapterQuiz` y `classifyChapterPlayability`.

## Rama
- `dev`
