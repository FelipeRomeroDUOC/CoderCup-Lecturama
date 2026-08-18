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
- **Servidor (Route Handlers / Server Actions de Next.js)**: en el futuro expondrá
  la lógica que llama a una API de IA externa para generar las preguntas de cada
  capítulo/nivel. **Esto todavía no se construye** — se menciona aquí solo para que
  el agente entienda que en algún momento aparecerán carpetas/archivos de lógica de
  servidor (por ejemplo en `app/api/`) dedicados a esto, y no los confunda con el
  alcance actual ni intente adelantarse a implementarlos.

## Fase actual: SOLO la interfaz del lector de PDFs

Por ahora el foco es exclusivamente construir la interfaz para subir y leer PDFs.
NO implementes todavía:

- Lógica de preguntas / quizzes
- Sistema de "niveles" o bloqueo de capítulos según progreso
- Guardado de progreso del usuario
- Autenticación de usuarios
- Backend / base de datos

Si detectas que una tarea requiere alguna de estas piezas, detente y pregunta antes
de construirla — no la implementes "por adelantado" aunque el nombre del proyecto
lo sugiera.

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

## Alcance de la interfaz del lector (fase actual)

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

- No inventar endpoints de backend ni base de datos que no existen en el proyecto.
- No agregar autenticación ni persistencia de progreso todavía.
- No implementar el sistema de preguntas/quizzes en esta fase.
- No implementar todavía la llamada a la API de IA ni ningún Route Handler /
  Server Action relacionado con generación de preguntas — solo tenlo presente
  como trabajo futuro del lado del servidor.