# Tarea 40: Calibración de Timeouts para Modelos de Quiz y Clasificación

## Descripción
Calibración diferenciada de timeouts en `src/lib/gemini.ts` para permitir que el modelo principal `gemini-3.5-flash` aproveche al máximo su Thinking Mode (512 tokens) y genere preguntas de alta calidad pedagógica sin ser abortado prematuramente:
- **Generación de Quiz - Modelo Principal (`gemini-3.5-flash`)**: 22 segundos (`22000` ms).
- **Generación de Quiz - Fallback (`gemini-3.5-flash-lite`)**: 10 segundos (`10000` ms).
- **Clasificación de Relleno (`gemma-4-31b-it`)**: 6 segundos (`6000` ms).

## Propósito
- Dar tiempo suficiente al modelo principal para formular preguntas pedagógicas profundas mientras se mantiene el tiempo total dentro de la ventana de ejecución de 60s de Vercel.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Ajuste de constantes de timeout diferenciadas por modelo y tarea.

## Rama
- `dev`
