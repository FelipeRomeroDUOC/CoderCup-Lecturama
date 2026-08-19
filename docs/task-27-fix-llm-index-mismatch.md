# Tarea 27: Eliminación de Desfases de Índice en Gemini con Coincidencia Textual

## Descripción
Corrección del error de desfasaje de índices en la IA (`off-by-one index mismatch`), sustituyendo la solicitud de índices numéricos abstractos por la extracción del texto literal de la respuesta correcta (`correctAnswerText`) y su posterior resolución algorítmica en el servidor.

## Propósito
- Garantizar que la opción marcada como correcta coincida de forma 100% precisa con la explicación y el significado narrativo del texto.
- Evitar que una respuesta correcta sea marcada como errónea por confusión entre índices 0 y 1 en la IA.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - `quizResponseSchema`: Gemini devuelve `correctAnswerText: string` (el texto de la opción verdadera).
   - Función `findCorrectIndexByText`: Localiza el índice exacto comparando el texto de las opciones.
   - Barajado Fisher-Yates posterior que recalcula `correctOptionIndex` garantizando sincronización total entre la opción seleccionada, la explicación y la interfaz.

## Rama
- `dev`
