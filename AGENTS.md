<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Sobre este proyecto

Este proyecto es un lector de PDFs gamificado. El usuario sube un libro (PDF), el
sistema lo divide en capítulos, y cada capítulo funciona como un "nivel": no se
puede avanzar al siguiente capítulo sin responder correctamente una ronda de
preguntas sobre el capítulo actual.

## Arquitectura: cliente y servidor

Este es un único proyecto Next.js (App Router) que contiene tanto el cliente como
el servidor en el mismo codebase — **no** es un monorepo con paquetes separados, es
simplemente cómo funciona Next.js por defecto. Todo se despliega junto como una
sola aplicación en **Vercel**.

- **Cliente (navegador)**: renderiza el visor de PDFs, la navegación entre páginas
  y capítulos, y toda la interacción del usuario. Es donde se enfoca el trabajo
  actual.
- **Servidor (Route Handlers de Next.js)**: expone la lógica que llama a la API de
  IA (Google AI Studio / Gemini) para generar las preguntas de cada capítulo, y la
  lógica para guardarlas y consultarlas en la base de datos. Esto es el foco de la
  fase actual (ver sección "Backend: generación de preguntas con IA" más abajo).

## Historial de fases

1. ✅ **Completada** — Interfaz del lector de PDFs (subida de archivo, visor,
   navegación entre páginas y capítulos).
2. 🔨 **Fase actual** — Backend para generar y persistir las preguntas de cada
   capítulo (ver secciones "Backend: generación de preguntas con IA" y
   "Persistencia" más abajo).
3. ⏳ **Pendiente** — Integrar el quiz en el cliente: mostrar las preguntas, restar
   vidas, bloquear el siguiente capítulo hasta aprobar. No implementar todavía a
   menos que el usuario lo pida explícitamente.
4. ⏳ **Pendiente** — Autenticación de usuarios, si se decide agregarla más
   adelante.

## Backend: generación de preguntas con IA

- **Proveedor**: Google AI Studio (API de Gemini), capa gratuita.
- **Cuándo se genera**: bajo demanda, cuando el usuario termina de leer un
  capítulo — nunca al subir el libro. Esto evita golpear los límites de la capa
  gratuita (bastante ajustados: pocas solicitudes por minuto y un tope diario,
  según el modelo) y evita gastar cuota en capítulos que el usuario nunca llegue a
  leer.
- **Cantidad**: 5 preguntas por capítulo.
- **Vidas**: 3 vidas por capítulo, independientes entre capítulos.
- **Reintentos**: las preguntas de un capítulo se generan **una sola vez** y se
  guardan. Si el usuario pierde las 3 vidas, el reintento reutiliza el mismo set de
  5 preguntas — nunca se vuelve a llamar a la IA para un capítulo que ya tiene
  preguntas generadas.
- **Formato de salida**: pedirle al modelo que devuelva las preguntas en un JSON
  estructurado y estricto (texto de la pregunta, opciones, índice de la respuesta
  correcta) para poder parsearlo de forma confiable.
- **Manejo de errores**: la capa gratuita puede devolver error 429 al exceder el
  límite de solicitudes. Implementar reintento con backoff exponencial simple, no
  ignorar el error ni fallar silenciosamente.
- **Dónde vive el código**: un Route Handler (por ejemplo
  `app/api/chapters/[id]/questions/route.ts`) que recibe el texto del capítulo,
  llama a la API de Gemini, guarda el resultado en la base de datos y lo devuelve
  al cliente.
- **API key**: la clave de la API de Gemini se guarda como variable de entorno del
  servidor (por ejemplo `GEMINI_API_KEY`) y nunca se expone al cliente.

## Persistencia

- Base de datos: **Postgres a través del Vercel Marketplace (integración con
  Neon)**. Ya no existe "Vercel Postgres" como producto propio — se provisiona
  desde el Marketplace de Vercel.
- Qué guardar en esta fase, como mínimo:
  - Las 5 preguntas generadas por capítulo (para no volver a llamar a la IA).
  - Las vidas restantes por capítulo, asociadas a un usuario.
- **Identidad sin login**: como todavía no hay autenticación, usar un identificador
  de sesión anónimo (por ejemplo una cookie con un UUID generado en el primer
  request) para asociar el progreso/vidas a un "usuario" sin necesidad de cuenta.
  Esto es una recomendación, no una decisión cerrada — confírmalo con el usuario
  antes de fijar el esquema final de la base de datos.

## Stack técnico

- Next.js con App Router
- TypeScript — usar siempre tipos explícitos, evitar `any`
- Estilos: aún no decidido. Si necesitas instalar una librería de estilos, sugiere
  Tailwind CSS por defecto, pero confirma con el usuario antes de instalar
  dependencias nuevas de estilos.
- PDFs: usar `react-pdf` (basado en pdf.js) para renderizar el visor. Si se necesita
  leer el outline/tabla de contenidos embebido en el PDF para detectar capítulos,
  usar las utilidades de `pdfjs-dist` directamente (react-pdf lo trae como
  dependencia interna).
- IA: Google AI Studio (Gemini API, capa gratuita) — ver "Backend: generación de
  preguntas con IA".
- Base de datos: Postgres vía Vercel Marketplace (Neon) — ver "Persistencia".

## Alcance de la interfaz del lector (completado)

1. Componente para subir un archivo PDF (drag & drop + selector de archivo).
2. Vista de lector que muestra el PDF (por página o con scroll continuo).
3. Navegación entre páginas: anterior/siguiente e ir a una página específica.
4. División del PDF en capítulos:
   - Si el PDF tiene un outline/tabla de contenidos embebido, usarlo para mapear
     cada capítulo a su rango de páginas.
   - Si no tiene outline, dejar un TODO claro en el código — no implementar
     heurísticas complejas de detección de capítulos todavía.
5. Lista o menú de capítulos que permita saltar entre ellos. En esta fase todos los
   capítulos deben ser accesibles libremente, sin ningún bloqueo por progreso.

## Convenciones de código

- Componentes en `src/components/`, un archivo por componente.
- Server Components por defecto; agregar `'use client'` solo en los componentes que
  necesiten interactividad (el visor de PDF, controles de navegación, etc.).
- Archivos y componentes en PascalCase (`PdfViewer.tsx`); funciones y utilidades en
  camelCase.
- Separar la lógica de UI en hooks personalizados cuando tenga sentido
  (`usePdfDocument`, `useChapters`, etc.) en lugar de mezclarla dentro de los
  componentes.

## Qué NO hacer

- No implementar la interfaz del quiz en el cliente todavía (mostrar preguntas,
  restar vidas, bloquear capítulos) — es la siguiente fase, no esta.
- No agregar autenticación con login/cuentas todavía — usar el identificador de
  sesión anónimo descrito en "Persistencia".
- No generar preguntas de todos los capítulos de una vez (batch) — siempre bajo
  demanda, un capítulo a la vez.
- No volver a llamar a la API de IA para un capítulo que ya tiene preguntas
  generadas y guardadas, ni siquiera si el usuario pierde todas las vidas.