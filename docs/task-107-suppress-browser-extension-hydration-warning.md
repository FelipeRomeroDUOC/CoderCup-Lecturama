# Tarea 107: Supresión de Advertencia de Hidratación por Extensiones de Navegador

## Descripción
Corrección del aviso de discrepancia de hidratación (*Hydration Mismatch*) causado por extensiones de navegador de terceros (ej: Dark Reader, traductores o inyectores de estilos) que mutan atributos del DOM antes de que React finalice la hidratación en el cliente:
- Se añadió `suppressHydrationWarning` en las etiquetas `<html>` y `<body>` de `src/app/layout.tsx`.

## Componentes y Cambios
1. **`src/app/layout.tsx`**

## Rama
- `dev`
