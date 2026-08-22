# Tarea 97: Corrección de UnhandledRejection UnknownError en IndexedDB

## Descripción
Corrección del error `unhandledRejection: UnknownError: The operation failed for reasons unrelated to the database itself...`:
- Se añadió captura y resolución integral de eventos a nivel de transacción (`transaction.oncomplete`, `transaction.onerror`, `transaction.onabort`) en todas las funciones de `src/lib/bookStorage.ts`.
- Se implementó actualización segura mediante fusión (*merge*) en `saveStoredBook`, evitando colisiones de transacciones y escrituras redundantes de grandes Blobs de PDF.

## Componentes y Cambios
1. **`src/lib/bookStorage.ts`**

## Rama
- `dev` (en pruebas locales)
