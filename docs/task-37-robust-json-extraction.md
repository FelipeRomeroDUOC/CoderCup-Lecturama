# Tarea 37: Extracción Robusta de JSON en Respuestas de IA

## Descripción
Implementación de un parser resiliente de JSON (`extractJsonFromText`) para extraer datos de modelos de lenguaje (especialmente Gemma 4) que puedan incluir etiquetas markdown (````json ... ````) o frases conversacionales adyacentes a la salida estructurada.

## Propósito
- Eliminar los errores `SyntaxError: Unexpected non-whitespace character after JSON` al procesar respuestas de modelos que no tienen soporte estricto de JSON nativo.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Función `extractJsonFromText<T>` con limpieza de bloques markdown y coincidencia de objetos/arreglos por regex.
   - Extracción directa por regex para `isPlayable` como respaldo infalible.

## Rama
- `dev`
