# Tarea 60: Lanzamiento de Lecturama v1.0.0-beta.3

## Resumen del Release
- **Versión**: `1.0.0-beta.3`
- **Fecha**: 21 de Agosto de 2026
- **Tag Git**: `v1.0.0-beta.3`

## Cambios Principales
1. **Prevención de Inundación de Páginas en Inicialización**:
   - Guarda de espera visual durante la extracción de capítulos, evitando que se monten 138+ páginas de golpe en React 19 / `react-pdf`.
2. **Desacoplamiento de Scroll y Cambio de Capítulo**:
   - Navegación fluida dentro del capítulo activo sin que el `IntersectionObserver` cambie el rango de páginas del visor de manera cíclica.
3. **Restauración y Sincronización del Bloqueo Secuencial de Niveles**:
   - Corrección de props en `PdfViewer` y soporte para restablecimiento de progreso en desarrollo con `🛠️ Reset [DEV]`.
4. **Limpieza de Trazas**:
   - Retiro de todas las llamadas `console.log` de diagnóstico.

## Ramas y Despliegue
- Rama de trabajo: `dev`
- Rama de producción: `main`
- Tag de versión: `v1.0.0-beta.3`
- Despliegue automático vía Vercel
