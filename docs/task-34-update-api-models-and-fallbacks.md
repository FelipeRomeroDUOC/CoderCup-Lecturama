# Tarea 34: Actualización de Modelos y Cuotas en Google AI Studio

## Descripción
Actualización de los modelos utilizados en los endpoints del servidor tras verificar la disponibilidad y cuota activa en la API:
1. **Endpoint `questions` (Generación de Quizzes)**:
   - **Modelo Principal**: `gemini-3.5-flash`
   - **Modelo de Respaldo (Fallback)**: `gemini-3.5-flash-lite`
2. **Endpoint `classify` (Clasificación de Capítulos/Relleno)**:
   - **Modelo Principal**: `gemma-4-31b-it`
   - **Modelo de Respaldo**: `gemini-3.5-flash-lite`

## Pruebas de Conectividad Realizadas
- `gemini-3.5-flash-lite`: ✅ Operativo
- `gemma-4-31b-it`: ✅ Operativo
- `gemini-3.5-flash`: ✅ Operativo

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Asignación de modelos dedicados para preguntas y para clasificación de relleno.

## Rama
- `dev`
