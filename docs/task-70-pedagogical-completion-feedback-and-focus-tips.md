# Tarea 70: Mensajes Pedagógicos de Finalización y Tips de Atención y Enfoque

## Descripción
Implementación de un sistema de retroalimentación metacognitiva y pedagógica al finalizar el quiz de cada capítulo, graduado según las vidas restantes (4, 3, 2, 1, 0 vidas de un total de 4):
1. **Graduación por Vidas**:
   - **4 Vidas (`❤️❤️❤️❤️`)**: *Atención Plena y Comprensión Impecable*.
   - **3 Vidas (`❤️❤️❤️🤍`)**: *Lectura Analítica y Sólida*.
   - **2 Vidas (`❤️❤️🤍🤍`)**: *Lectura Consciente y Resiliente*.
   - **1 Vida (`❤️🤍🤍🤍`)**: *Recuperación y Persistencia*.
   - **0 Vidas (`💔`)**: *Entrenamiento de Foco y Relectura*.
2. **Estructura Pedagógica de Cada Estado**:
   - **Insignia Temática y Título Motivacional**.
   - **Diagnóstico de Comprensión y Nivel de Foco**.
   - **💡 Tip de Enfoque y Atención Lectora** (consejos metacognitivos prácticos para entrenar la concentración en pasajes densos).
3. **Integración Visual en `QuizModal.tsx`**:
   - Renderizado enriquecido en las pantallas de Victoria y Game Over con insignias, caja destacada de tips de concentración y llamadas a la acción (*Continuar al siguiente capítulo* o *Reintentar quiz*).

## Propósito
- Reforzar el valor formativo de la gamificación, entrenando activamente los hábitos de atención y concentración del lector.

## Componentes y Cambios
1. **`src/lib/quizFeedback.ts`** (Nuevo módulo de diagnóstico y consejos)
2. **`src/components/QuizModal.tsx`** (Integración visual de resultados enriquecidos)

## Rama
- `dev` (en pruebas locales)
