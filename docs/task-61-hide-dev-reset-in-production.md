# Tarea 61: Ocultar y Proteger Herramienta de Reset en Producción

## Descripción
Protección y ocultamiento del botón y endpoint de desarrollo `🛠️ Reset [DEV]`:
1. **Ocultamiento Condicional en UI**:
   - En `src/components/PdfReader.tsx`, el botón `🛠️ Reset [DEV]` solo se renderiza si `process.env.NODE_ENV === "development"`.
   - En compilaciones de producción (Vercel), Next.js / Turbopack elimina el bloque de código del bundle cliente.
2. **Protección de Endpoint Backend**:
   - En `src/app/api/dev/reset/route.ts`, se añade una guarda que devuelve `403 Forbidden` si la aplicación se ejecuta en `process.env.NODE_ENV === "production"`.

## Propósito
- Mantener una interfaz limpia y profesional para los lectores en producción y evitar llamadas accidentales de reinicio.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**
2. **`src/app/api/dev/reset/route.ts`**

## Rama
- `dev` (en pruebas locales)
