export interface QuizFeedback {
  lives: number;
  badge: string;
  title: string;
  subtitle: string;
  diagnostic: string;
  focusTip: string;
  accentColor: "amber" | "emerald" | "blue" | "indigo" | "rose";
  heartsDisplay: string;
}

/**
 * Returns pedagogical feedback and focus/attention tips based on the user's remaining lives.
 */
export function getQuizCompletionFeedback(remainingLives: number): QuizFeedback {
  const clampedLives = Math.max(0, Math.min(4, remainingLives));

  switch (clampedLives) {
    case 4:
      return {
        lives: 4,
        badge: "🧠 Atención Plena y Comprensión Impecable",
        title: "¡Foco Total y Análisis Magistral!",
        subtitle: "Capítulo completado con maestría (4/4 vidas)",
        diagnostic:
          "Tu nivel de concentración fue extraordinario. No solo leíste el texto, sino que retuviste las relaciones sutiles y los motivos de fondo sin dejarte distraer.",
        focusTip:
          "Sigue practicando este estado de 'flujo lector'. Cuando leas el próximo capítulo, mantén tu entorno libre de estímulos visuales para consolidar este nivel de retención.",
        accentColor: "amber",
        heartsDisplay: "❤️ ❤️ ❤️ ❤️",
      };
    case 3:
      return {
        lives: 3,
        badge: "🎯 Lectura Analítica y Sólida",
        title: "¡Excelente Nivel de Concentración!",
        subtitle: "Capítulo superado con gran desempeño (3/4 vidas)",
        diagnostic:
          "Demostraste una lectura profunda y atenta. La única imprecisión fue un detalle menor, pero captaste la esencia y estructura del capítulo con gran claridad.",
        focusTip:
          "Al encontrar pasajes densos o giros inesperados, haz una pausa de 3 segundos para visualizar mentalmente la escena antes de continuar. Eso fijará los detalles que suelen escapar.",
        accentColor: "emerald",
        heartsDisplay: "❤️ ❤️ ❤️ 🤍",
      };
    case 2:
      return {
        lives: 2,
        badge: "📖 Lectura Consciente y Resiliente",
        title: "¡Capítulo Conquistado con Buen Esfuerzo!",
        subtitle: "Capítulo aprobado con solidez (2/4 vidas)",
        diagnostic:
          "Comprendiste las ideas principales y lograste superar las preguntas más complejas, aunque algunas distracciones en los detalles redujeron tus vidas.",
        focusTip:
          "Prueba la técnica del 'puntero mental': al avanzar por párrafos largos, pregúntate al final de cada página: '¿Qué acaba de cambiar aquí?'. Te ayudará a evitar la lectura en piloto automático.",
        accentColor: "blue",
        heartsDisplay: "❤️ ❤️ 🤍 🤍",
      };
    case 1:
      return {
        lives: 1,
        badge: "🧘 Recuperación y Persistencia",
        title: "¡Aprobado al Límite! Mantén el Foco",
        subtitle: "Superviviente enfocado (1/4 vidas)",
        diagnostic:
          "Lograste descifrar el capítulo en el momento decisivo, pero tu atención se dispersó en varias partes intermedias de la lectura.",
        focusTip:
          "Antes de comenzar el siguiente capítulo, inhala profundo y despeja la mente. Si sientes cansancio visual o dispersión, lee a un ritmo un 10% más pausado para conectar las causas con sus efectos.",
        accentColor: "indigo",
        heartsDisplay: "❤️ 🤍 🤍 🤍",
      };
    case 0:
    default:
      return {
        lives: 0,
        badge: "🔍 Entrenamiento de Foco y Relectura",
        title: "¡Pausa Necesaria! Momento de Reenfoque",
        subtitle: "Has agotado tus vidas en este intento (0/4 vidas)",
        diagnostic:
          "Este pasaje requería una atención muy minuciosa y es natural que la mente divague. La relectura es la herramienta más poderosa de los lectores expertos.",
        focusTip:
          "Toma un vaso de agua, regresa al inicio del capítulo y lee subrayando mentalmente los motivos de cada personaje o idea. Verás cómo en tu reintento las respuestas saltan a la vista.",
        accentColor: "rose",
        heartsDisplay: "🤍 🤍 🤍 🤍",
      };
  }
}
