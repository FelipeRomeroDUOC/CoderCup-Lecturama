# Tarea 66: Optimización de Presupuesto de Tokens y Prioridad de Modelo Flash-Lite

## Descripción
Calibración y resolución de corte de tokens en la generación de 8 preguntas detalladas con distractores de alta verosimilitud:
1. **Presupuesto de Salida Ampliado (`maxOutputTokens: 8192`)**:
   - Evita el error `finishReason: MAX_TOKENS` garantizando espacio total para pensamientos y 8 preguntas completas con distractores y explicaciones.
2. **Control de Razonamiento (`thinkingBudget: 512`)**:
   - Limita los pensamientos internos a 512 tokens para priorizar el JSON estructurado de salida.
3. **Prioridad de Modelos por Rendimiento**:
   - **Principal**: `gemini-3.5-flash-lite` (generación ultrarrápida en ~2.8s).
   - **Respaldo**: `gemini-3.6-flash` (modelo insignia con timeout de 30s).

## Propósito
- Eliminar de raíz los errores de respuesta vacía o timeouts durante la creación de cuestionarios.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
