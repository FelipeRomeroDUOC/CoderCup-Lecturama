# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0-beta.3] - 2026-08-21

Tercera versión beta que elimina de raíz la sobrecarga concurrente durante la apertura de PDFs y estabiliza la gamificación.

### 🛡️ Corregido (Fixed)
- **Prevención de Inundación de Páginas en Inicialización**:
  - Se implementó un estado de espera (*"Detectando capítulos y niveles..."*) mientras se extrae el outline del libro, evitando que React 19 intente montar cientos de páginas simultáneas antes de conocer la estructura del documento.
  - Se eliminó el rebote de `activeChapterId` por scroll dentro del capítulo, desacoplando la observación de página de la selección de niveles.
  - Se corrigió el enlace de propiedades de gamificación (`isCurrentChapterCompleted`, `isNextChapterUnlocked`, `isNonPlayable`).
- **Limpieza de Código**:
  - Se retiraron todas las trazas y registros de telemetría temporal de depuración.

---

## [1.0.0-beta.2] - 2026-08-21

Segunda versión beta enfocada en estabilidad, concurrencia de renderizado y fluidez en la navegación.

### 🛡️ Corregido (Fixed)
- **Bucle de Concurrencia en `react-pdf` (`Page.useEffect.loadPage`)**:
  - Se erradicó el error `Maximum update depth exceeded` reemplazando los elementos JSX inline de carga por un componente estático (`PageLoadingPlaceholder`).
  - Se memorizó el componente `PdfViewer` con `React.memo` para aislar el renderizado del lienzo Canvas de actualizaciones de estado auxiliares del contenedor principal.
  - Se optimizó el `IntersectionObserver` con la guarda `lastReportedPageRef` para evitar llamadas redundantes a `setCurrentPage`.
- **Estabilización de Clasificación de Capítulos**:
  - Implementación de `evaluatedChapterIdsRef` en `PdfReader` para garantizar que ningún capítulo sea evaluado más de una vez por sesión.
  - Uso de referencias inmutables para `isChapterUnlockedRef` eliminando ciclos de re-renderizado al pasar de página.

---

## [1.0.0-beta.1] - 2026-08-21 (Beta Pública)

Primera versión pública preliminar de **LECTURAMA**, el lector de PDFs gamificado con generación inteligente de desafíos pedagógicos mediante IA.

### ✨ Añadido (Added)
- **Visor Continuo de PDFs**:
  - Renderizado optimizado con `react-pdf` y `pdfjs-dist` para lectura fluida en dispositivos móviles y de escritorio.
  - Navegación responsiva entre páginas y selector de saltos de página.
- **Gamificación por Capítulos**:
  - Detección automática del índice/outline embebido del PDF.
  - Detección visual por layout e intra-página para libros sin tabla de contenidos embebida.
  - Subdivisión inteligente de capítulos extensos (> 3 páginas).
  - Bloqueo visual progresivo de niveles con íconos de candado (`🔒`), opacidad atenuada y cursor bloqueado.
  - Detección híbrida (local y asistida con modelo `gemma-4-31b-it`) para desbloqueo libre de prólogos, portadas y páginas preliminares.
- **Desafíos de Comprensión con IA (Google Gemini)**:
  - Generación bajo demanda de 5 preguntas de opción múltiple estructuradas y pedagógicas.
  - Selector de dificultad adaptativa: *Básica (8-12 años)*, *Media (13-17 años)* y *Avanzada (Adultos)*.
  - Sistema de 3 vidas por nivel e indicadores visuales de corazones.
  - Explicaciones pedagógicas detalladas tras responder cada pregunta.
  - Aleatorización de opciones y preguntas para evitar sesgos de posición.
- **Persistencia Unificada Ligada al UUID**:
  - Gestión de identidad anónima del usuario mediante UUID persistente.
  - Almacenamiento local del progreso del libro y última página leída.
  - Pausa y reanudación del quiz sin perder las vidas ni las preguntas respondidas.
  - Botón inteligente dinámico: *"▶️ Continuar quiz del nivel"* vs *"🎯 Comenzar quiz del nivel"*.
- **Flexibilidad de Juego**:
  - Botón *"🏳️ Abandonar quiz"* con confirmación para reiniciar el nivel en cualquier momento.
  - Confirmación inteligente al cambiar de dificultad en el encabezado, regenerando preguntas nuevas y frescas al instante.
  - Botón de desarrollo `🛠️ Reset [DEV]` para pruebas y reinicio completo de memoria caché.

### 🎨 Mejorado (Changed)
- **Identidad de Marca**: Portada oficial con tipografía geométrica moderna **Outfit** para el título y tipografía manuscrita **Patrick Hand** para el subtítulo.
- **Arquitectura de Modelos**:
  - Generación de Quizzes: Modelo Principal `gemini-3.5-flash` con Thinking Mode (Timeout: 22s); Fallback ultra-rápido `gemini-3.5-flash-lite` (Timeout: 10s).
  - Clasificación de Secciones: Modelo `gemma-4-31b-it` (Timeout: 6s).
- **Entorno Limpio**: Configuración simplificada con solo `GEMINI_API_KEY` en `.env.local`.

### 🛡️ Corregido (Fixed)
- **Fast-Fallback y Prevención de Timeouts**: Conmutación inmediata sin esperas ante errores `503 UNAVAILABLE` o `429 RESOURCE_EXHAUSTED`.
- **Límites de Serverless en Vercel**: Configuración de `export const maxDuration = 60` en Route Handlers.
- **Ciclos Reactivos**: Idempotencia en `markChapterCompleted` para erradicar el error *Maximum update depth exceeded*.
- **Compatibilidad con Gemma**: Exclusión condicional de `thinkingConfig` y extracción robusta de JSON con fallback por expresiones regulares.
