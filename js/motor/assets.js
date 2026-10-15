'use strict';
/* ---------- Texturas en archivos: assets/texturas/*.png ----------
   Las imágenes se editan en assets/texturas y herramientas/texturas.py las empaqueta en js/generado/texturas.js
   (GitHub lo hace solo al subirlas): con el juego abierto desde un archivo (doble clic), el navegador no deja
   que WebGL use imágenes sueltas, pero sí las que van dentro de un .js.
   El nombre de cada textura es su ruta sin «.png»: assets/texturas/jefes/gato-cara.png -> 'jefes/gato-cara'. */
const TEX_IMG = {};
for (const nombre in TEXTURAS){
  const img = new Image(); img.src = TEXTURAS[nombre][2];
  TEX_IMG[nombre] = { img, lista: img.decode().catch(() => console.error('No se pudo leer la textura ' + nombre)) };
}
// Cuántos números de rnd() gastaba cada textura cuando se dibujaba por código. Se siguen gastando para que
// todo lo aleatorio que viene después (colocación del decorado, consejos del título…) salga igual que antes.
const TEX_RND = {
  'canal-x/plato-suelo': 240, 'canal-x/suelo-papel': 492, 'cinematica/acera': 274, 'cinematica/asfalto': 687, 'cinematica/caja': 78,
  'cinematica/uniforme': 90, 'cinematica/ventanas-a': 202, 'cinematica/ventanas-b': 204, 'cinematica/ventanas-c': 197, 'enemigos/oni/azul-abierto': 60,
  'enemigos/oni/azul-derecha': 60, 'enemigos/oni/azul-enfadado': 60, 'enemigos/oni/azul-entornado': 60, 'enemigos/oni/azul-izquierda': 60,
  'enemigos/oni/azul-parpadeo': 60, 'enemigos/oni/cara-azul': 60, 'enemigos/oni/cara-roja': 60, 'enemigos/oni/rojo-abierto': 60,
  'enemigos/oni/rojo-derecha': 60, 'enemigos/oni/rojo-enfadado': 60, 'enemigos/oni/rojo-entornado': 60, 'enemigos/oni/rojo-izquierda': 60,
  'enemigos/oni/rojo-parpadeo': 60, 'jefes/gashadokuro-craneo': 88, 'jefes/gashadokuro-hueso': 62, 'jefes/gato-brazo': 7, 'jefes/gato-pecho': 167,
  'jefes/gato-pelaje': 120, 'jefes/guardian-cara': 40, 'jefes/guardian-cara-apagada': 40, 'jefes/guardian-cara-enfadada': 40,
  'jefes/guardian-piedra': 156, 'jefes/seis-ojos-piel': 24, 'jugador/tovan-abrigo': 120, 'jugador/tovan-cabeza-lado': 16, 'jugador/tovan-pelo': 48,
  'jugador/tovan-pelo-dorado': 48, 'mundo/anticuario-suelo': 16, 'mundo/azotea-tejado': 790, 'mundo/castillo-tatami': 180, 'mundo/cumbre-suelo': 531,
  'mundo/hierba': 16, 'mundo/ruinas-ladrillo': 346, 'mundo/ruinas-suelo': 481, 'mundo/santuario-suelo': 337
};
const TEX_PINTADAS = [];
function texDatos(nombre){
  const d = TEXTURAS[nombre];
  if (!d) throw new Error(`Falta la textura «${nombre}». ¿Está en assets/texturas y se ha empaquetado (py -3 herramientas/texturas.py)?`);
  return d;
}
// Imagen tal cual, para dibujarla en 2D con drawImage (retratos, show…). Ya está cargada cuando empieza la partida.
const assetImg = nombre => (texDatos(nombre), TEX_IMG[nombre].img);
// Lienzo con la imagen pintada (si aún no se ha leído, se pinta en cuanto esté y se llama a alPintar).
function assetCanvas(nombre, alPintar){
  const [w, h] = texDatos(nombre), { img, lista } = TEX_IMG[nombre];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const pintar = () => { const g = c.getContext('2d'); if (g && img.naturalWidth) g.drawImage(img, 0, 0); if (alPintar) alPintar(); };
  if (img.complete && img.naturalWidth) pintar(); else TEX_PINTADAS.push(lista.then(pintar));
  return c;
}
// Textura de un PNG, con los mismos ajustes que las que antes dibujaba canvasTex: píxel nítido y repetida. Opciones:
//   suave: true -> filtro lineal con mipmaps (texturas realistas)      borde: true -> no se repite (ClampToEdge)
function texAsset(nombre, o = {}){
  let t = null;
  const c = assetCanvas(nombre, () => { if (t) t.needsUpdate = true; });
  t = new THREE.CanvasTexture(c);
  if (!o.suave){ t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  if (!o.borde) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  for (let n = TEX_RND[nombre] || 0; n > 0; n--) rnd();
  return t;
}
// Se cumple cuando están pintadas todas las texturas pedidas hasta ahora (main.js la espera antes del primer fotograma).
const texturasListas = () => Promise.all(TEX_PINTADAS);
