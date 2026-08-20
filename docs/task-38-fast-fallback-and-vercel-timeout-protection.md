# Tarea 38: Conmutación Inmediata de Modelos y Protección contra Timeouts en Vercel

## Descripción
Optimización de la latencia y resiliencia ante errores `503 UNAVAILABLE` y picos de demanda en Google AI Studio mediante:
1. **Conmutación Inmediata (Zero-Wait Fallback)**: Al recibir `503` o `429`, el sistema conmuta inmediatamente en milisegundos al modelo `gemini-3.5-flash-lite` sin perder tiempo reintentando en el modelo saturado.
2. **Timeout por Modelo (8s Max)**: Si un modelo tarda más de 8 segundos en responder, se cancela y se pasa inmediatamente al modelo de respaldo.
3. **Configuración de Vercel (`maxDuration = 60`)**: Configuración explícita del límite máximo de ejecución de serverless functions en Next.js App Router para Vercel.

## Propósito
- Evitar demoras de más de 100 segundos y proteger contra errores `504 Gateway Timeout` en Vercel.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - `withTimeout` de 8 segundos por llamada.
   - Conmutación directa al siguiente modelo en `CANDIDATE_MODELS`.
2. **`src/app/api/chapters/[id]/questions/route.ts`**:
   - `export const maxDuration = 60;`
3. **`src/app/api/chapters/[id]/classify/route.ts`**:
   - `export const maxDuration = 60;`

## Rama
- `dev`
