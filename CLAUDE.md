# Tovan · notas para Claude

Juego 3D roguelike por oleadas (three.js r128 por CDN, fuente Pixelify Sans de Google Fonts). HTML/CSS/JS sin compilación: se abre con doble clic en `index.html` (`file://`). El usuario no tiene Node; sí Python 3.13 (`py -3`) y Chrome/Edge. Visión general para humanos en `README.md`.

## Arquitectura (léelo antes de tocar nada)
- **Scripts clásicos, ámbito global compartido.** 141 ficheros en `js/` cargados con `<script src>` en `index.html`, cada uno con `'use strict'`. No hay ES modules ni IIFE: cualquier `function`/`const`/`let` de nivel superior es visible desde los demás ficheros. No introducir `import`/`export` sin decidirlo con el usuario: 92 funciones se reasignan desde capas posteriores (`const _old = fn; fn = function(){ _old(); … }`) y los imports no se pueden reasignar. Además, servir por http cambiaría el origen del `localStorage` y "perdería" las partidas.
- **El orden de los `<script>` en `index.html` es el orden de las capas originales (v1…v13) y no se debe cambiar.** Cada capa amplía las anteriores envolviendo funciones o con `push`/`Object.assign` sobre registros (`UPGRADES`, `TAGS`/`TAG_KEYS`, `BIOMES`, `BIOME_EX`, `MAKERS`, `SFX`, `SONGS`, `STORY`, `ACH`, `COS`, `COS_POW`, `SHRINE`, `BOSS_FILES`). El grupo «Arranque» (`interfaz/santuario.js` … `main.js`) va siempre al final. El contenido nuevo va en ficheros nuevos, en el hueco `<!-- Tus añadidos -->` justo antes de «Arranque».
- **Regla de carga:** dentro de un fichero, las `function` se elevan (hoisting). Entre ficheros, el código que se ejecuta al cargar solo puede usar lo declarado en ficheros anteriores. El código dentro de funciones que se llaman después (bucle, eventos) puede usar cualquier cosa. Por eso `partida/ciclo.js` (startRun, clearWorld, showOver, togglePause, toTitle, updateBest) y `nucleo/dom.js` (hud, titleScr, overScr…) se cargan pronto aunque en el original estaban al final.
- **Las funciones más envueltas:** `v3Update` (gancho por fotograma, 14 capas), `killEnemy`, `clearWorld`, `hitEnemy`, `startRun`, `spawnEnemy`, `startMove`, `hurtPlayer`, `startWave`. Para ver quién toca qué, busca `const _<nombre>`.
- **CSS:** `css/` en el orden de la cascada original; los 9 últimos ficheros (`pantalla-poderes.css` … `menus-movil.css`) eran `<style>` que el JS inyectaba en tiempo de ejecución y deben seguir cargándose después de los demás.
- **Texturas = PNG en `assets/texturas/`** (146; carpetas por dominio). `herramientas/texturas.py` (lo lanza `actualizar-texturas.bat`) las empaqueta como data URIs en `js/generado/texturas.js` (`TEXTURAS = { nombre: [w, h, dataURI] }`). **Nunca editar `js/generado/` a mano: tras tocar un PNG, ejecutar `py -3 herramientas/texturas.py`.** Motivo: con `file://`, Chrome no deja subir a WebGL imágenes cargadas desde archivos sueltos (cuentan como de otro origen); las data URIs sí valen.
  - `js/motor/assets.js`: `texAsset(nombre, {suave, borde})` devuelve un `THREE.CanvasTexture` sobre un lienzo del tamaño del PNG, que se pinta al decodificarse. Por defecto es nítido y repetido, como el antiguo `canvasTex`. `assetCanvas(nombre)` devuelve el lienzo y `assetImg(nombre)` la imagen (para `drawImage` en 2D). `texturasListas()` es la promesa que `main.js` espera antes del primer fotograma, así que nada se renderiza con texturas vacías.
  - `TEX_RND`: cuántos `rnd()` consumía cada textura al dibujarse por código. `texAsset` los sigue consumiendo para que la secuencia del PRNG con semilla (colocación del decorado) sea idéntica. Al añadir o quitar texturas no hay que tocarlo.
  - Sigue en código, porque es dinámico: el ranking del Canal X (`rankTex`/`drawRanking`), los lienzos del show (`mgC`, `PB9`), los brillos de `drawLumen` y el retrato del HUD (`drawPortrait`). `canvasTex` se mantiene en `renderer.js` por si hace falta una textura procedural nueva.
  - La conversión se verificó en Chrome headless con un registro instrumentado: 150 texturas iguales píxel a píxel, mismos filtros, repetición, codificación y anisotropía, y el mismo consumo de `rnd()` al cargar (9466).
- **Assets:**
  - Los mp3 de jefes están en `assets/audio/`. Los carga `track()` con `AUDIO_DIR` (en `js/audio/canciones-jefes.js`); si falta un mp3, suena la canción sintetizada.
  - La hoja de iconos `assets/img/iconos-16px.png` (16×16, 16 columnas) la usa `.px13` en `css/iconos-pixel.css`. `js/interfaz/iconos-pixel.js` sustituye solo los emojis del DOM por esos iconos.
  - `assets/img/iconos-tovan.png` es solo una vista ampliada de la hoja; el código no la usa.

## Convenciones
- Identificadores en inglés; comentarios y textos del juego en español.
- Secciones con `/* ---------- … ---------- */` y capas con banners `/* ===== … ===== */`.
- Código denso, muchas sentencias por línea. Imitar ese estilo al editar.
- Los nombres de los ficheros y carpetas van en español y sin tildes.
- Partidas guardadas en `localStorage`: `tovan-meta`, `tovan-best`, `tovan-audio`, `tovan-det13`.

## Verificación (cómo probar cambios sin abrir el navegador)
Las herramientas están en `backup/herramientas-migracion/`; sus rutas son relativas a ella. Copia el proyecto a una carpeta temporal y trabaja allí:
1. `py -3 harness.py <dir>` crea `index.test.html` (captura errores, `Math.random` con semilla, rAF sustituido por setTimeout de 16 ms, sesión scripteada por menús → intro → jugar → pausa → rendirse).
2. `py -3 harness_long.py <dir>` crea `index.long.html`, una sesión de ~90 s que elige cartas y llega al primer jefe.
3. `.\run_test.ps1 -Dir <dir> -Name <n> [-Page index.long.html] [-Budget 92000] [-Size 390,844]` lo lanza en Chrome headless (SwiftShader) y deja `report-<n>.json` (pasos, `errs`, estado de `tracks`, estilos computados en el paso `inicio`).
4. Texturas: `py -3 tex_record.py <proyecto> <nombre> 1` registra cada `CanvasTexture` creada (píxeles, pila de llamadas, filtros, consumo de `rnd()`, más el cubemap, los retratos y la estática) y deja `<nombre>.json`. `tex_compare.py` compara `antes.json` con `despues.json`, y `tex_sheet.py <nombre>` saca una hoja de contacto en PNG.

El juego no es determinista entre ejecuciones (WebAudio va en tiempo real), así que compara errores y pantallas, no los números del combate.

## Historia de la migración (2026-10-14)
El juego era un único `index.html` de ~14.700 líneas (CSS inline y un `<script>` dentro de un IIFE); está guardado en `backup/index-original.html`. Se partió con `split.py` (mapa de rangos de líneas → ficheros). La equivalencia se verificó así:
- `equiv.py`: mismas sentencias a nivel de tokens, salvo el CSS extraído, la hoja de iconos en base64, `AUDIO_DIR` y 5 movimientos de orden inocuos.
- Chrome headless: 0 errores, mismas pantallas y foco, estilos computados idénticos en escritorio y en móvil (salvo la URL de los iconos y la fase de las animaciones), sesión larga hasta derrotar al primer jefe, 8/8 mp3 cargados.

`split.py` y `analyze.py` leen `backup/index-original.html`, así que la separación se puede regenerar en una carpeta aparte si hiciera falta.
