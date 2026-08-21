# Tarea 69: Migración a SystemInstruction Nativo de Gemini

## Descripción
Refactorización del paso de instrucciones pedagógicas en `src/lib/gemini.ts`:
1. **Instrucciones del Sistema Nativas (`config.systemInstruction`)**:
   - Se desacoplan las directrices pedagógicas de los contenidos del usuario.
   - Vocabulario técnico limpio para evitar falsos positivos de `PROHIBITED_CONTENT`.
2. **Entrada Limpia de Capítulo (`contents`)**:
   - Se suministra únicamente el texto del pasaje como payload del usuario.
3. **Compatibilidad Total**:
   - `gemini-3.5-flash-lite` y `gemini-3.6-flash` responden de forma óptima sin bloqueos.

## Propósito
- Garantizar la generación ininterrumpida de las 8 preguntas pedagógicas sin interferencia de filtros de seguridad.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
