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
assets/texturas/      texturas y retratos en PNG: 10 hojas por tema (jefes.png + jefes.json…) y las grandes de la playa sueltas
assets/audio/         canciones de jefes (mp3); si falta alguna, suena la versión sintetizada
assets/img/           iconos-16px.png (hoja de iconos que usa el juego) e iconos-tovan.png (vista ampliada)
herramientas/         texturas.py, empaqueta los PNG de assets/texturas para el juego; generar-entorno.py, crea la hoja entorno.png
.github/workflows/    texturas.yml, ejecuta texturas.py en GitHub cada vez que se suben PNG
js/
  generado/           texturas.js, creado por herramientas/texturas.py (no se edita a mano)
  motor/              renderer, carga de texturas (assets.js), shader PS1, resolución
  nucleo/             utilidades matemáticas, estado global, referencias al DOM
  audio/              efectos y música sintetizados (WebAudio), banda sonora v3, mp3 de jefes
  entrada/            mando, teclado, ratón y táctil
  jugador/            modelo de Tovan, movimientos, acciones, ataque cargado, inercia, acrobacias
  enemigos/           enemigos base, oni, realistas, capitanes (piezas rompibles); regiones/ = enemigos propios de cada escenario
  jefes/              Ryūjin, Gashadokuro, Tetera de Utah, ERROR 404, Seis Ojos, Míster Confianza, Gato final…
  mundo/              escenarios (biomas), ambiente, playa, ruinas corruptas, castillo, capítulos, mapas grandes (mapas-*.js)
  partida/            oleadas, objetivos de oleada, mejoras, ciclo de partida (empezar / perder / volver al título)
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
| **Un objetivo de oleada** | Una entrada en `OBJ_INFO` y otra en `OBJ_DEF` (`empieza`, `tick`, `linea`, `premio` y, si quieres, `prog` y `alerta`) en `js/partida/objetivos.js`, y su nombre en la bolsa de `objSiguiente`. Ver [Objetivos y capitanes](#objetivos-de-oleada-y-capitanes). |
| **Un capitán o una pieza** | Su entrada en `CAP_DEF` (nombre, vida y piezas con `zone`: `frente`, `espalda` o `aire`), un `makeCapX()` que monte las piezas con `capPieza()` y una IA que mire `capHas(e, 'pieza')` antes de cada ataque. Todo en `js/enemigos/capitanes.js`. |
| **Decorado en un mapa grande** | En `js/mundo/mapas-decorado.js`, dentro de la función de su mapa: el modelo con las piezas de `mapas-piezas.js` (o fundido con `mpFundido`), su colisión con `mpObst(id, x, z, radio, altura, objeto)` y, si tapa la cámara, ese mismo objeto como último argumento. Ver [Mapas grandes](#mapas-grandes). |
| **Una textura** | Dibújala en un hueco de su hoja (`assets/texturas/jefes.png`…), añade su rectángulo al `.json` de la hoja y en el código `texAsset('jefes/<nombre>')`. Ver [Texturas](#texturas). |

Los iconos con emoji se cambian solos por pixel art si el emoji está en la hoja (`js/interfaz/iconos-pixel.js`).

## Objetivos de oleada y capitanes

Inspirados en las misiones de *Hyrule Warriors* y en las piezas rompibles de *Monster Hunter*.

**Objetivos** (`js/partida/objetivos.js`). En la 2.ª y la 4.ª oleada de cada capítulo hay una misión con premio; sale en el panel bajo la oleada y en el rótulo de inicio. Sin objetivos: la oleada 1, las de jefe, el Canal X, el nivel del bug, el castillo y el final.

| Objetivo | Cómo va | Premio | Si falla |
|---|---|---|---|
| 📦 **Protege el paquete** | Unos ladrones van a por él. El que lo coge huye hacia el borde; si lo tumbas, el paquete se queda en el suelo. Siempre es el primer objetivo de la partida. | +12 ✦ y un 15 % de vida | Si un ladrón sale del mapa (en los mapas grandes, del círculo dorado), se pierde |
| 🏯 **Destruye los puestos** | Tres puestos corruptos sueltan un enemigo cada pocos segundos (hasta 6 cada uno). | +4 ✦ y vida por puesto; +6 ✦ al final | — |
| 💰 **Caza al capitán del botín** | Un capitán lleva el botín. Desde el capítulo 2. | Una carta extra y +10 ✦ | A los 50 s huye; si llega al borde (en los mapas grandes, si se aleja 10 m), se escapa |
| ⛩️ **Purifica la zona** | Quédate dentro del círculo sin enemigos dentro. Hasta que se purifica llegan refuerzos y la oleada no se cierra. | ÍMP al máximo y +10 ✦; la luz hiere a los que quedan | A los 70 s se corrompe: sin premio |

En la 3.ª oleada de cada capítulo, desde el 2, se presenta además un capitán a media oleada.

**Capitanes** (`js/enemigos/capitanes.js`). Son enemigos grandes con tres piezas que solo se dañan desde un lado. El panel del capitán muestra cada pieza, cuánto le queda y desde dónde se rompe. Un golpe normal no los interrumpe; romper una pieza los deja aturdidos, la pieza sale volando y les cambia el estilo:

| Capitán | Pieza | Se rompe | Al romperla |
|---|---|---|---|
| **Kanabō** (oni) | Kanabō | de frente | Pierde el mazazo y el barrido: pelea a puñetazos y embestidas, más rápido |
| | Cuernos | desde el aire (golpeando en pleno salto) | Ya no lanza el grito de guerra que llama refuerzos |
| | Calabaza | por la espalda | Ya no bebe para curarse (pegarle mientras bebe también lo corta), pero va ebrio |
| **Muralla** (gólem) | Escudo | de frente | Deja de frenar la mitad del daño frontal y de embestir; ahora lanza cascotes |
| | Núcleo | por la espalda | Ya no salta con onda expansiva: solo pisotea |
| | Ojo de cristal | desde el aire | Se acaba el láser de barrido |

Cada pieza rota da +3 ✦ y una curación; tumbar al capitán, +5 ✦ y dos curaciones.

**Probarlos desde la consola (F12)**, en plena partida:
- Un capitán ya: `spawnCaptain('caponi')` o `spawnCaptain('capgolem')`.
- Un objetivo concreto: `OBJ.n = 1; OBJ.bolsa = ['sello']; startWave(9)` (cambia `'sello'` por `'paquete'`, `'puestos'` o `'capitan'`, y usa una oleada que sea 2.ª o 4.ª de su capítulo: 2, 4, 7, 9, 12…).

## Mapas grandes

En las oleadas normales de las Ruinas, el Santuario y la Cumbre, el mapa pasa de 6,3 m de radio a 18, rodeado de colinas. Las oleadas de jefe vuelven a la plaza central de siempre, cerrada con una barrera naranja (si Tovan estaba lejos, aparece en el centro). Los demás escenarios no cambian.

- **Por dónde llegan:** cada oleada elige 2 frentes (3 desde la oleada 8) y los enemigos aparecen por ellos, a 9–13 m del jugador. El **radar** de la esquina gira con la cámara: marca los frentes con flechas rojas mientras quedan enemigos por salir, y enseña obstáculos, trampolines, zonas, enemigos (capitanes en naranja, puestos en morado, ladrones en rosa), el paquete con su perímetro, el sello y las curaciones.
- **Obstáculos:** pilares, muros, rocas, árboles y edificios tienen colisión. Los bajos (muros derruidos, rocas pequeñas, faroles…) se pueden saltar. Los altos paran los orbes enemigos y sirven de cobertura. Lo alto que tapa a Tovan se oculta. Los enemigos que no ven a Tovan en línea recta lo rodean: siguen un mapa de distancias hasta él en una rejilla de 0,6 m, recalculado cuatro veces por segundo.
- **Movilidad:** cada mapa tiene 3 trampolines (rodeados de piedras en las Ruinas, de bambú en el Santuario, géiseres en la Cumbre) que lanzan a Tovan muy alto con un salto mortal; desde ahí arriba se rompen las piezas «desde el aire» de los capitanes. La Cumbre tiene un lago helado donde se resbala. Desde la 2.ª oleada aparece una curación lejos, para invitar a moverse.
- **Objetivos:** todo se coloca alrededor del jugador: el paquete a 4–8 m, con un perímetro dorado de 8,5 m (el ladrón que lo cruza se lo lleva); los puestos, a 8–12 m en tres direcciones; el sello, a 7–11 m; el capitán, a 10–13 m (si huye, se escapa al alejarse 10 m).

| Mapa | Qué hay |
|---|---|
| **Ruinas del Ocaso** | La plaza con su columna caída; seis barrios de muros en L, cada uno con una columna rota; columnas sueltas, muros bajos, escombros y cristales flotantes; una muralla con tres puertas |
| **Santuario de los Cerezos** | Caminos de losas con faroles de piedra; tres santuarios con su torii; un estanque con carpas; arboledas de cerezos y una valla lacada |
| **Cumbre Nevada** | Un lago helado con cristales; grupos de rocas nevadas; bosquecillos de pinos; la cabaña; tres géiseres |

**El aspecto** busca los últimos juegos de PS1 (sin perder la trama, el enganche de vértices ni el mapeo afín del shader):
- Texturas de 128 px en la hoja `entorno.png` (losas, tierra, hierba, sillares, fustes, cortezas, copas, flores, laca, tejas, nieve, roca, hielo, agujas de pino, grava). Las crea `herramientas/generar-entorno.py` (necesita numpy y Pillow) con ruido, Voronoi y una paleta reducida con trama de Bayer; después hay que empaquetarlas con `texturas.py`, como cualquier hoja. Si retocas `entorno.png` a mano, no vuelvas a ejecutar el generador: la sobrescribe.
- Luz pintada en los vértices: sombra al pie de las cosas, musgo, nieve donde da arriba, halos de los faroles y sombras de copas y pilares en el suelo. Además, una luz de relleno para que nada a contraluz se quede negro.
- Terreno de 124 m que mezcla tres texturas por vértice, con colinas a partir de los 19 m.
- Hierba que se mueve con el viento y pétalos: miles de matas, fundidas en una malla por cada parcela de 13 m.
- Modelos con más detalle: columnas estriadas y rotas, muros derruidos, cerezos con copas y tarjetas de flores, pinos nevados por capas, faroles de piedra, torii con el remate curvo y santuarios con tejado de aleros curvados. Se funden por material para dibujar menos.

**Rendimiento:** cada mapa grande dibuja unos 40–70 mil triángulos en 200–300 llamadas (la plaza de antes, unos 6–8 mil). Con una tarjeta gráfica es poca cosa. Con el dibujo por software de Chrome (cuando no hay aceleración gráfica) va a unos 18–20 fps, frente a los ~32 de la plaza.

**Probarlo desde la consola (F12)**, en plena partida: `applyBiome(1); startWave(7)` (0 = Ruinas, 1 = Santuario, 2 = Cumbre; cualquier oleada que no sea múltiplo de 5).

## Texturas

Todas las texturas y retratos del juego son PNG en `assets/texturas/`. Las pequeñas (pixel art) van juntas en **hojas**, una por tema, para abrirlas en grande y editarlas todas a la vez con cualquier programa (Aseprite, Photoshop, Paint.NET, GIMP…):

| Hoja | Qué lleva |
|---|---|
| `canal-x.png` | marcianitos, suelos del plató, estática y viñetas del Canal X |
| `cinematica.png` | calle, ventanas, caja, paquete, uniforme y cartel de la intro |
| `efectos.png` | círculos mágicos, runas de la linterna, sello y sombra |
| `entorno.png` | texturas de 128 px de los mapas grandes (las crea `herramientas/generar-entorno.py`) |
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
