# Tarea 65: Actualización del Motor de IA a Gemini 3.6 Flash

## Descripción
Actualización del pipeline de modelos en `src/lib/gemini.ts` para resolver las 8 preguntas con distractores en alta velocidad:
1. **Modelo Principal**: `gemini-3.6-flash` (tiempo medido en benchmark: ~7.1s para 8 preguntas estructuradas).
2. **Modelo de Respaldo (Fallback)**: `gemini-3.5-flash-lite` (tiempo medido: ~2.8s).
3. **Calibración de Timeouts**:
   - Primario: 25 segundos.
   - Respaldo: 15 segundos.

## Propósito
- Evitar demoras y timeouts en la generación de 8 preguntas detalladas con distractores de alta verosimilitud.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
