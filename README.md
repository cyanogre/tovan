# Tovan · Las ruinas sin fin

Roguelike 3D por oleadas con look de PlayStation 1, hecho con [three.js](https://threejs.org/) r128 y HTML/CSS/JS sin herramientas de compilación.

## Cómo jugar / desarrollar

- **Abrir el juego:** doble clic en `index.html`. No hace falta servidor ni instalar nada.
- **Requisito:** conexión a internet la primera vez (three.js y la fuente Pixelify Sans vienen de CDN).
- **Editar código:** cambia el `.js` o `.css` que toque y recarga la página (F5).
- **Editar texturas:** abre su hoja en `assets/texturas/` (`jefes.png`, `enemigos.png`…), píntala y guarda. Al subirla a GitHub se empaqueta sola; para verla en local antes de subirla, ver [Texturas](#texturas).
- **Depurar:** todo el estado del juego es global, así que desde la consola del navegador (F12) puedes inspeccionar o tocar cosas directamente: `player.hp = 999`, `wave`, `enemies`, `meta`, `UPGRADES`…

## Estructura

```
index.html            esqueleto de la página + lista ordenada de <link> y <script>
css/                  estilos, en el orden de la cascada original
assets/texturas/      texturas y retratos en PNG: 9 hojas por tema (jefes.png + jefes.json…) y las grandes de la playa sueltas
assets/audio/         canciones de jefes (mp3); si falta alguna, suena la versión sintetizada
assets/img/           iconos-16px.png (hoja de iconos que usa el juego) e iconos-tovan.png (vista ampliada)
herramientas/         texturas.py, empaqueta los PNG de assets/texturas para el juego
.github/workflows/    texturas.yml, ejecuta texturas.py en GitHub cada vez que se suben PNG
js/
  generado/           texturas.js, creado por herramientas/texturas.py (no se edita a mano)
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
| **Una textura** | Dibújala en un hueco de su hoja (`assets/texturas/jefes.png`…), añade su rectángulo al `.json` de la hoja y en el código `texAsset('jefes/<nombre>')`. Ver [Texturas](#texturas). |

Los iconos con emoji se cambian solos por pixel art si el emoji está en la hoja (`js/interfaz/iconos-pixel.js`).

## Texturas

Todas las texturas y retratos del juego son PNG en `assets/texturas/`. Las pequeñas (pixel art) van juntas en **hojas**, una por tema, para abrirlas en grande y editarlas todas a la vez con cualquier programa (Aseprite, Photoshop, Paint.NET, GIMP…):

| Hoja | Qué lleva |
|---|---|
| `canal-x.png` | marcianitos, suelos del plató, estática y viñetas del Canal X |
| `cinematica.png` | calle, ventanas, caja, paquete, uniforme y cartel de la intro |
| `efectos.png` | círculos mágicos, runas de la linterna, sello y sombra |
| `enemigos.png` | una fila por enemigo: chōchin, kasa-obake, fan, ninja y pingüino, oni azul, oni rojo, ventana emergente |
| `jefes.png` | una fila por jefe: ERROR 404, Gashadokuro, Gato, Guardián, Míster Confianza, Ryūjin, Seis Ojos |
| `jugador.png` | caras, pelo y abrigo de Tovan |
| `mundo.png` | suelos y paredes de los escenarios |
| `objetos.png` | billete, carta y abanico |
| `retratos.png` | retratos de los diálogos (32×32) |

Las 12 de la playa (`mundo/playa/`) siguen sueltas porque son grandes (128–512 px) y realistas.

**Cómo es una hoja:** al lado de cada una hay un `.json` con el mismo nombre que dice dónde está cada textura, con su nombre y su rectángulo: `"jefes/gato-cara": [x, y, ancho, alto]`. Entre textura y textura hay 2 px de fondo verde (`#00B45A`), que no es de ninguna: el juego solo lee lo que hay dentro de cada rectángulo.

- **Editar una textura:** píntala dentro de su rectángulo y guarda la hoja.
- **Cambiarle el tamaño:** cambia su rectángulo en el `.json`; si no cabe, muévela a un hueco libre o amplía la hoja.
- **Añadir una nueva:** dibújala en un hueco libre de la hoja que le toque (amplía el lienzo si hace falta) y añade una línea al `.json` con su nombre y su rectángulo. También vale dejarla como PNG suelto en `assets/texturas/`, sin `.json`: entonces su nombre es su ruta sin `.png` (`mundo/playa/arena.png` es `'mundo/playa/arena'`).
- Si un `.json` tiene un error (un rectángulo que se sale de la hoja o pisa a otro, un nombre repetido, una coma de más), el empaquetado se para y dice qué falla.

El juego no lee los PNG directamente, sino `js/generado/texturas.js`, que los lleva todos dentro. Hace falta porque, al abrir el juego con doble clic, el navegador no deja que WebGL use imágenes sueltas (da un error de seguridad), pero sí las que van dentro de un `.js`. Ese fichero lo crea `herramientas/texturas.py` y no hay que acordarse de ejecutarlo:

- **Al subir a GitHub** (con git, GitHub Desktop o la web), el workflow `.github/workflows/texturas.yml` lo vuelve a crear y lo sube en un commit aparte si ha cambiado. Después, haz *pull* para tenerlo también en tu copia.
- **Para ver en local un cambio antes de subirlo**, deja abierto mientras editas `py -3 herramientas/texturas.py --vigilar`: cada vez que guardes un PNG o un `.json` lo vuelve a empaquetar y solo tienes que recargar el juego (F5). Sin `--vigilar` empaqueta una vez y termina.

En el código, cada textura se pide por su nombre:

- **En un modelo:** `makeMat(0xffffff, { map: texAsset('jefes/gato-cara') })`.
  - Por defecto se ve con píxel nítido y repetida, como todas las del juego.
  - `texAsset(nombre, { suave: true })` la suaviza (para texturas realistas).
  - `{ borde: true }` hace que no se repita.
- **En 2D:** `assetImg(nombre)` devuelve un lienzo con la textura recortada para dibujarlo con `drawImage`, como hacen los retratos de los diálogos. `assetCanvas(nombre, lienzo => …)` da un lienzo nuevo y avisa cuando está pintado (así se pone la estática del Canal X como fondo CSS).
- **Tamaños:**
  - Las texturas de modelos y suelos pueden tener otra resolución (por ejemplo 64×64 en vez de 32×32, para más detalle) y se seguirán ajustando a su sitio.
  - Los retratos deben seguir siendo de 32×32.
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
