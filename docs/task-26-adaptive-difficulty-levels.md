# Tarea 26: Selector y Adaptación de Niveles de Dificultad

## Descripción
Implementación del selector de dificultad adaptable (🧒 Básica para 8-12 años, 🧑‍🎓 Media para 13-17 años, 🎓 Avanzada para adultos) en el cliente y calibración del prompt en el servidor para ajustar el vocabulario, longitud de opciones y complejidad pedagógica de las 5 preguntas generadas.

## Propósito
- Adaptar la comprensión lectora al rango etario del usuario (escolares de básica o media), evitando frustraciones por lenguaje excesivamente denso o abstracto.
- Reducir los tokens de salida en niveles escolares para acelerar aún más los tiempos de respuesta de la IA.

## Componentes y Cambios
1. **`src/types/quiz.ts`**:
   - Tipo `QuizDifficulty = 'basic' | 'medium' | 'advanced'`.
2. **`src/lib/gemini.ts`**:
   - Calibración de directrices pedagógicas según `difficulty`.
3. **`src/app/api/chapters/[id]/questions/route.ts`**:
   - Almacenamiento y consulta en caché por `chapterId + '_' + difficulty`.
4. **`src/components/PdfReader.tsx`**:
   - Selector visual de dificultad en la barra superior con persistencia local.

## Rama
- `dev`
