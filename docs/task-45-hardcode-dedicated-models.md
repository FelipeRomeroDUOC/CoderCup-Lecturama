# Tarea 45: Definición Explícita de Modelos en el Código

## Descripción
Fijación de los modelos principales y de respaldo como constantes centralizadas en el código (`src/lib/gemini.ts`), eliminando la dependencia de variables de entorno para la selección de modelos:
- **Generación de Quiz (`questions`)**:
  - Modelo Principal: `gemini-3.5-flash`
  - Modelo Fallback: `gemini-3.5-flash-lite`
- **Clasificación de Relleno (`classify`)**:
  - Modelo Principal: `gemma-4-31b-it`
  - Modelo Fallback: `gemini-3.5-flash-lite`
- **Variables de Entorno (`.env.example` y `.env.local`)**:
  - Se mantiene únicamente `GEMINI_API_KEY`.

## Propósito
- Simplificar el despliegue y la configuración evitando discrepancias de modelos por variables de entorno obsoletas.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Asignación directa de constantes fijas.
2. **`.env.example`**:
   - Simplificación a solo `GEMINI_API_KEY`.

## Rama
- `dev`
