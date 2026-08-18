# Tarea 11: Endpoint de Verificación de Sesión (`/api/session`)

## Descripción
Creación de un Route Handler `GET /api/session` para comprobar la generación, persistencia y lectura del UUID de sesión anónima en las cookies del navegador.

## Propósito
- Permitir verificar manualmente y mediante pruebas HTTP que `getOrCreateSessionId()` mantiene la identidad del usuario en sucesivas peticiones y renueva el UUID al limpiar cookies o en modo incógnito.

## Componentes y Cambios
1. **`src/app/api/session/route.ts`**:
   - Endpoint `GET` que invoca `getOrCreateSessionId()` y retorna el `sessionId` activo junto con metadatos de estado.

## Rama
- `dev`
