# Tarea 73: Release v1.0.0-beta.4

## Descripción
Liberación oficial de la versión `1.0.0-beta.4` con consolidación pedagógica, optimización de IA y mejoras en la experiencia de usuario:
1. **Calibración Pedagógica**:
   - Generación de 8 preguntas por capítulo con 4 vidas.
   - Distractores psicométricos de alta verosimilitud (trampas de lectura rápida, causalidad invertida y sentido común).
   - Adaptabilidad para textos narrativos y expositivos/argumentativos.
2. **Motor de IA Blindado y Optimizado**:
   - Migración a `systemInstruction` nativo en Google GenAI SDK.
   - Configuración de políticas de seguridad permisivas (`HarmBlockThreshold.BLOCK_NONE`).
   - Generación rápida en ~2.8s con `gemini-3.5-flash-lite` y fallback a `gemini-3.6-flash`.
   - Límite holgado de 8.192 tokens con presupuesto de pensamiento de 512 tokens.
3. **Metacognición y Foco**:
   - Sistema de diagnósticos de comprensión y **💡 Tips de Atención Lectora** al finalizar el quiz según vidas restantes (4, 3, 2, 1, 0).
4. **Landing Page y Transparencia**:
   - Botón de enlace directo al repositorio oficial de GitHub.
   - Pantalla de **Changelog (`/changelog`)** con timeline interactivo sincronizado en tiempo real con la rama `main` de GitHub.

## Tareas Incluidas
- **Tarea 62**: Calibración pedagógica a 8 preguntas y 4 vidas.
- **Tarea 63**: Distractores de alta verosimilitud y homogeneidad estricta.
- **Tarea 64**: Extracción de partes no-pensadas y ampliación de tokens.
- **Tarea 65**: Actualización del motor a Gemini 3.6 Flash.
- **Tarea 66**: Optimización de presupuesto de tokens y prioridad Flash-Lite.
- **Tarea 67**: Extractor universal de respuestas y parser array-first.
- **Tarea 68**: Configuración de umbrales de seguridad educativa (`BLOCK_NONE`).
- **Tarea 69**: Migración a `systemInstruction` nativo.
- **Tarea 70**: Mensajes pedagógicos de finalización y tips de atención.
- **Tarea 71**: Botón de GitHub en la landing page.
- **Tarea 72**: Pantalla de Changelog sincronizada con GitHub.

## Tag
- `v1.0.0-beta.4`

## Ramas Afectadas
- `dev` -> `main` -> `origin/main` & `origin/dev`
