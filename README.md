# Tovan · Las ruinas sin fin

Roguelike 3D por oleadas con look de PlayStation 1, hecho con [three.js](https://threejs.org/) r128 y HTML/CSS/JS sin herramientas de compilación.

## Cómo jugar / desarrollar

- **Abrir el juego:** doble clic en `index.html`. No hace falta servidor ni instalar nada.
- **Requisito:** conexión a internet la primera vez (three.js y la fuente Pixelify Sans vienen de CDN).
- **Editar código:** cambia el `.js` o `.css` que toque y recarga la página (F5).
- **Editar texturas:** cambia el PNG en `assets/texturas/`, haz doble clic en **`actualizar-texturas.bat`** y recarga (F5). Ver [Texturas](#texturas).
- **Depurar:** todo el estado del juego es global, así que desde la consola del navegador (F12) puedes inspeccionar o tocar cosas directamente: `player.hp = 999`, `wave`, `enemies`, `meta`, `UPGRADES`…

## Estructura

```
index.html            esqueleto de la página + lista ordenada de <link> y <script>
actualizar-texturas.bat  empaqueta los PNG de assets/texturas para el juego (ejecútalo tras editarlos)
css/                  estilos, en el orden de la cascada original
assets/texturas/      todas las texturas y retratos del juego en PNG, por carpetas (mundo, jugador, jefes…)
assets/audio/         canciones de jefes (mp3); si falta alguna, suena la versión sintetizada
assets/img/           iconos-16px.png (hoja de iconos que usa el juego) e iconos-tovan.png (vista ampliada)
herramientas/         texturas.py, el script que usa actualizar-texturas.bat
js/
  generado/           texturas.js, creado por actualizar-texturas.bat (no se edita a mano)
  motor/              renderer, carga de texturas (assets.js), shader PS1, resolución
  nucleo/             utilidades matemáticas, estado global, referencias al DOM
  audio/              efectos y música sintetizados (WebAudio), banda sonora v3, mp3 de jefes
  entrada/            mando, teclado, ratón y táctil
  jugador/            modelo de Tovan, movimientos, acciones, ataque cargado, inercia, acrobacias
  enemigos/           enemigos base, oni, realistas; regiones/ = enemigos propios de cada escenario
  jefes/              Ryūjin, Gashadokuro, Tetera de Utah, ERROR 404, Seis Ojos, Míster Confianza, Gato final…
  mundo/              escenarios (biomas), ambiente, playa, ruinas corruptas, castillo, capítulos
  partida/            oleadas, mejoras, ciclo de partida (empezar / perder / volver al título)
  combate/            combo, billetes, limpieza de restos, sensación de impacto
  sinergias/          elementos, reacciones, rayos, sinergias emergentes
  poderes/            cartas de poder por versiones (otaku, v5, anime, v13, ramas, Súper Repartidor)
  armas/              estilos de arma, modelos, combos y cargados, poderes de arma
  efectos/            partículas, estelas, cortes legendarios; v7/ = efectos visuales de cada poder
  modelos/            modelos esculpidos v3 (enemigos y jefes)
  historia/           textos, diálogos de Lumen, viajes, isekai, finales, comedia
  cinematicas/        intro (decorado, motor de guion y guion)
  progreso/           fragmentos, santuario, logros, estéticos, títulos, % completado
  interfaz/           pantallas y menús (título, pausa, vestidor, logros, poderes, móvil…)
  canal-x/            el capítulo que cambia de estilo, y los marcianitos
  show/               el show de Míster Confianza (4 minijuegos)
  ajustes/            ajustes de equilibrio (v8, v10)
  main.js             bucle principal; arranca el juego
backup/               el index.html original de un solo archivo y las herramientas con las que se partió
```

## La regla de oro: el orden de carga

Todos los ficheros son **scripts clásicos que comparten el mismo ámbito global**. No hay `import`/`export`: una función o constante declarada en un fichero se puede usar desde cualquier otro.

El juego se fue construyendo por **capas** (v1, v2… v13), y cada capa amplía o modifica las anteriores. Por eso **el orden de los `<script>` en `index.html` importa**:

- Están agrupados por capa con un comentario (`<!-- Poderes v5 -->`, `<!-- v12: … -->`…).
- No los reordenes. Si una capa envuelve una función, tiene que cargarse después de quien la define.
- El grupo **«Arranque»** (santuario, título, controles, resolución, opciones y `main.js`) va **siempre el último**: es el que pone el juego en marcha.

Dentro de un mismo fichero, las `function` se pueden usar antes de su línea. Entre ficheros no: lo que se **ejecuta al cargar** solo puede usar cosas de ficheros anteriores. Dentro de funciones que se llaman después (en el bucle, al pulsar una tecla…) puedes usar cualquier cosa.

### Cómo se amplía una función (el patrón de las capas)

```js
const _killEnemyMio = killEnemy;           // guarda la versión anterior (nombre único)
killEnemy = function(e){
  const was = e.alive;
  _killEnemyMio(e);                         // llama a lo que ya había
  if (was && e.type === 'gargoyle') { /* lo tuyo */ }
};
```

Funciones que se amplían mucho así: `startRun`, `clearWorld`, `killEnemy`, `hitEnemy`, `hurtPlayer`, `spawnEnemy`, `startWave`, `v3Update` (gancho por fotograma)… Busca `const _nombre` para ver todas las capas que tocan una función.

## Añadir contenido

Crea tus ficheros nuevos y añádelos a `index.html` en el hueco **`<!-- Tus añadidos -->`**, justo antes del grupo «Arranque». Así cargan después de todo el juego y pueden usar o ampliar cualquier cosa.

| Quiero añadir… | Cómo |
|---|---|
| **Una carta de poder** | `UPGRADES.push({ id, r: 'comun'\|'rara'\|'epica'\|'leyenda', tags: ['fuego'], ic: '🔥', name, desc, max, apply: () => { … } })`. Ejemplos en `js/poderes/v5/catalogo.js`. |
| **Una familia / elemento** | `TAGS.mifamilia = { n, ic, col, bonus }; TAG_KEYS.push('mifamilia');`, como hace `js/poderes/otaku-tecnicas.js`. |
| **Un enemigo** | Una función `makeX()` que construye el modelo y devuelve `newEnemy('x', g, body, S, { hp, r, speed, upd: updX, … })`. Después regístralo con `MAKERS.x = makeX`. Para que salga en un escenario, `BIOME_EX.ruinas.push(['x', 2, 1])`. Modelo completo: `js/enemigos/regiones/ruinas.js` y `registro.js`. |
| **Un escenario** | `BIOMES.push({ id, name, sub, group, ground, sky, fog, … })`, como en `js/mundo/escenarios.js` y `js/mundo/capitulos.js`. |
| **Un logro** | Entrada en `ACH` (`{ id, ic, name, desc, rw: [['hat', 'cap']] }`) y `unlock('id')` donde se consiga. Ver `js/progreso/logros.js`. |
| **Un estético** | `COS.hat.push(['id', 'Nombre', '🎩'])` (también `glasses`, `weapon`, `effect`, `body`, `title`…). Su modelo se define con `hat('id', …)` y su poder en `COS_POW`. Ver `js/historia/isekai.js` y `js/progreso/titulos.js`. |
| **Una mejora del Santuario** | `SHRINE.push({ id, name, desc, max, cost: l => … })`. Ver `js/progreso/fragmentos.js`. |
| **Un sonido / una canción** | `Object.assign(SFX, { nombre: () => { tone({…}); } })` y `play('nombre')`; canciones en `SONGS` (o `js/audio/banda-sonora/temas.js`). |
| **Diálogo / historia** | Entradas en `STORY` (`js/historia/textos.js`): `['tovan' \| 'lumen' \| 'narr', 'texto']`. |
| **La canción mp3 de un jefe** | El mp3 en `assets/audio/` con el nombre de `BOSS_FILES` (`js/audio/canciones-jefes.js`). |
| **Una textura** | El PNG en `assets/texturas/<carpeta>/`, `actualizar-texturas.bat` y en el código `texAsset('<carpeta>/<nombre>')`. Ver [Texturas](#texturas). |

Los iconos con emoji se cambian solos por pixel art si el emoji está en la hoja (`js/interfaz/iconos-pixel.js`).

## Texturas

Todas las texturas y retratos del juego son PNG en `assets/texturas/`, agrupados en carpetas: `mundo`, `jugador`, `enemigos`, `jefes`, `canal-x`, `cinematica`, `efectos`, `objetos`, `armas` y `retratos`. Puedes editarlos con cualquier programa: Aseprite, Photoshop, Paint.NET, GIMP…

**Después de editar, haz doble clic en `actualizar-texturas.bat`** y recarga el juego. El script mete todos los PNG en `js/generado/texturas.js`, que es lo que lee el juego. Hace falta porque, al abrir el juego con doble clic, el navegador no deja que WebGL use imágenes sueltas, pero sí las que van dentro de un `.js`. Si no lo ejecutas, el juego seguirá mostrando la versión anterior. Necesita Python, que ya tienes instalado.

- **El nombre de una textura** es su ruta sin `.png`: `assets/texturas/jefes/gato-cara.png` es `'jefes/gato-cara'`.
- **Usar una textura nueva:** ponla en `assets/texturas/`, ejecuta el `.bat` y, en el código, `makeMat(0xffffff, { map: texAsset('carpeta/nombre') })`.
  - Por defecto se ve con píxel nítido y repetida, como todas las del juego.
  - `texAsset(nombre, { suave: true })` la suaviza (para texturas realistas).
  - `{ borde: true }` hace que no se repita.
- **Tamaños:**
  - Las texturas de modelos y suelos pueden tener otra resolución (por ejemplo 64×64 en vez de 32×32, para más detalle) y se seguirán ajustando a su sitio.
  - Los retratos de `retratos/` deben seguir siendo de 32×32.
- **Imágenes para 2D:** `assetImg('carpeta/nombre')` devuelve la imagen para dibujarla con `drawImage`, como hacen los retratos de los diálogos.
- **Lo que sigue dibujándose por código,** porque cambia mientras juegas:
  - el ranking del Canal X,
  - los lienzos del show de Míster Confianza,
  - los brillos aleatorios del retrato de Lumen (la linterna sí es un PNG),
  - el retrato del HUD, que se compone a partir de la cara de Tovan.
- **`TEX_RND`** (en `js/motor/assets.js`) anota cuántos números aleatorios gastaba cada textura cuando se dibujaba por código. Se siguen gastando para que el decorado salga colocado igual que antes. No hace falta tocarlo. Si renombras una textura que aparezca ahí, cambia también su nombre en esa lista, o el decorado se recolocará (sin romper nada).

## Partidas guardadas

Se guardan en el `localStorage` del navegador:

- `tovan-meta`: progreso, logros, estéticos, santuario y finales.
- `tovan-best`: récord.
- `tovan-audio`: música y efectos activados.
- `tovan-det13`: detalles de las cartas.

Van ligadas a la dirección desde la que se abre el juego. Si un día lo sirves desde un servidor web (`http://…`), las partidas de `file://` no se verán allí.

## Carpeta `backup/`

- **`index-original.html`:** el juego tal como era antes de partirlo, en un solo archivo. Ya no encuentra los mp3, que se han movido; sin ellos suena la música sintetizada.
- **`herramientas-migracion/`:** los scripts de Python con los que se hizo y se verificó la separación.

Puedes borrar `backup/` cuando ya no lo necesites.
