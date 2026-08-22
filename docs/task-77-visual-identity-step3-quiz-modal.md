# Tarea 77: Identidad Visual (Paso 3: Modal de Quiz "Biblioteca Interactiva")

## Descripción
Implementación de la tercera fase de la identidad visual de Lecturama bajo el estilo **"Biblioteca Interactiva"** en el componente `src/components/QuizModal.tsx`:
1. **Cabecera Editorial**:
   - Incorporación del isotipo oficial `LecturamaLogo` junto al título del capítulo.
   - Indicador de vidas con corazones estilizados y contador de vidas restante (`4 vidas`).
2. **Barra de Progreso Suave**:
   - Degradado ámbar dorado (`from-amber-400 to-amber-500`) con esquinas redondeadas.
3. **Tarjetas de Preguntas y Opciones de Examen**:
   - Tipografía Outfit para el enunciado de la pregunta.
   - Opciones A, B, C, D con diseño de tarjeta táctil, bordes interactivos y feedback visual instantáneo (Esmeralda para aciertos, Carmesí para fallos).
   - Caja de explicación pedagógica con bordes temáticos suaves.
4. **Pie de Página y Acciones**:
   - Botón *"🔖 Pausar y salir"* para volver a consultar el texto sin perder el progreso.
   - Botón de avance *"Siguiente Pregunta ➔"* / *"Ver Resultados ➔"* con color ámbar vibrante.

## Propósito
- Brindar una experiencia de evaluación amigable, formativa y visualmente armónica con el resto de la plataforma.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**

## Rama
- `dev` (en pruebas locales)
