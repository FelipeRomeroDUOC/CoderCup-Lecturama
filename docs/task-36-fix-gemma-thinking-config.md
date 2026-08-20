# Tarea 36: Configuración Condicional de Thinking Budget para Modelos Gemma y Gemini

## Descripción
Corrección del error `400 INVALID_ARGUMENT` en `classifyChapterPlayability` mediante la aplicación condicional de `thinkingConfig`:
- Para modelos **Gemma** (`gemma-4-31b-it`): no se envía `thinkingConfig` (ya que estos modelos no soportan thinking mode).
- Para modelos **Gemini** (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, etc.): se envía `thinkingConfig: { thinkingBudget: 512 }`.

## Propósito
- Garantizar que las llamadas al clasificador con Gemma 4 funcionen sin errores y que las llamadas a Gemini utilicen el presupuesto de pensamiento acotado.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Inyección condicional de `thinkingConfig` según el tipo de modelo (`modelName.startsWith("gemini")`).
2. **`.env.example`**:
   - Actualización de variables de ejemplo a `gemini-3.5-flash`.

## Rama
- `dev`
