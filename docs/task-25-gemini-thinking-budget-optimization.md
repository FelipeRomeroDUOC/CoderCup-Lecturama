# Tarea 25: Optimización de Latencia con Thinking Budget en Gemini

## Descripción
Configuración del presupuesto de razonamiento interno (`thinkingBudget: 1024`) en el cliente de Google AI Studio para reducir drásticamente los tiempos de generación de 35 segundos a un rango ágil de 4-7 segundos sin comprometer la profundidad analítica de las preguntas.

## Propósito
- Prevenir caídas por timeout de 60s en funciones Serverless de Vercel en capítulos extensos.
- Ofrecer una experiencia fluida al usuario final al terminar de leer un capítulo.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Inclusión de `thinkingConfig: { thinkingBudget: 1024 }` en el objeto de configuración de la petición a Gemini.

## Rama
- `dev`
