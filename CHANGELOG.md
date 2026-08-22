# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0-beta.6] - 2026-08-22

Versión mayor que introduce la persistencia local de manuscritos, la Estantería de Libros interactiva en 3D y la celebración de libros completados.

### ✨ Añadido (Added)
- **Mi Estantería de Libros (Biblioteca Persistente en IndexedDB)**:
  - Almacenamiento local de libros completos en `IndexedDB` (`lecturama_library_db`).
  - Renderizado de portadas 3D a partir de la primera página del manuscrito con textura de lomo y animación en gravedad cero.
  - Detección multinivel de título y autor (metadatos, portada y nombre de archivo).
  - Barra de progreso parcial con colores de semáforo (Verde, Amarillo, Rojo) sobre fondo negro y dorado al 100%.
  - Insignias de trofeo `🏆 X/Y ¡Completado!` y visualización uniforme `X/Y` quizes.
  - Opción para eliminar obras de la estantería.
- **Celebración de Libro Conquistado ("Maestría Lectora Alcanzada")**:
  - Modal festivo con medalla y frase pedagógica motivacional para inspirar la lectura de un nuevo manuscrito.
- **Herramienta de Desarrollo (Dev Tools)**:
  - Toggle en cabecera para desbloqueo libre de capítulos para pruebas rápidas (solo en desarrollo).

### 🛡️ Corregido (Fixed)
- **Carga Inmutable de PDFs y Desacoplamiento de Workers**:
  - Lectura binaria nativa a `Uint8Array` en memoria RAM directa (`fileSource`), eliminando condiciones de carrera, errores de worker, `404 File not found` y `detached ArrayBuffer`.
- **Transacciones de IndexedDB**:
  - Manejo robusto del ciclo de vida de transacciones y fusión segura (*merge*) de registros.

---

## [1.0.0-beta.5] - 2026-08-22

Quinta versión beta que introduce la identidad visual "Manuscrito Vivo" diseñada con Google Stitch, resiliencia con Fast-Fallback y optimización de latencia.

### ✨ Añadido (Added)
- **Identidad Visual "Manuscrito Vivo" (Google Stitch)**:
  - Fondo animado en gravedad cero con libros flotantes, plumas y destellos sobre grafito cálido (`#0E0D0C`) con halos dorados.
  - Atril de lectura táctil (dropzone con resplandor dorado `gold-glow` y micro-animaciones).
  - Escritorio de lectura inmersivo con iluminación de lámpara y sombra multicapa envolvente.
  - Monograma e Isotipo Oficial SVG de libro abierto con halo de conocimiento.
- **Historial de Versiones en Tiempo Real**:
  - Ruta interactiva `/changelog` para consultar las versiones y notas de lanzamiento oficiales.

### 🎨 Mejorado (Changed)
- **Latencia de IA y Fast-Fallback**:
  - Conmutación ultra-rápida a `gemini-3.5-flash-lite` (~2.8s) con respaldo en `gemini-3.6-flash`.
  - Configuración de políticas de seguridad permisivas (`BLOCK_NONE`) para evitar falsos positivos en obras literarias.

### 🛡️ Corregido (Fixed)
- **Desbloqueo de Niveles en Cascada**:
  - Corrección de la lógica de desbloqueo secuencial para garantizar que solo se desbloquee el capítulo inmediatamente siguiente.

---

## [1.0.0-beta.4] - 2026-08-21

Cuarta versión beta enfocada en la calibración pedagógica profunda de los desafíos de lectura y metacognición del lector.

### ✨ Añadido (Added)
- **8 Preguntas Psicométricas por Nivel**:
  - Incremento del reto a 8 preguntas con distractores de alta verosimilitud y explicaciones inmediatas.
  - Adaptabilidad de razonamiento según el tipo de texto (narrativo vs. expositivo/argumentativo).
- **Sistema de 4 Vidas y Metacognición**:
  - 4 vidas por nivel (`❤️❤️❤️❤️`) con diagnóstico formativo.
  - Tips de Atención Lectora graduados según vidas restantes (4, 3, 2, 1, 0) para fortalecer la concentración.
- **Dificultad Calibrada en 3 Niveles**:
  - Básica (8 a 12 años), Media (13 a 17 años) y Avanzada (Adultos).

---

## [1.0.0-beta.3] - 2026-08-21

Tercera versión beta que elimina de raíz la sobrecarga concurrente durante la apertura de PDFs y estabiliza la gamificación.

### 🛡️ Corregido (Fixed)
- **Prevención de Inundación de Páginas en Inicialización**:
  - Se implementó un estado de espera (*"Detectando capítulos y niveles..."*) mientras se extrae el outline del libro, evitando que React intente montar cientos de páginas simultáneas antes de conocer la estructura del documento.
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
