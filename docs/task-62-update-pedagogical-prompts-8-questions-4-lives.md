# Tarea 62: Actualización de Prompts Pedagógicos (8 Preguntas) y Aumento a 4 Vidas

## Descripción
Actualización integral del motor de generación de preguntas y del sistema de vidas:
1. **8 Preguntas Pedagógicas por Capítulo**:
   - Se actualizan las plantillas de prompts para los 3 niveles de dificultad (`basic`, `medium`, `advanced`) aumentando de 5 a 8 preguntas con enfoques especializados:
     - Vocabulario en contexto.
     - Relación entre partes del texto / ir y volver en la historia.
     - Evaluación crítica / verosimilitud / solidez de argumentos.
     - Construcción y caracterización de personajes y mundo narrativo.
2. **Detección Textual (Narrativo vs Expositivo/Argumentativo)**:
   - Se instruye al modelo a adaptar dinámicamente las referencias a personajes/trama hacia ideas, argumentos y postura del autor cuando el texto sea de no-ficción o ensayístico.
3. **Calidad de Distractores**:
   - Reglas estrictas de longitud homogénea en las 4 opciones y alternativas incorrectas plausibles.
4. **Sistema de 4 Vidas**:
   - Se amplía el límite de vidas de 3 a 4 por capítulo en `QuizModal.tsx`, `quizStore.ts` y `quiz.ts`.

## Propósito
- Enriquecer la profundidad pedagógica de la plataforma, evaluar habilidades avanzadas de comprensión lectora y calibrar la tolerancia a fallos con 4 vidas.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**
2. **`src/components/QuizModal.tsx`**
3. **`src/lib/quizStore.ts`**
4. **`src/types/quiz.ts`**

## Rama
- `dev` (en pruebas locales)
