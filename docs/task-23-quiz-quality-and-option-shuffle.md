# Tarea 23: Calidad de Preguntas y Barajado Aleatorio de Opciones

## Descripción
Mejora integral en la generación de preguntas con IA:
1. Implementación de barajado aleatorio (Fisher-Yates Shuffle) en el servidor para garantizar una distribución 100% equitativa e impredecible entre las opciones A, B, C y D.
2. Incremento de la temperatura del modelo de `0.3` a `0.75` para potenciar el análisis crítico y la variedad interpretativa.
3. Refuerzo del prompt con directrices de análisis literario profundo y prohibición expresa de preguntas fácticas o de memorización de sustantivos aislados.

## Propósito
- Eliminar el sesgo donde la alternativa correcta solía ser casi siempre la A.
- Elevar la calidad y profundidad del desafío pedagógico en cada capítulo.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Función `shuffleOptionsAndIndex` para reordenar aleatoriamente las alternativas.
   - Ajuste de `temperature: 0.75`.
   - Prompt con 5 tipologías de preguntas analíticas obligatorias.

## Rama
- `dev`
