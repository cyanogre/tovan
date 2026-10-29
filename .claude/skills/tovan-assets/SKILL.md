---
name: tovan-assets
description: Cómo meter en Tovan texturas hechas con loom y modelos 3D hechos con kiln (las skills loom-textures y kiln-3d-assets de esta carpeta), respetando el estilo PS1, el arranque con file:// y el empaquetado en js/generado. Úsala cuando haya que crear o cambiar una textura o un modelo 3D para el juego.
---

# Texturas y modelos para Tovan (loom y kiln)

Tovan se abre con doble clic (`file://`): el navegador no deja que WebGL use ficheros sueltos, así que
todo lo gráfico acaba dentro de un `.js` de `js/generado/`. Las dos skills de esta carpeta escriben
ficheros (PNG y GLB); estas notas dicen cómo pasan al juego.

Las dos necesitan Node ≥ 22.18 y `npm install` una vez en su carpeta (`.claude/skills/loom-textures`,
`.claude/skills/kiln-3d-assets`). El usuario no tiene Node: esto lo hace Claude en su sesión, y lo
que se sube al repo son los fuentes y lo ya construido.

## Dónde va cada cosa

- Fuentes: `assets/fuentes/texturas/*.tx.js` (loom) y `assets/fuentes/modelos/*.kx.js` (kiln). Su `out/`
  no se sube (está en el `.gitignore`).
- Texturas: el albedo de loom va a `assets/texturas/` como PNG suelto (`assets/texturas/loom/<nombre>.png`,
  y se pide con `texAsset('loom/<nombre>')`) o dentro de una hoja con su línea en el `.json`. Luego
  `py -3 herramientas/texturas.py` (o el workflow `texturas.yml`).
- Modelos: el GLB de kiln va a `assets/modelos/` (un pack = varios modelos, uno por nodo raíz). Luego
  `py -3 herramientas/modelos.py` (o el workflow `modelos.yml`) escribe `js/generado/modelos.js`, y en el
  juego `modeloAsset('<nombre>', { escala, emissive, propios, padre })` devuelve un `THREE.Group`
  (`js/motor/modelos.js`). `modeloExiste(nombre)` dice si está.

## Estilo del juego (lo que hay que pedirle a loom y a kiln)

- **Texturas pequeñas:** `size: 128` (o 64). El shader PS1 (`makeMat`) solo usa el albedo: la normal, la
  rugosidad y el AO de loom no se usan, así que el relieve tiene que leerse en el color (un poco de
  `cavity()` oscureciendo juntas). Paleta apagada y cálida; nada de negro puro.
- **Modelos low-poly de colores planos:** kiln ya los hace así. `makeMat` pinta cada material con su
  color; un material con `emit` sale emisivo. Las texturas de loom dentro de un modelo de kiln y las
  animaciones **no** se empaquetan (`modelos.py` avisa). Para animar, crea `part()` aparte y muévelas en JS.
- **Medidas:** Tovan mide ~1,6 m y la plaza pequeña tiene 6,3 m de radio; los modelos salen con la base en
  y = 0 y +Z al frente, igual que en el juego.
- **Pocos triángulos y pocas mallas:** en SwiftShader (las pruebas) cada material es una llamada de dibujo.
  Junta materiales si puedes; para muchas copias, comparte (sin `propios`).
- Nada de `rnd()` al cargar: si un modelo se coloca al cargar, con su propio `mulberry32`.

## Comprobar

- `py -3 herramientas/modelos.py` imprime cuántos modelos y avisos. `node .claude/skills/kiln-3d-assets/bin/kiln.js build …`
  deja vistas previas en `out/_preview/` que se pueden mirar antes de copiar el GLB.
- En el juego, con la consola: `scene.add(modeloAsset('<nombre>'))` y mirarlo. Después, las sesiones del
  arnés (ver CLAUDE.md, «Verificación»).
