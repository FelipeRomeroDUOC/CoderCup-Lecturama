# Tarea 96: Corrección de AbortError en Carga de PDF mediante FileReader Nativo

## Descripción
Corrección del error `AbortError: The operation was aborted` al abrir libros desde la estantería:
- Se reemplazó el método `file.arrayBuffer()` (que usa ReadableStreams susceptibles a abortos de stream) por `FileReader.readAsArrayBuffer(file)` nativo.
- La lectura de bytes a `Uint8Array` ahora es síncrona/directa, inmune a cancelaciones de stream del navegador y entregando los datos inmediatamente a `fileSource` para su renderizado en `<Document />`.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
