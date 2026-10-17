# Portero Diario

App web para porteros que entrenan sin entrenador de porteros. Un test inicial de opción múltiple (con quién entrenas, dónde, cuándo, con qué material, tu nivel y tus objetivos) genera un plan por semanas organizado alrededor del día de partido. Cada día tienes tu sesión con series, temporizador, modo guiado y vídeos de referencia, además de una biblioteca de más de 100 ejercicios, tests de progreso e historial.

Para casos puntuales (una prueba o un partido mañana, agujetas o la vuelta tras un parón) tiene una **rutina especial**: un test corto que crea la sesión de hoy y los días hasta la prueba o el partido, con los ejercicios de la categoría **Agujetas y víspera**.

Cada ejercicio tiene su animación (varias cuando tiene varias partes) y hay **8 rutinas para quitar agujetas** basadas en revisiones y metaanálisis: exprés, tras saltos o sprints, el día después del partido, tren superior, agujetas fuertes, calentamiento para entrenar con agujetas, antes de dormir y frío, calor o contraste.

La pestaña **Guía** reúne la dieta según peso, altura, edad y presupuesto; rutinas de activación mental, de coordinación y de agujetas; sesiones «Entrena como» inspiradas en Ederson, Alisson, Courtois, Dibu Martínez y Donnarumma; lecturas sobre bisectriz, posición de base, cómo colocar el cuerpo, leer al rival, calentamiento, estiramientos y academias; una lista de libros para porteros; y **Analizar partidos**: enlaces comprobados a vídeos solo del portero (Player Cam, primera persona), partidos completos y tandas de penaltis del canal de la FIFA, el Mundial 2026, estadísticas por portero en FotMob, cómo verlo en el móvil y el ordenador, cinco sesiones listas y una sesión de análisis de una hora con temporizador, contadores de acciones y conclusiones.

Funciona en el móvil como una app: se instala en la pantalla de inicio y abre sin conexión después de la primera visita.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa (HTML, estilos y lógica en un solo archivo) |
| `manifest.webmanifest`, `icon-*.png`, `icon.svg` | Nombre, colores e iconos para instalarla en el móvil |
| `sw.js` | Permite abrirla sin conexión |
| `apps-script/Code.gs` | Servidor opcional en Google Apps Script para guardar tus datos en Google |
| `apps-script/appsscript.json` | Configuración del proyecto de Apps Script |

## 1. Publicarla con GitHub Pages

1. En el repositorio, entra en **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
3. En un par de minutos la app estará en https://marcresfacturacion-art.github.io/GOALKEEPERWORK/.

## 2. Instalarla en el móvil

- **Android (Chrome):** abre la dirección, menú ⋮ → **Instalar aplicación** o **Añadir a pantalla de inicio**.
- **iPhone (Safari):** abre la dirección, botón **Compartir** → **Añadir a pantalla de inicio**.

Sin el paso 3, tus datos se guardan solo en ese móvil.

## 3. Guardar tus datos en Google (opcional)

Con esto tus sesiones y tests se guardan en tu Google Drive, puedes usar la app en varios dispositivos y consultas tu historial en una hoja de cálculo.

1. Entra en [script.google.com](https://script.google.com) y crea un **Proyecto nuevo**. Llámalo `Portero Diario`.
2. Borra lo que haya en `Código.gs` y pega el contenido de `apps-script/Code.gs`.
3. En la línea `const CLAVE = 'cambia-esta-clave';` pon una clave tuya de al menos 6 caracteres. Esa clave no se sube a GitHub: solo existe en tu proyecto de Apps Script.
4. Guarda, elige la función `probar` arriba y pulsa **Ejecutar**. Google te pedirá permisos para Drive y Hojas de cálculo: acéptalos. Se crean un archivo `portero-diario-estado.json` y una hoja `Portero Diario (datos)` en tu Drive.
5. Pulsa **Implementar → Nueva implementación**, tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Copia la **URL de la aplicación web** (acaba en `/exec`).
7. En la app: **Perfil → Guardar en Google Sheets**, pega la URL y tu clave y pulsa **Conectar**.

Si cambias el código del script, vuelve a **Implementar → Gestionar implementaciones → Editar → Nueva versión** para que la URL use el código nuevo.

### Cómo funciona la sincronización

- La app guarda siempre en el navegador y, si está conectada, también en tu Drive unos segundos después de cada cambio.
- Al abrirla, si los datos de Drive son más recientes que los del dispositivo, los carga.
- La hoja de cálculo tiene dos pestañas, **Sesiones** (fecha, tipo, minutos, esfuerzo, carga, sensación, lugar, nota) y **Tests**, que se rehacen en cada guardado. No las edites a mano: el archivo JSON es el que manda.
- Cualquiera que tenga la URL del script y tu clave podría leer o cambiar tus datos de entrenamiento. No las compartas.

## La ciencia detrás

El plan se basa en estudios sobre las demandas del portero en partido, la carga de porteros profesionales en la semana, la potencia de la estirada y la prevención de lesiones (aductor de Copenhague, nórdico de isquiotibiales y FIFA 11+). Las fuentes completas están en la app, en **Perfil → La ciencia → Fuentes**.

Esta app no sustituye a un entrenador ni a un profesional sanitario.
