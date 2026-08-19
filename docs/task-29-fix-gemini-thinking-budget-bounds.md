# Tarea 29: Corrección de Límites de Thinking Budget en Gemini (512 tokens)

## Descripción
Corrección del error `400 INVALID_ARGUMENT` ajustando el presupuesto de razonamiento interno de Gemini al mínimo absoluto permitido por la API (`thinkingBudget: 512`), ya que el valor `0` no es admitido por el esquema de la API.

## Propósito
- Eliminar el error 400 en las solicitudes de generación de preguntas.
- Mantener la latencia de respuesta en el tiempo más bajo posible permitido por el proveedor.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Actualización de `thinkingConfig: { thinkingBudget: 512 }`.

## Rama
- `dev`
