# Tarea 48: Cancelación de Quiz y Cambio de Dificultad Dinámico (Solución Híbrida)

## Descripción
Implementación de opciones para cancelar o reiniciar el quiz en curso y permitir el cambio fluido de dificultad:
1. **Acción "🏳️ Abandonar quiz" en `QuizModal.tsx`**:
   - En el pie del modal, junto a "Pausar y salir", se agrega el botón para abandonar el intento.
   - Pide confirmación al usuario y elimina la sesión activa de `localStorage`, reseteando vidas y preguntas.
2. **Confirmación Inteligente al Cambiar Dificultad en `PdfReader.tsx`**:
   - Si el usuario cambia el selector de dificultad en el header mientras existe un quiz en pausa en el capítulo actual:
     - Solicita confirmación para descartar el intento actual.
     - Si confirma, borra la sesión guardada y deja el botón listo para generar el nuevo quiz con la dificultad elegida.
     - Si cancela, preserva la dificultad actual sin alterar el estado.

## Propósito
- Brindar flexibilidad al usuario para ajustar el nivel del reto sin quedar bloqueado por un quiz previamente iniciado.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**: Incorporación de botón y manejador para abandonar el quiz con `🏳️`.
2. **`src/components/PdfReader.tsx`**: Lógica de confirmación al cambiar dificultad con un quiz activo.

## Rama
- `dev`
