# Tarea 28: Desactivación Completa del Thinking Budget en Gemini

## Descripción
Configuración de `thinkingConfig: { thinkingBudget: 0 }` en el cliente de Google AI Studio para desactivar totalmente la fase de razonamiento interno previo y obtener respuestas casi instantáneas (2-5 segundos).

## Propósito
- Evaluar comparativamente el tiempo de respuesta frente a la calidad y pertinencia pedagógica de las preguntas generadas.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Ajuste de `thinkingConfig: { thinkingBudget: 0 }` en la llamada a `ai.models.generateContent`.

## Rama
- `dev`
