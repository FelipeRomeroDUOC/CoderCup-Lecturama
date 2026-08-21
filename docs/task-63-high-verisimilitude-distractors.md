# Tarea 63: Distractores de Alta Verosimilitud y Respuestas Menos Obvias

## Descripción
Refinamiento psicométrico de las instrucciones para la formulación de distractores (opciones incorrectas) y respuestas correctas en `src/lib/gemini.ts`:
1. **Trampas Psicométricas de Comprensión Profunda**:
   - **Trampa de Escaneo Literal**: Distractor que utiliza términos y citas textuales del capítulo, pero asignados a una causa, personaje o momento equivocado.
   - **Causalidad Invertida**: Distractor que invierte el orden lógico de causa-efecto o confunde motivos reales.
   - **Sentido Común / Sobre-generalización**: Distractor que suena convincente en la vida cotidiana pero carece de sustento en el texto.
2. **Homogeneidad Sintáctica y de Extensión**:
   - Mismo número de palabras y estructura gramatical idéntica en las 4 alternativas.
   - Eliminación de pistas de longitud, tono o palabras absolutas (*"nunca"*, *"siempre"*).
3. **Sutileza en la Respuesta Correcta**:
   - Expresada de manera sobria y natural sin sonar más completa ni más elaborada que los distractores.

## Propósito
- Elevar el desafío cognitivo del lector, impidiendo la resolución por descarte superficial.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` (en pruebas locales)
