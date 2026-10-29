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
assets/modelos/       modelos 3D en GLB hechos con kiln (ver «Modelos 3D y texturas con loom y kiln»)
assets/fuentes/       los fuentes de loom (texturas/*.tx.js) y kiln (modelos/*.kx.js)
herramientas/         texturas.py, empaqueta los PNG de assets/texturas; modelos.py, empaqueta los GLB de assets/modelos; generar-entorno.py, crea la hoja entorno.png
.github/workflows/    texturas.yml y modelos.yml, vuelven a empaquetar en GitHub cada vez que se suben PNG o GLB
.claude/skills/       loom-textures y kiln-3d-assets (las dos skills, copiadas) y tovan-assets (cómo se usan aquí)
js/
  generado/           texturas.js y modelos.js, creados por herramientas/texturas.py y modelos.py (no se editan a mano)
  motor/              renderer, carga de texturas (assets.js) y de modelos (modelos.js), shader PS1, resolución
  nucleo/             utilidades matemáticas, estado global, referencias al DOM
  audio/              efectos y música sintetizados (WebAudio), banda sonora v3, mp3 de jefes
  entrada/            mando, teclado, ratón y táctil
  jugador/            modelo de Tovan, movimientos, acciones, ataque cargado, inercia, acrobacias
  enemigos/           enemigos base, oni, realistas, capitanes (piezas rompibles); regiones/ = enemigos propios de cada escenario
  jefes/              Ryūjin (y su segunda vida colosal), Gashadokuro, Tetera de Utah, ERROR 404 (y TOVAN.EXE, con su forma «fuera de memoria»), Seis Ojos, Míster Confianza, Gato final…
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
  show/               el show de Míster Confianza (4 programas; los de pixel art se sustituyeron por versiones 3D)
  ajustes/            ajustes de equilibrio (v8, v10) y la dificultad (escudo de jefe, enemigos más duros)
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

**Contraseña** (menú de título → Contraseña, `js/interfaz/contrasena.js`): `marckbyn` desbloquea todo (logros y estéticos, finales, poderes, jefes, sinergias y 9999 ✦). En **Finales**, cada final conseguido tiene «▶ Ver» para repetir su escena.

**Selector de jefes** (contraseña `jefes`, `js/interfaz/selector-jefes.js`): lista de todos los jefes para pelear directamente con el que quieras. Desde entonces sale un botón «⚔ Jefes» en el título.
- **Opciones:** «Con cartas al azar» (las que llevarías al llegar jugando) e «Invencible» (para mirar ataques con calma).
- **Ryūjin:** se puede ir directo a la forma colosal.
- **ERROR 404:** se puede ir directo a TOVAN.EXE o a su tercera forma («fuera de memoria»).
- **Míster Confianza:** se puede empezar por cualquier programa del show o saltar a la fase 2.

**Pantalla completa en móvil:** en pantallas táctiles el juego pasa a pantalla completa al primer toque (`js/interfaz/pantalla-completa.js`; se desactiva en Opciones). En iPhone, Safari no lo permite: usa Compartir → «Añadir a pantalla de inicio» (`manifest.webmanifest`) y se abrirá sin barras.

**Temas de la interfaz** (Opciones → Interfaz). HUD y menús tienen cuatro aspectos; la elección se guarda en el navegador. Por defecto sale Albarán.

| Tema | Idea | Fichero |
|---|---|---|
| **Albarán** | El material de trabajo de Tovan: etiqueta de envío con código de barras, la oleada en un ticket de caja, la misión en un pósit, el capitán como parte de incidencia, sellos de goma y menús en un albarán sobre cartón | `css/tema-albaran.css` |
| **Emaki** | Tinta sumi, papel washi y sellos bermellón: la vida es una pincelada, el ímpetu son cuentas, la oleada un ensō con el número en kanji, cada pieza del capitán un sello y las cartas, ofuda | `css/tema-emaki.css` |
| **Relámpago** | Gráfico y cinético: diagonales, bloques de amarillo, negro y rosa, sombras duras, tipografía enorme y bocadillos de cómic | `css/tema-relampago.css` |
| **Clásica** | Las ventanas azules de siempre | (los CSS de siempre) |

En los tres temas nuevos, en pantallas anchas, la misión y el capitán van en la columna izquierda bajo tu estado, y arriba en el centro solo queda la oleada.
- **Cómo funciona:** `js/interfaz/temas.js` pone `<body data-ui="albaran|emaki|relampago|clasica">`, y cada `css/tema-*.css` solo se aplica con su valor; `css/temas.css` lleva lo común.
- **Lo que preparan para los CSS:** también crean los filtros SVG de tinta, el número de la oleada por separado (en `.uiOla`, también en kanji), el kanji de cada pieza de los capitanes y los colores del radar (`UI_RADAR`).
- **Fuentes:** Archivo, IBM Plex Mono, Permanent Marker, Libre Barcode 128, Big Shoulders Stencil Display, Shippori Mincho B1, Yuji Syuku, Zen Kaku Gothic New, Anton y Rubik. Se cargan en el mismo `<link>` de Google Fonts que Pixelify Sans.
- **Otro tema:** añade un `css/tema-x.css` con `body[data-ui=x]{ … }` y una entrada en `UI_TEMAS`.

Los números de daño y las parodias (Canal X, cuelgue, novela…) conservan su propio estilo en todos los temas.

## La historia de la partida (hoja de ruta)

Al sacar a Lumen de la caja, el sello se partió en **seis trozos** y cada uno acabó dentro de un jefe. La partida es una ruta de reparto: seis paradas, una por capítulo, y la entrega final en la azotea del anticuario. Todo está en `js/historia/hoja-de-ruta.js` (datos en `RUTA`) y `css/hoja-de-ruta.css`.

| Parada | Capítulo | Quién tiene el trozo | Lo que recuerda Lumen al recuperarlo |
|---|---|---|---|
| 1 | Ruinas del Ocaso | el Guardián de piedra | Ese no era el Guardián: era su estatua |
| 2 | Santuario de los Cerezos | Ryūjin | El Guardián la metió en la caja para protegerla |
| 3 | Cumbre Nevada | Gashadokuro | El remitente del paquete era el propio Guardián |
| 4 | Canal X | Míster Confianza (lo usa de trofeo) | La dirección es la tienda del anticuario, donde «no abrió nadie» |
| 5 | Playa del Mundo Real | la Tetera de Utah | Ya recuerda cómo es el Guardián… pero no lo dice |
| 6 | Ruinas corruptas | el ERROR | El sello está completo: rumbo a la azotea |
| Destino | La azotea del anticuario | el destinatario | (la pelea final y los finales de siempre) |

- **Al empezar la partida**, una tarjeta enseña la hoja de ruta con la parada actual (sustituye al rótulo de la 1.ª oleada). La intro termina explicando lo de los seis trozos.
- Los recuerdos crean intriga sin desvelar quién es el Guardián (no se dice hasta la pelea final).
- **En cada capítulo**, Lumen dice qué se busca en la 1.ª oleada (la primera vez, con detalle; después, en corto) y da una pista en la 3.ª (solo la primera vez).
- **Al tumbar al jefe**: «Trozo del sello N de 6» y el recuerdo de Lumen (`STORY.trozo_N`, un diálogo la primera vez; después, un comentario de `TROZO_CORTO`).
- **En el viaje entre capítulos**, la tarjeta del capítulo lleva la ruta con la parada nueva sellada. También sale en la **pausa** y al **caer**.
- El Castillo Infinito (el isekai) cuenta como desvío: no tiene trozo.

## Tutorial

En la primera partida, la 1.ª oleada es un tutorial (`js/partida/tutorial.js`, `css/tutorial.css`): Lumen enseña paso a paso a moverse, girar la cámara, atacar, rodar, saltar, pelear, usar el especial y elegir carta. Mientras se aprenden los movimientos no sale ningún enemigo; en el táctil parpadea el botón que toca pulsar. Se puede saltar, y se repite desde **Opciones → Tutorial** (`localStorage` `tovan-tuto`). Aunque tumbes a todos antes de tiempo, no se salta pasos: mientras quedan cosas por enseñar van saliendo diablillos de práctica, y el ímpetu se queda lleno hasta que sueltas el especial.

## HUD limpio

**Opciones → HUD: Limpio | Completo** (`js/interfaz/hud-limpio.js`, `css/hud-limpio.css`; por defecto, Limpio). Con el limpio, en la partida solo queda lo que hay que mirar:
- Tu estado (retrato, vida e ímpetu), sin nombre, título ni fragmentos; la oleada, el radar, los rótulos y el combo, más pequeños.
- El menú de opciones solo sale en el título, la pausa y el final. Las familias de la build, en la pausa y en las cartas.
- La misión, en una sola línea.
- **El capitán ya no tiene panel**: su nombre, su vida y sus tres piezas (con desde dónde se rompe cada una: ▲ de frente, ▼ por detrás, ⤒ saltando) flotan sobre su cabeza. Si está fuera de cámara, queda una etiqueta pequeña en el borde con una flecha.
- Lumen hace menos chistes (uno cada 40 s como mucho); los avisos de juego y la historia, sí.

Con cualquier HUD, en el móvil en vertical la cámara se abre al jugar (antes se veían unos 3 m de lado a lado). En el móvil, **pellizcar con dos dedos** acerca o aleja la cámara, como la rueda del ratón (`js/entrada/zoom-tactil.js`).

## Cámara automática

**Opciones → Cámara: Automática | Manual** (`js/entrada/camara-auto.js`; por defecto, Automática). Al correr de lado, la cámara se va poniendo poco a poco detrás de Tovan, como en los juegos de ahora; así en el móvil no hace falta arrastrar el dedo todo el rato. Es suave a propósito:
- Si corres hacia la cámara, no se da la vuelta: se le sigue viendo la cara a Tovan.
- Si la mueves tú (ratón, dedo o palanca derecha del mando), se queda quieta un par de segundos.
- No toca los planos semifijos: cinemáticas, Canal X, marcianitos, el show, el Ryūjin colosal, TOVAN.EXE, el Gashadokuro y las técnicas con cámara propia.

**Jefes altos** (`js/entrada/encuadre-jefe.js`, siempre): si la cabeza de un jefe queda tapada por su barra de vida (le pasaba al gato del final con el móvil en horizontal), la cámara se aleja un poco, baja y mira más arriba hasta que se le ve la cara, y vuelve sola cuando ya no hace falta. En horizontal, la barra del jefe además deja sitio al radar de los mapas grandes.

## Ambiente indie

**Opciones → Ambiente: Indie | Clásico** (`js/mundo/ambiente-indie.js`, `css/ambiente-indie.css`; por defecto, Indie). Encima del look de PlayStation 1, sin tocarlo:
- **Haces de luz:** rayos de sol que bajan en la dirección de la luz del escenario, con su color, bandas que se mueven despacio y un charco de luz donde tocan el suelo. Van tramados con el mismo patrón de píxeles que el resto del juego y se apagan cerca de la cámara para no tapar. De noche son más tenues y fríos.
- **Motas de polvo** que flotan y titilan alrededor de Tovan.
- **Tono:** una fuga de luz cálida que entra por el lado del sol y una viñeta teñida con el color de la niebla.

No sale en los sitios con estética propia (Canal X, el show, el Ryūjin colosal, TOVAN.EXE, el mecanismo del Guardián, las salas especiales y la expansión de dominio). Todo va en tres mallas y cuesta muy poco.

## La guitarra eléctrica

El arma «Guitarra eléctrica» del vestidor se toca de verdad (`js/armas/guitarra-rock.js`):
- **Golpes normales:** la guitarra sigue siendo un arma en la mano, como siempre. Cada golpe que acierta suena a un acorde corto de guitarra eléctrica y el remate, a uno grande que se deja sonar.
- **Ataque cargado:** solo aquí la toca. Tovan se cruza la guitarra delante del cuerpo, con la mano izquierda en el mástil y la derecha rasgueando a cada nota, y toca entero un riff famoso o un solo, uno distinto cada vez. Sigue tocando aunque el movimiento acabe; atacar, rodar o caer lo corta. En los solos levanta el mástil y se echa hacia atrás. De la guitarra salen ondas de sonido de colores.
- **Sonido:** guitarra eléctrica sintetizada de verdad: cada nota es una cuerda pulsada que pasa por un ampli (saturación, ecualización de pantalla, eco y reverb).
- **Riffs:** Smoke on the Water, Seven Nation Army, Iron Man, Smells Like Teen Spirit, Back in Black, Crazy Train, el Rey de la Montaña en metal y la entrada de Master of Puppets.
- **Solos:** Sweet Child O' Mine, Thunderstruck, la Tocata de Bach, el Vuelo del moscardón, el Rey de la Montaña rápido y un tapping.
- **Con «Multiclones de sombra»:** en el riff del ataque cargado, los dos clones se unen a la banda. Uno toca la batería (bombo, caja y charles al tempo del riff) y el otro el bajo, con una onda en cada clon a su ritmo.

Los riffs son unas pocas notas transcritas de memoria (las webs de tablaturas están bloqueadas desde el contenedor), así que alguno puede no ser exacto. Si el juego se publica o se vende, mejor cambiar los de canciones con derechos por piezas clásicas, que no tienen.

## Valoración del cliente (premios y castigos)

Cada oleada se puntúa de 1 a 5 estrellas al cerrarse (`js/partida/valoracion.js`, `css/valoracion.css`). Cuenta la vida perdida (más del 8 %, 30 % y 60 % resta una estrella cada umbral), el tiempo frente al tiempo de entrega (10 s + 1,8 s por enemigo; ×1,35 en los mapas grandes; 70 s en las de jefe), el encargo de la oleada (si falla, resta una) y el combo (×25 o más suma una).

| Estrellas | Efecto |
|---|---|
| ★★★★★ | +8 ✦ y una carta más en la oferta (y la peor sube de rareza). Tres seguidas: «Cliente fiel», la siguiente oferta trae una legendaria |
| ★★★★ | +3 ✦ |
| ★★★ | Nada |
| ★★ | Queja: una carta menos |
| ★ | Reclamación: una carta menos, −5 ✦ y la oleada siguiente viene con ganas (+20 % de daño y +15 % de vida) |

No puntúan el tutorial, el Castillo Infinito ni la pelea final. La valoración sale en un sello al cerrar la oleada y encima de las cartas.

## Sin carteles

Mientras se juega no sale texto que no haga falta: ni banners en el centro, ni palabras flotantes («¡Hop!», «¡Crítico!», frases de los enemigos), ni nombres de técnicas o poderes, ni la palabra del combo, ni los contadores y barras de los foil (la barra de la forma, como la de «Moto roja», y la columna de marcadores de la derecha), ni las frases de Lumen que explicaban cada foil la primera vez: los poderes se entienden viéndolos. La oleada, el encargo y la vida del jefe siguen en el HUD, y los avisos que piden algo (agarrarse al dragón, saltar la onda) salen en pequeño. Fuera de la partida (cartas, menús, cinemáticas) todo sigue igual. Está en `js/interfaz/sin-carteles.js` y `css/sin-carteles.css`.

## Poderes FOIL

Una rareza por encima de las legendarias, con carta holográfica (`js/poderes/foil.js`, `css/foil.css`). No salen en el reparto: se ganan **salvando el paquete de la horda** (si ya las tienes todas, te dan una legendaria). Cambian los ataques normales: cada golpe deja un trazo y el remate del combo lanza la técnica. Cada una viene de una serie distinta, tiene su estética y abre una forma de jugar. Los trazos son cintas que miran a la cámara, con un shader distinto para cada técnica:
- **Agua:** tinta china (centro claro, cuerpo de color, vetas de cerdas y borde negro y roto).
- **Mil pájaros:** rayos azules que tiemblan, con ramas y una bola de chispas en la mano.
- **Puño de fuego:** llamas que lamen, un puño de fuego al frente y un sol para la Gran llamarada.

| Poder | Golpes normales | Remate del combo | Jugabilidad |
|---|---|---|---|
| 🌊 **Respiración del agua** (la rara de antes, reconvertida) | Tajos de agua que enfrían | Un dragón de agua de tinta blanco y azul, con la cabeza pintada a pincel, que se enrosca alrededor de Tovan y recorre el campo | **Fluir:** si ruedas con el dragón fuera, cabalgas su corriente hasta la cabeza, intocable y arrollando |
| ⚡ **Mil pájaros** | Arcos de rayos azules que tiemblan | Un relámpago con ramas que cruza hasta 6 enemigos; apareces detrás del último, con la bola de chispas en la mano, y la descarga llega después | **Carga:** quieto 0,8 s, el siguiente llega el doble de lejos y pega un 50 % más |
| 🔥 **Puño de fuego** | Arcos de llamas | Un puño de fuego que sale recto con su cola de llamas | **Ardor:** sube con cada golpe que acierta mientras no te den (+5 % de daño por nivel, máx. 12); al máximo, el remate es «Gran llamarada»: un anillo de llamas y un sol que crece sobre la cabeza y cae, arrasando a 6 m. Si te dan, se apaga |

Para verlas desde la consola (F12): `taken.waterBreath = 1` (o `foilChidori`, `foilHiken`) y ataca; o directamente `aguaDragon(heading)`, `truenoPrimera(heading)`, `fuegoPuno(heading)`, `FOIL.danza = 12; fuegoRueda(heading)`.

Todos los foil pegan un 30 % más que antes (`FOIL_DANO` en `foil.js`): se tiene que notar que son mejores que una legendaria.

### Los foil nuevos

Treinta y tres poderes más, inspirados en animes y videojuegos, cada uno con su estética y sus sonidos. La pantalla foil ofrece **3 al azar** de los que aún no tienes, así que no salen siempre los mismos. Los de transformación o montura son **formas**: solo hay una a la vez. Sus nombres, barras y contadores no se enseñan en partida (ver «Sin carteles»). En el colosal, TOVAN.EXE, el show y el Canal X no hay formas ni invocaciones (sale lo normal), y a los jefes nunca se los mata de un golpe ni se los traga nada.

Hay un fichero por grupo, más el núcleo común `js/poderes/foil-nucleo.js`. «Pelo dorado» se quitó: sobraba, porque ya hay un poder normal parecido. A cambio salieron los cinco de `foil-extra.js`, los cuatro épicos y los cinco de ingenio (abajo). Los que chocan entre sí se fusionan (ver «Fusiones»).

**Anime** (`foil-anime-a.js` y `foil-anime-b.js`):

| Poder | Cómo sale | Qué hace |
|---|---|---|
| 🎈 **Tercera marcha** | Remate | Se sopla el pulgar, el brazo se infla y el puño gigante sale disparado 8 m; luego Tovan va 3 s en miniatura con voz de pito |
| 🦊 **Manto de las nueve colas** | Especial con el ímpetu lleno | 12 s con manto dorado, nueve colas de chakra, zarpazos gigantes y la «Bomba espiral» en el remate |
| 🌙 **Colmillo lunar** | Cada golpe y remate | Tajos negros con filo carmesí; el remate lanza una media luna que lo atraviesa todo. Cada 3.er remate, liberación con abrigo negro |
| 🗿 **Espíritu de pelea** | Siempre | Un espíritu flota tras Tovan: ráfaga de puñetazos «¡ORA ORA!» en el remate, «ゴゴゴ» si te quedas quieto y para un golpe cada 10 s |
| 👊 **Golpe serio** | 12 golpes y remate | Cara de garabato, un toque seco… y la onda que parte el cielo. Mata a todo lo que no es jefe; al jefe le quita un 12 % |
| 🦴 **Titán** | Especial con el ímpetu lleno | Rayo y vapor: 10 s gigante que aplasta al andar; el remate deja un cráter |
| 🎀 **Transformación mágica** | Primer remate de cada oleada | Lazos, corazones y pose: 15 s con varita de corazones teledirigidos y la «Tiara lunar» |
| 🌀 **Taladro espiral** | Remate | Embestida con taladro; cada 4.º remate, «¡GIGATALADRO!» de 20 m desde el cielo |
| 🏍️ **Moto roja** | Rodar dos veces seguidas | 14 s en moto con estelas rojas, caballito y derrape en abanico (descansa 10 s entre viaje y viaje) |

**Videojuegos** (`foil-juegos-a.js` y `foil-juegos-b.js`):

| Poder | Cómo sale | Qué hace |
|---|---|---|
| ⭐ **Estrella invencible** | 50 monedas (cada golpe suelta una) | 9 s invencible en arcoíris, atropellando, con el tema de la estrella de fondo; cada 100 monedas, un hongo que cura |
| 🗡️ **Espada maestra** | Con la vida casi llena | Cada golpe dispara un rayo-espada; el remate es el «Giro huracanado» |
| 🌸 **Inhalar** | Remate | Aspira y se traga hasta 3 enemigos (la boca le sale en la cara); el siguiente ataque escupe una estrella |
| 🟡 **Comecocos** | Píldora cada 10 bajas | 8 s de comecocos sobre una cuadrícula de neón: los enemigos se ponen azules y huyen |
| 💨 **Bola azul** | Rodar | Bola de púas con ataque teledirigido en cadena; los golpes dan anillos y, si te hieren, se caen |
| 🦖 **Dinosaurio verde** | Doble salto | Montura de 15 s: lengua que se traga, huevos que rebotan, revoloteo y culetazo |
| 🐉 **Invocación: Rey dragón** | Especial con el ímpetu lleno | El cielo se oscurece, baja el dragón y suelta el «Megafulgor» sobre todo lo que se ve |
| 🎭 **¡Ataque total!** | Derribar a 3 (críticos y remates) | Viñetas, nube de pelea de dibujos y «¡FIN DEL ESPECTÁCULO!» |
| 😈 **Estilo SSS** | Siempre | Medidor de D a SSS que premia variar; en SSS, 10 s de «Gatillo demoníaco» |
| 🧩 **Lluvia de tetriminós** | Remate | Caen 4 piezas sobre los enemigos; si aciertan todas, «¡TETRIS!» y un láser |

El tema de la estrella sigue el análisis armónico del original (150 por minuto en 2/2): alterna Re m7 y Do maj7, la melodía salta entre la séptima y la fundamental de cada acorde y el bajo va de la fundamental a la quinta.

**Cinco más** (`foil-extra.js`), los más espectaculares:

| Poder | Cómo sale | Qué hace |
|---|---|---|
| 🌌 **Expansión de dominio** | Especial con el ímpetu lleno | Cruzas los dedos y una burbuja se traga el mundo: cielo de estrellas, suelo de cosmos y nada del escenario. Los enemigos se quedan paralizados mientras juntas una esfera azul y otra roja en el «Púrpura», que borra todo lo que encuentra en 26 m y deja una zanja. Luego la burbuja se rompe y vuelve el mundo |
| 💀 **Calaveras cañón** | Cuando te hacen daño (cada 3 s como mucho) | Calaveras de cabra que llegan girando, apuntan a los más cercanos, abren la mandíbula y disparan un rayo blanco; un ojo de Tovan brilla. Cada 4.º remate, seis en abanico que se cruzan delante de ti |
| 🌈 **Bola cósmica** | Al empezar cada oleada | Llueven cachivaches y empujas 16 s una bola pegajosa: lo que es más pequeño que ella se queda pegado y la bola crece; lo grande rebota. Al ganar la oleada (o al acabar), un arcoíris se la lleva y se convierte en estrella |
| 🐴 **Burro de hormigón** | Cada 40 golpes cuerpo a cuerpo | Se abre el cielo con un coro sobre el grupo más grande, cae un burro de piedra gigante, rebota cuatro veces aplastándolo todo y se desmorona |
| 🔆 **Bola Smash** | Cada 20 s aparece una bola arcoíris | Rómpela de tres golpes (se escapa si tardas) y arderás en arcoíris: el siguiente ataque es el golpe final. Subes, caes en picado, una cúpula de luz lanza a todos por los aires y cada uno revienta en el borde de la pantalla con su explosión de color |

**Cuatro épicos** (`foil-epicos.js`):

| Poder | Cómo sale | Qué hace |
|---|---|---|
| 🌺 **Mil cerezos** | Soltar el ataque cargado a tope | El arma se deshace en cientos de cuchillas rosas: salen en surtidor, forman ríos que serpentean entre los enemigos cortándolo todo y se cierran en una esfera sobre el más duro, que revienta |
| 🗝️ **Puerta del tesoro** | Cada 30 de combo | Portales dorados en abanico detrás de Tovan; asoman espadas, lanzas y hachas y salen en ráfaga contra los enemigos |
| ⚫ **Destello negro** | A veces, al acertar un golpe cuerpo a cuerpo | El espacio se dobla: la imagen se invierte, salen rayos negros con borde rojo y el golpe hace 2,5 veces el daño; luego 6 s «en la zona», con más destellos |
| 💥 **¡Estallido!** | Al cuarto golpe que te dan | La emoción se ve en el aura; al llegar al tope todo flota (enemigos y piedras), una columna de luz los lanza por los aires y caen de golpe |

**Cinco de ingenio** (`foil-ingenio.js`), cada uno con una mecánica propia que se entiende viéndola:

| Poder | Cómo sale | Qué hace |
|---|---|---|
| 📼 **Eco del tiempo** | Remate | Un eco tuyo en cian y magenta sale de donde estabas hace 2,5 s y repite exactamente lo que hiciste, con la misma pose y los mismos golpes, donde los diste. Hasta dos a la vez; al acabar se rompe en cristales |
| 🕊️ **Bandada de papel** | Cada baja | El enemigo se pliega en una grulla de papel que vuela a tu alrededor (hasta 16). Cada remate lanza unas cuantas en picado; con doce o más salen todas en un remolino que barre la arena |
| 🎨 **Tinta territorial** | Siempre | Al correr dejas un rastro de tinta. Si lo cierras en un lazo alrededor de los enemigos, se rellena y revienta hacia arriba con todo lo que haya dentro (cuanto más grande, más daño). Cada lazo, de otro color |
| 🧲 **Polaridad** | Golpes cuerpo a cuerpo | Cargan al enemigo, rojo y azul por turnos (un aura de su color). Los de distinto color se atraen, con un arco eléctrico entre ellos, y se estampan; los del mismo se repelen. El remate tira de todos los cargados hacia el golpe |
| 🥁 **A ritmo** | Atacar a tiempo | Un aro se cierra a los pies de Tovan a cada golpe de bombo (120 por minuto). Atacar justo entonces suelta una onda y una nota de la escala; machacar el botón rompe la racha. Ocho seguidas: el drop, y el suelo se llena de barras de ecualizador que lo levantan todo al compás |

### Fusiones

Algunos foil chocan: dos **transformaciones o monturas** (solo cabe una a la vez), dos que salen con el **ataque especial** o dos que se pelean por **rodar** (`js/poderes/foil-fusiones.js`). Los demás conviven sin problema. Si coges uno que choca con otro que ya tienes, **los dos desaparecen y nace un poder nuevo**: una mezcla de los dos *temas*, no de los dos poderes.

- **Cuerpo y alma:** uno de los dos pone el cuerpo (su objeto: la bola de pinchos, la moto, el dragón, el huevo…) y el otro el alma (sus colores, su aura, su estela, su sonido y un adjetivo). El cuerpo sale teñido del color del alma. Así salen cosas como «Moto jurásica», «Dragón supersónico» o «Zorro de nueve colas dracónico».
- **Cómo pega:** se elige al azar, entre las que le van a ese cuerpo, una de seis formas: transformación (aura y cuerpos que orbitan y salen disparados), cometa (te haces el cuerpo gigante y arrollas), invocación (cae del cielo un cuerpo enorme), lluvia, rayo o torbellino. Cambia de una partida a otra.
- **Cuándo sale:** con lo que chocaba. Si chocaban por el ataque especial, con el especial; si por rodar, rodando dos veces; si eran dos formas, sola cada 25 golpes (mientras se carga, unos cuerpos pequeños giran sobre la cabeza de Tovan).
- **Una por partida:** lo que chocaría con la fusión ya no sale en el reparto, y la carta de un foil que chocaría con uno que ya tienes lo avisa.

| Chocan por | Foil |
|---|---|
| Transformación o montura | Nueve colas, Titán, Transformación mágica, Moto roja, Estrella invencible, Comecocos, Dinosaurio, Estilo SSS, Expansión de dominio, Bola cósmica, Bola Smash |
| Ataque especial | Nueve colas, Titán, Rey dragón, Expansión de dominio |
| Rodar | Bola azul, Moto roja |

Para probarlos: contraseña `jefes` → «Poder foil» (uno elegido o al azar), o desde la consola `foilDa('foilGear3')` (los demás ids: `foilKyubi`, `foilGetsuga`, `foilOra`, `foilSaitama`, `foilTitan`, `foilMagica`, `foilTaladro`, `foilMoto`, `foilEstrella`, `foilEspada`, `foilKirby`, `foilPacman`, `foilSonic`, `foilDino`, `foilBahamut`, `foilPersona`, `foilDante`, `foilTetris`, `foilDominio`, `foilCalaveras`, `foilKatamari`, `foilBurro`, `foilSmash`, `foilSakura`, `foilBabilonia`, `foilKokusen`, `foilEstallido`, `foilEco`, `foilGrullas`, `foilTinta`, `foilPolaridad`, `foilRitmo`). Dando dos que chocan (por ejemplo `foilMoto` y `foilDino`), se fusionan solos.

## El show de Míster Confianza (en 3D)

Antes eran minijuegos en un lienzo pixelado de 320×180. Ahora son programas en un plató 3D (`js/show/plato-3d.js`, `css/show-3d.css`), con el Tovan de verdad y sus controles de siempre.
- **El plató:** suelo de escenario con la estrella, pantalla gigante con su cara y un rótulo que corre, focos que barren, gradas con público y neones.
- **Textos nítidos:** las barras, los rótulos y la leyenda de teclas van en HTML.
- **Rondas:** cada programa se lleva un cuarto de su vida.

| Programa | Cómo se juega |
|---|---|
| **1 · ¡Pelea de la Fama!** (`pelea-3d.js`) | Lucha de lado al estilo *Street Fighter*: J combo, K esquiva, Espacio salto, L especial. Cada golpe suyo se avisa con su nombre en grande, un «!» amarillo (golpe) o un «!!» rojo (salta o rueda) sobre la cabeza y una franja roja en el suelo cuando cruza el escenario. Sus golpes: puñetazo, patada estelar, selfie cegador, firma relámpago, trofeo bumerán y la pose de chulito (le duele un 50 % más). Barras grandes, RONDA y K.O. |
| **2 · ¡Humor Confianza!** (`prueba-3d.js`) | Prueba de obstáculos tipo *Humor Amarillo* (sustituye a la carrera). Él mira desde su podio; tú pulsas los botones verdes (J a su lado) para que le caiga un castigo: guantazo, cubo de agua o tarta. Barredor rojo a ras de suelo: salta. Desde media ronda, barredor azul a la altura de la cabeza: rueda. Además tira pelotas gigantes. |
| **3 · ¡Marcianitos!** | El canal 3D de siempre. Arreglado: sus estrellas iban hacia arriba (tenían el signo vertical al revés). |
| **4 · La Fantasía Final** (`fantasia-3d.js`) | Por turnos con los dos modelos frente a frente y ventanas de RPG clásico, nítidas. W/S elige, J confirma, K vuelve; también se toca o se pincha cada opción. Al atacar, pulsa J cuando el aro blanco toque el amarillo; para bloquear, K cuando el aro azul se cierre sobre ti. |

Durante el show no hay escudo de jefe. Al acabar, el plató se recoge y empieza la fase 2 («¡Sin guion!») en el escenario de siempre.

## Canal X

El capítulo 4 imita cómo cambia de estilo *To Be Hero X*: cada tramo se ve como una animación distinta (anime, manga, vectorial, recreativa, marcianitos y papel recortado). Lo nuevo está en `js/canal-x/emision.js` y `css/canal-x-emision.css`:
- **Contornos de tinta limpios.** La segunda pasada (el contorno negro) empuja cada vértice por la normal media de los vértices que comparten su sitio; antes cada cara salía por su lado y en las esquinas de los cubos quedaban astillas negras. Las piezas planas, translúcidas o que no son mallas no se entintan.
- **Cortinilla de cambio de estilo.** Tres bandas en diagonal con los colores del estilo nuevo, su nombre en grande en caracteres chinos (`CX_ESTILO`), el episodio y el título. El estilo cambia por debajo mientras las bandas tapan la pantalla, sin estática ni pantallazo.
- **Índice de confianza** como rótulo de emisión (信任値, con el número rodando y el puesto en el ranking).
- Las franjas de cine dentro del Canal X son de emisión (degradado, línea de color y «EN DIRECTO»), y los conos de luz del plató ya no tapan la vista lateral de la recreativa.

## Tráiler

En el menú de título, **Tráiler** pone un tráiler ridículo y épico de ~80 s hecho con el motor de cinemáticas del juego (`js/cinematicas/trailer.js`, `css/trailer.css`). Tiene:
- Créditos absurdos.
- La calle bajo la lluvia y el portal: «ESTE OTOÑO».
- Acción con las técnicas foil.
- Enemigos colosales… y una tetera.
- El Canal X cambiando de estilo.
- Un romance (Tovan y el paquete, entre cerezos al atardecer).
- Una amistad legendaria ante la puesta de sol en las Ruinas del Ocaso.
- Críticas, el esqueleto colosal y el logo.

El jefe final no sale, para no destripar nada. Se salta con «Saltar» o Esc.

**Grabarlo a vídeo** (necesita Node, Playwright con Chromium y ffmpeg): `node backup/herramientas-migracion/trailer_video.js <proyecto> trailer.mp4 [fps] [ancho] [alto]`. Lo hace en dos pasadas:
1. **Imagen:** el bucle del juego avanza fotograma a fotograma, con un `dt` exacto, y las animaciones CSS se colocan con el mismo reloj.
2. **Sonido:** se graba la salida de WebAudio en tiempo real, sin dibujar.

Al final, ffmpeg junta las dos. Por eso el guion solo mueve cosas con `csTween`/`csWait`, nunca con animaciones CSS.

**Jugabilidad** (botón justo debajo) es otro tráiler, de ~40 s, solo con partida de verdad: casi sin texto y con fundidos a negro entre planos (`js/cinematicas/trailer-juego.js`). Seis planos:
1. Parkur por las ruinas: muro, salto triple, trampolín y picado.
2. Esquiva en cámara lenta del golpe del bruto y contraataque.
3. Corte de nuca.
4. Dragón de agua y su corriente.
5. Mil pájaros.
6. Puño de fuego corriendo alrededor del grupo.

Tovan lo mueve un piloto con el joystick y los botones de siempre, y la cámara es la de juego, colocada por fuera del grupo. Se graba igual, añadiendo el nombre de la función: `node backup/herramientas-migracion/trailer_video.js <proyecto> jugabilidad.mp4 30 1280 720 runTrailerJuego`.

## El Guardián · segunda vida (el mecanismo del Ocaso)

El primer jefe ya no se acaba al dejarlo a cero (`js/jefes/guardian-engranaje.js`). Al estilo de Stallord, de Zelda: Twilight Princess.

**La cinemática:** el Guardián se arrodilla y se da cuerda. La plaza hace tictac y se abre: era la tapa de un reloj gigante. Tovan cae al fondo del foso, sobre la esfera del reloj, mientras se levanta una columna que gira con el Guardián encima. Después, el Guardián echa a volar y le tira una piedra: Tovan la esquiva rodando… y, sin querer, acaba subido al raíl de la pared, que se lo lleva. Así descubre que se puede montar. La pelea empieza con Tovan ya en el raíl (si se salta la escena antes, empieza en el suelo).

**Cómo se juega:**
- **Dos raíles en hélice:** uno pegado a la columna (gira con ella) y otro pegado a la pared del foso.
  - RODAR junto al piñón brillante (o caer encima del raíl) te monta, y lo recorres girando como una peonza, deprisa.
  - SALTAR, montado, te lanza en un arco rápido hasta el otro raíl, de la columna a la pared o al revés. Si vuelves a SALTAR mientras vuelas (pasado el primer tercio del arco), al tocar el raíl rebotas en seguida hacia el otro: se puede ir y venir del centro a la pared sin parar, como en Zelda, para esquivar. Al final de un raíl saltas solo.
  - RODAR otra vez te baja.
- **Derribarlo:** el Guardián vuela entre la columna y la pared, a tu altura. En el salto entre paredes hay que **ATACAR** cuando pasa cerca: el tajo dorado dura un instante y, si lo pilla, lo derriba. Tocarlo sin atacar no hace nada, y si fallas tardas un poco en poder volver a atacar. Cuando lo tienes a tiro, su núcleo chispea.
- **Rematarlo:** derribado, cae a la esfera de rodillas, con el núcleo al aire y el reloj parado. Hay que bajar y coserlo a golpes antes de que se levante. Al levantarse suelta una onda que hay que saltar.
- **Tres derribos** se llevan su vida. Si se levanta antes de que le quites su trozo, toca derribarlo otra vez.

**Sus ataques:**
- Piedras de su halo, lanzadas adonde vas a estar en el raíl.
- La mirada: un barrido a tu altura.
- Embestidas, con una línea roja de aviso.
- La campana: ondas que se saltan.
- La llamarada: incendia el tramo del raíl por el que vas; hay que saltar al otro.
- Si te quedas en el suelo, cae en picado sobre ti.

Ataca más a menudo según avanza la pelea y, mientras vas en el raíl, vuela cerca de ti. Las invocaciones (ranas, aliados, bots…) y lo que se recoge se quedan en la esfera del reloj, no flotando a la altura del raíl.

**En el suelo:** las agujas del reloj barren la esfera (hay que saltarlas), y dos chorros de vapor junto a la pared te lanzan hasta su raíl.

**El final:** al último derribo el reloj se para, todo se desmorona y Tovan vuelve a la plaza. Ahí sigue el flujo de siempre: «¡Guardián derrotado!», el trozo de la hoja de ruta y las cartas.

Para ir directo: contraseña `jefes` → Guardián de las Ruinas → «Directo al mecanismo».

## Ryūjin colosal (la segunda vida del dragón)

**Camión-kun** (el poder) no va a por Tovan mientras haya un jefe en pie: sigue atropellando enemigos (y al jefe le quita un 8 %), pero no te manda al isekai en plena pelea.

Al dejar a Ryūjin (oleada 10) a cero, no muere: brilla, toca la bocina como Camión-kun, atropella a Tovan y crece hasta el «tamaño mudanza». La pelea sigue en el cielo, a lomos del dragón, al estilo *Shadow of the Colossus* (`js/jefes/ryujin-colosal.js`, `css/ryujin-colosal.css`). Sale siempre que el dragón cae en una partida normal; no sale en el Canal X, en el castillo ni en los marcianitos.
- **El lomo** es una pasarela de escudos dorados entre dos filas de púas. El dragón ondula de lado y arrastra a Tovan. Abajo hay un mar de nubes, montañas y campos; alrededor, nubes, líneas de velocidad y viento (también se oye).
- **Tres sellos de jade** (las escamas que brillan, con una columna de luz) que hay que romper a golpes.
- **Agarrarse:** cuando sale «¡AGÁRRATE!» hay que mantener RODAR (K o Shift; en el móvil el botón pasa a «Agarra» y parpadea). Un aro de aguante se vacía mientras te agarras, así que conviene agarrarse cuando empieza la maniobra y no durante el aviso: en el tirabuzón, si te agarras desde el aviso, se te escurren las manos antes de acabar.
- **Te tira con facilidad:** si en plena maniobra no estás agarrado (te sueltas, saltas o se te acaba el aguante), el aviso tiembla en rojo, Tovan se tambalea y en menos de medio segundo sale despedido **por un costado**. Pasa en todas las maniobras:
  - **Sacudidas.**
  - **Sacudida violenta:** además acaba en una coz.
  - **Ráfagas.**
  - **Subida en vertical.**
  - **Tirabuzón:** se pone boca abajo un rato.
  - Lo que se inclina es el mundo, así que se ve el horizonte girar o ponerse del revés.
- **Si te caes:** sales volando de lado y caes por el cielo. Puedes moverte en el aire y darte un impulso con RODAR (una vez por caída). A lo largo de la caída vuelan tres crías: si pasas junto a una, te montas. Montado, la llevas hasta el lomo, sube sola, y SALTAR te suelta y te deja caer encima. Si no pillas ninguna, te estrellas y mueres (salvo que un poder como el Fénix te devuelva la vida, que te deja en el lomo).
- **No quiere que subas:** cuando la cría se acerca, el dragón se aparta de golpe, hasta tres veces por caída. Se mueve todo el cuerpo, como una ola que sale de donde está la cría y tarda en llegar a la cabeza y a la cola, así se nota lo largo que es. Montado, la cámara se aleja y se gira poco a poco hacia él, en tres cuartos, para verlo entero. La cría es más rápida: persíguelo y salta cuando estés encima. Al volver al lomo, la cámara vuelve a como estaba.
- **Fuego:** para escupirte se da la vuelta: estira el cuello, lo curva en gancho hacia un lado y la cabeza vuelve mirando a Tovan, por delante de él (se ve también en el móvil).
  - **Lluvia de fuego:** gira el cuello y escupe meteoros con estela de llamas a círculos rojos. Al caer levantan una columna de fuego y dejan quemaduras en el lomo.
  - **Aliento de fuego:** barre una franja del lomo de lado a lado con un chorro de llamas, dejándolo ardiendo. Hay que salir de la franja roja.
  - **Púas:** salen del lomo como brasas en franjas rojas; se saltan o se esquivan.
- **El picado:** con los tres sellos rotos se lanza hacia abajo, el cuello se allana y aparece la perla entre los cuernos. Hay viento de cara y ráfagas (también para agarrarse).
- **Remate:** «¡ENTREGADO!», el dragón se deshace en jade, Tovan cae al santuario y sigue lo de siempre: «¡Ryūjin derrotado!», el diálogo, el trozo de la hoja de ruta y las cartas.

La barra de jefe enseña los sellos que quedan y la perla. Si mueres arriba, reintentar o volver al título deja el santuario como estaba.

Al subir al cielo (y al volver) se limpian, tras el fogonazo, todos los efectos de los poderes que hubiera en pantalla: agujeros negros, técnicas foil y otaku, aliados y bichos, cráteres, peligros de los jefes, proyectiles, partículas, rayos y números de daño. Antes se quedaban flotando entre las nubes, igual que el aro dorado que marca la plaza en las oleadas de jefe. Lo hace `limpiaEfectos()` (`js/combate/limpieza-colosos.js`), que se usa también con TOVAN.EXE y al entrar en el plató del show; los orbitales, las cartas y la vida no se tocan.

## TOVAN.EXE (la segunda vida del ERROR 404)

Al dejar al ERROR 404 (oleada 30) a cero, el cubo se queda colgado, se pliega en píxeles y se copia del modelo de Tovan: una **versión corrupta** de él, con la textura perdida y los ojos encendidos. Luego crece a saltos hasta unos 13 m y se lleva la pelea **fuera del mapa**: una plataforma de depuración con su rejilla, flotando en el vacío entre trozos de escenario sueltos (`js/jefes/tovan-error.js`, `css/tovan-error.css`). Como el colosal, va al estilo *Shadow of the Colossus*:
- **Desde el suelo no se le hace nada.** Hay que acercarse por detrás a un talón y agarrarse con RODAR (K o Shift; en el móvil, «Agarra»). También vale saltar contra su pierna.
- **Trepar:** W/S (o el joystick) sube y baja por la pierna, la espalda y la cabeza. SALTAR te suelta. Un aro de aguante se gasta al trepar y, sobre todo, al agarrarse; se recupera en el suelo (y un poco de pie en su cabeza). Si se vacía, te caes.
- **Tres puntos débiles** con un sello «404»: el **cinturón**, la **nuca** y la **coronilla**. Se apuñalan con ATACAR: al pulsar se alza el bastón y se clava al soltar; cuanto más lo mantienes, más fuerte. Con el ímpetu lleno, ESPECIAL da una estocada enorme. Romper el cinturón lo deja de rodillas un rato.
- **Sacudidas:** si te nota encima, ruge (¡SACUDIDA!) y se sacude. Hay que mantener RODAR; si no, te tira (y desde arriba la caída duele). Apuñalarle mucho las adelanta, y con dos puntos rotos son más largas.
- **Sus técnicas**, versiones gigantes de los poderes de Tovan, con su nombre en grande:
  - **Pisotón:** si estás a sus pies, levanta una pierna y pisa el círculo. Luego deja la pierna plantada: buen momento para agarrarse.
  - **¡Aterrizaje de superhéroe!:** salta, cae sobre el círculo y suelta una onda expansiva que hay que saltar. Se queda de rodillas un rato: la mejor ocasión para trepar (es lo primero que hace).
  - **¡Gomu Gomu no… Giga Gatling!:** una ráfaga de puñetazos de goma sobre círculos alrededor de ti.
  - **¡Puño de fuego… Giga!:** un puño de llamas que cruza toda la plataforma por la franja roja.
  - **¡Mil pájaros… Giga!** (desde el primer punto roto): carga el rayo en la mano y hace caer relámpagos que te persiguen.
  - **¡Agujero negro… Giga!** (desde el segundo): un agujero negro a tu lado que te arrastra; hay que correr en contra y al final explota.
- **Al romper los tres puntos:** «¡CTRL + ALT + SUPR!» y sale la ventana «TOVAN.EXE ha dejado de funcionar»… pero no se deja cerrar: «está usando el 100 % de la memoria». Crece todavía más y empieza la tercera forma.

### Fuera de memoria (la tercera forma)

`js/jefes/tovan-error-max.js`. TOVAN.EXE mide ya unos 150 m y la pelea sigue **sobre su hombro derecho**, en mitad de una tormenta: por debajo de sus hombros solo hay nubarrones, con relámpagos entre las nubes y viento. Su cara, enorme y con los ojos rojos, está inclinada sobre el hombro mirándote.
- **Tres procesos** clavados en el hombro (`memoria.exe`, `copia.exe` y `rabia.exe`): se rompen a golpes, con cualquier ataque o poder.
- **Sus ataques:**
  - **¡Manotazo!:** su otra mano barre el hombro de lado a lado. No se puede saltar: hay que rodar justo cuando pasa.
  - **¡Aplastón!:** la mano cae desde el cielo sobre el círculo, suelta una onda y se queda apoyada un momento.
  - **¡Mirada láser!:** los dos ojos disparan un láser que recorre la línea roja.
  - **¡Tormenta!:** rayos que te persiguen.
  - **¡Lluvia de ventanas!** (desde el primer proceso cerrado): caen ventanas de error sobre círculos.
- **El ojo:** con los tres procesos cerrados, baja la cara hasta el hombro para mirarte de cerca. Hay que pegarle en el ojo (el aro del suelo marca dónde) mientras sigue atacando.
- **Final:** «¡FORZAR CIERRE!», la ventana se cierra esta vez, se deshace de arriba abajo por encima de las nubes, el hombro se rompe y Tovan cae entre los nubarrones hasta el mapa. Después, lo de siempre: «¡ERROR 404 derrotado!», los procesos cerrados, las dos cartas extra, el logro y el diálogo.

La barra de jefe enseña los puntos débiles rotos, luego los procesos y, al final, el ojo. Si mueres, reintentar o volver al título lo deja todo como estaba.

Las indicaciones de la escalada (la pista de controles y el aviso de «¡SACUDIDA!») son pequeñas para no tapar la pelea. En el móvil en horizontal van a la izquierda, bajo el HUD; en vertical, bajo la barra del jefe.

## Dificultad

En `js/ajustes/dificultad.js` y `css/dificultad.css`. Cuesta sobre todo al principio: lo que la compensa son las mejoras del santuario.
- **Enemigos más duros:** pegan un 30 % más y piensan un 10 % más rápido. Los jefes van un 22 % más rápido (amagos más cortos y menos tiempo para esquivar) y tienen un 60 % más de vida (`DIF.vidaJefe`). No hay más enemigos por oleada.
- **Escudo de jefe** (como en *The Binding of Isaac*):
  - Cada jefe sale con un escudo azul (una burbuja hexagonal, salvo Ryūjin, Gashadokuro y el jefe final, que solo echan chispas) que se come el 75 % del daño.
  - Al romperlo, el jefe se queda aturdido un momento y durante 5 s le dueles un 35 % más.
  - A los 6 s se recarga. La barra va bajo la vida del jefe.
- **Ladrones de la horda:** más vida (80 en vez de 30), para que al principio cueste salvar el paquete.
- **Brazos de goma:** con tantas cartas nuevas casi no salía; ahora pesa como una común y suele salir en los dos primeros repartos. La «¡Pistola de goma!» del remate la lanza el propio brazo izquierdo de Tovan, que se estira hasta el enemigo (antes salía un tercer brazo).
- **Poderes que se notan:** los que no son de daño subieron para que se sientan:
  - Pies ligeros: +50 % de velocidad y +25 % cada copia; con tres, el doble de rápido.
  - Piel de hierro: −18 % de daño por copia.
  - Envío exprés y Parkour: +15 % de velocidad.
  - Café: +15 % de velocidad de ataque.
  - Siesta: 2 % de vida por segundo a los 1,5 s.
  - Tiritas: 2 PV cada 3 s, con el número a la vista.
  - Adrenalina: −40 % de daño y +40 % de velocidad.
  - Chaleco: −12 % de daño y aturde 1 s.
  - Turbo: +50 %.
  - Vértigo: +20 % de salto.
  - Sed de sangre: 2 PV por baja.
- **Corte de nuca** (`js/poderes/corte-nuca.js`): ya no es una voltereta más larga. Es el equipo de maniobras de *Ataque a los Titanes*:
  - Al rodar con un enemigo a tiro (hacia donde apuntas, si apuntas), le clavas los dos ganchos y sales propulsado girando por el aire con dos hojas.
  - Al pasarle por la nuca le haces un tajo en X, con sangre, vapor y parón.
  - Recarga en 5 s; mientras tanto, y si no hay nadie a tiro, ruedas normal.
- **Invasión rana:** las ranitas son ahora del pelotón Keroro: gorro amarillo con orejeras y estrella roja, cara blanca, estrella en la barriga y «¡Gero gero!».
- **Cartas:** en el tema Relámpago el rótulo de rareza («✦ Especial de rama», el nombre de un arma…) ya no se corta: si no cabe, la letra se encoge (`rarAjusta` en `temas.js`).

## Objetivos de oleada y capitanes

Inspirados en las misiones de *Hyrule Warriors* y en las piezas rompibles de *Monster Hunter*.

**Objetivos** (`js/partida/objetivos.js`; la horda y los puestos que se defienden, en `js/partida/objetivos-hordas.js`). En la 2.ª y la 4.ª oleada de cada capítulo hay una misión con premio; sale en el panel bajo la oleada y en el rótulo de inicio. Sin objetivos: la oleada 1, las de jefe, el Canal X, el nivel del bug, el castillo y el final.

| Objetivo | Cómo va | Premio | Si falla |
|---|---|---|---|
| 📦 **Protege el paquete** | Llega una **horda** de ladrones (14 + 1,2 por oleada, hasta 36) en tres asaltos, y la oleada no se cierra hasta el último. El que coge el paquete huye hacia el borde; si lo tumbas, el paquete se queda en el suelo. Siempre es el primer objetivo de la partida. | Si ninguno se lo lleva: **una carta FOIL**, +20 ✦ y un 15 % de vida | Si un ladrón sale del mapa (en los mapas grandes, del círculo dorado): reclamación, −10 ✦, y se acaban los asaltos |
| 🏯 **Destruye los puestos** | Son anclas de la corrupción: **mientras quede uno en pie, la oleada no se acaba** y siguen saliendo bichos. Cada puesto invoca defensores atados a él con un hilo morado; mientras viva alguno, el puesto tiene escudo (recibe un 30 % del daño). Si te acercas o le pegas, llama a más. Al romperlo, sus defensores caen con él. | +4 ✦ y vida por puesto; +6 ✦ al final | — |
| 💰 **Caza al capitán del botín** | Un capitán lleva el botín. Desde el capítulo 2. | Una carta extra y +10 ✦ | A los 50 s huye; si llega al borde (en los mapas grandes, si se aleja 10 m), se escapa |

En la 3.ª oleada de cada capítulo, desde el 2, se presenta además un capitán a media oleada.

**Capitanes** (`js/enemigos/capitanes.js`). Son enemigos grandes con tres piezas que solo se dañan desde un lado. Con el HUD limpio, la etiqueta que flota sobre el capitán muestra cada pieza, cuánto le queda y desde dónde se rompe (con el completo, el panel de siempre). Un golpe normal no los interrumpe; romper una pieza los deja aturdidos, la pieza sale volando y les cambia el estilo:

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
- Un objetivo concreto: `OBJ.n = 1; OBJ.bolsa = ['puestos']; startWave(9)` (cambia `'puestos'` por `'paquete'` o `'capitan'`, y usa una oleada que sea 2.ª o 4.ª de su capítulo: 2, 4, 7, 9, 12…).

## Mapas grandes

En las oleadas normales de las Ruinas, el Santuario y la Cumbre, el mapa pasa de 6,3 m de radio a 18, rodeado de colinas. Las oleadas de jefe vuelven a la plaza central de siempre, cerrada con una barrera naranja (si Tovan estaba lejos, aparece en el centro). Los demás escenarios no cambian.

- **Por dónde llegan:** cada oleada elige 2 frentes (3 desde la oleada 8) y los enemigos aparecen por ellos, a 9–13 m del jugador. El **radar** de la esquina gira con la cámara: marca los frentes con flechas rojas mientras quedan enemigos por salir, y enseña obstáculos, trampolines, zonas, enemigos (capitanes en naranja, puestos en morado, ladrones en rosa), el paquete con su perímetro y las curaciones.
- **Obstáculos:** pilares, muros, rocas, árboles y edificios tienen colisión. Los bajos (muros derruidos, rocas pequeñas, faroles…) se pueden saltar. Los altos paran los orbes enemigos y sirven de cobertura. Lo alto que tapa a Tovan se desvanece poco a poco (y vuelve igual al apartarse), sin desaparecer de golpe; lo mismo pasa con el cuerpo del Ryūjin colosal cuando la cámara se acerca y con la columna de luz de sus sellos (`js/mundo/fundido-oclusion.js`). Los enemigos que no ven a Tovan en línea recta lo rodean: siguen un mapa de distancias hasta él en una rejilla de 0,6 m, recalculado cuatro veces por segundo.
- **Movilidad:** cada mapa tiene 3 trampolines (rodeados de piedras en las Ruinas, de bambú en el Santuario, géiseres en la Cumbre) que lanzan a Tovan muy alto con un salto mortal; desde ahí arriba se rompen las piezas «desde el aire» de los capitanes. La Cumbre tiene un lago helado donde se resbala. Desde la 2.ª oleada aparece una curación lejos, para invitar a moverse.
- **Objetivos:** todo se coloca alrededor del jugador: el paquete a 4–8 m, con un perímetro dorado de 8,5 m (el ladrón que lo cruza se lo lleva); los puestos, a 8–12 m en tres direcciones; el capitán, a 10–13 m (si huye, se escapa al alejarse 10 m).

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

## Modelos 3D y texturas con loom y kiln

Dos skills de Claude (en `.claude/skills/`, copiadas de [loom](https://github.com/uilianks/loom) y [kiln](https://github.com/uilianks/kiln), con su licencia MIT) para hacer recursos nuevos, y `.claude/skills/tovan-assets/SKILL.md`, que explica cómo encajan aquí:
- **loom** hace texturas sin costuras con un pequeño programa en JavaScript (`assets/fuentes/texturas/*.tx.js`). Del resultado solo se usa el color (el shader del juego no usa mapas de normales ni de rugosidad), a 128 px, y entra como cualquier otra textura (ver arriba).
- **kiln** hace modelos low-poly (`assets/fuentes/modelos/*.kx.js`) y los exporta en GLB a `assets/modelos/`. `herramientas/modelos.py` los empaqueta en `js/generado/modelos.js` (mismo motivo que las texturas: con doble clic el navegador no deja leer ficheros sueltos) y el workflow `.github/workflows/modelos.yml` lo hace solo al subirlos. En el juego, `modeloAsset('nombre', { escala, emissive, propios, padre })` devuelve el modelo pintado con el shader PS1 (un modelo por nodo raíz del GLB, una malla por material).

Las dos necesitan Node; el que juega no lo necesita para nada, porque al repositorio se sube ya empaquetado.

## Partidas guardadas

Se guardan en el `localStorage` del navegador:

- `tovan-meta`: progreso, logros, estéticos, santuario y finales.
- `tovan-best`: récord.
- `tovan-audio`: música y efectos activados.
- `tovan-det13`: detalles de las cartas.
- `tovan-ui`: tema de la interfaz.
- `tovan-fs`: pantalla completa en móvil (Opciones → Pantalla completa).
- `tovan-hud`: HUD limpio o completo (Opciones → HUD).
- `tovan-cam`: cámara automática o manual (Opciones → Cámara).
- `tovan-luz`: ambiente indie o clásico (Opciones → Ambiente).
- `tovan-tuto`: si ya se hizo el tutorial (`1`) o se ha pedido repetirlo (`0`).

Van ligadas a la dirección desde la que se abre el juego. Si un día lo sirves desde un servidor web (`http://…`), las partidas de `file://` no se verán allí.

## Carpeta `backup/`

- **`index-original.html`:** el juego tal como era antes de partirlo, en un solo archivo. Ya no encuentra los mp3, que se han movido; sin ellos suena la música sintetizada.
- **`herramientas-migracion/`:** los scripts de Python con los que se hizo y se verificó la separación.

Puedes borrar `backup/` cuando ya no lo necesites.
