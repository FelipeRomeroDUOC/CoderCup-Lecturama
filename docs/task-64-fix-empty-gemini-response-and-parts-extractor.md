# Tarea 64: Extractor de Partes de Respuesta y Ampliación de Tokens en Gemini

## Descripción
Corrección del problema de respuesta vacía (`response.text === ""`) en el SDK de Gemini (@google/genai):
1. **Extractor de Texto No-Pensado (`extractResponseText`)**:
   - En lugar de confiar ciegamente en `response.text`, se inspecciona `response.candidates[0].content.parts` y se filtran las partes donde `!part.thought`, uniendo el contenido real del JSON estructurado.
2. **Capacidad de Salida (`maxOutputTokens: 4096`)**:
   - Se fija un límite de 4096 tokens de salida para asegurar que los pensamientos y las 8 preguntas detalladas no se trunquen.
3. **Eliminación de Restricciones Artificiales de Thinking**:
   - Se elimina la inyección de `thinkingBudget: 512` que limitaba el proceso de razonamiento.

## Propósito
- Garantizar que las 8 preguntas estructuradas se recuperen de manera consistente sin errores de respuesta vacía.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
