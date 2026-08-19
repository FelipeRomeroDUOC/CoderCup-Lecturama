# Tarea 21: Mejora Pedagógica del Prompt de Comprensión Lectora

## Descripción
Actualización del prompt de Gemini en `src/lib/gemini.ts` para enfocar las 5 preguntas en comprensión lectora profunda (inferencia, causa-efecto, motivación de personajes e idea principal) en lugar de memoria de datos puntuales o fechas aisladas.

## Propósito
- Elevar la calidad pedagógica y el valor lúdico de las preguntas formuladas por la IA.
- Exigir comprensión real del capítulo y presentar distractores plausibles.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Sustitución del template string del prompt por las directrices pedagógicas definidas:
     - Mínimo 1 pregunta de inferencia.
     - Mínimo 1 pregunta de causa-efecto / motivación de personajes.
     - Mínimo 1 pregunta sobre tema o propósito principal.
     - Máximo 1 pregunta literal directa (solo si es clave).
     - Prohibición de preguntas sobre fechas, cifras secundarias o detalles triviales.

## Rama
- `dev`
