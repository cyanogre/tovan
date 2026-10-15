'use strict';
/* ======================================================================
   EXPANSIÓN: isekai, flujo del castillo, historia y extras
   ====================================================================== */
Object.assign(STORY, {
  biome_3: [['tovan', '¿Lumen? ¿Esto es… una playa? ¿Una playa DE VERDAD?'], ['lumen', 'Es el mundo real. El de la gente que te juega.'],
    ['tovan', '¡Se ve la arena grano a grano! ¡Y en el fondo del agua bailan unas lucecitas!', 'happy'], ['lumen', 'Cáusticas. La luz del sol atravesando las olas.'],
    ['tovan', '¿Y por qué yo sigo siendo cuadrado?'], ['lumen', 'No entraste en el parche. Presupuesto.'],
    ['tovan', 'Pues aquí no me pienso quitar la camiseta.']],
  biome_4: [['tovan', 'Lumen… ¿por qué el suelo es rosa y negro?'], ['lumen', 'Faltan las texturas. El mundo se está corrompiendo.'],
    ['tovan', '¿Y eso es grave?'], ['lumen', 'Tu cara sigue en su sitio, así que todavía no.']],
  boss_skeleton: [['tovan', '¿Esa montaña… se está moviendo?'], ['lumen', 'Es Gashadokuro: un esqueleto hecho con los huesos de los que se perdieron en la nieve.'],
    ['tovan', '¿Y cómo se pelea contra una montaña de huesos?'], ['lumen', 'Pégale en las manos cuando las apoye. Salta cuando barra el suelo. Y cuando agache la cabeza… aprovecha.']],
  win_skeleton: [['tovan', 'Uf. Ahora sí que necesito un vaso de leche.'], ['lumen', '…Por el calcio. Muy gracioso.']],
  boss_teapot: [['tovan', '¿Eso es… una tetera gigante?'], ['lumen', 'La Tetera de Utah. Lleva desde 1975 siendo el objeto más renderizado del mundo, y ha venido a la playa a lucirse.'],
    ['tovan', '¿Se puede atacar a una tetera?'], ['lumen', 'Con cuidado: está hirviendo.']],
  win_teapot: [['tovan', '¡Te he servido!'], ['lumen', '…Voy a fingir que no has dicho eso.']],
  boss_error: [['lumen', 'Ahí está la causa de todo: un ERROR. Uno muy grande.'], ['tovan', '¿Probamos a apagarlo y volver a encenderlo?'], ['lumen', 'Pégale. Es lo mismo, pero más satisfactorio.']],
  win_error: [['tovan', '¡Error solucionado!'], ['lumen', 'Se ha cerrado inesperadamente. Como tú cuando te pregunto por el paquete.']],
  boss_sixeyes: [['tovan', '¿Por qué tiene seis ojos?'], ['lumen', 'Para verte venir desde seis sitios a la vez. Cuidado con sus lunas.'], ['tovan', '¿Sus qué?']],
  win_sixeyes: [['lumen', 'El castillo tiembla… ¡nos está expulsando!'], ['tovan', '¡Espera, que aún no he hecho fotos!']],
  isekai1: [['lumen', '¿Estás bien? Te acaba de atropellar un camión.'], ['tovan', 'Espera… ¿tatamis? ¿Puertas correderas flotando? ¿Música de biwa?', 'happy'],
    ['tovan', '¡Esto es un isekai! ¡Siempre quise estar en un isekai!', 'happy'], ['lumen', 'Tovan. Ya estabas en un isekai.'], ['tovan', '…Oh.'],
    ['lumen', 'Este castillo no tiene fin. Sobrevive a sus demonios y a su señor, y quizá nos devuelva a casa.']],
  isekai2: [['lumen', '¿Otra vez? Mira a los dos lados antes de cruzar, por favor.'], ['tovan', '¡Es que no lo vi venir!']]
});
TIPS.push('Camión-kun no frena. Nunca. Es su única regla.', 'En el mundo ultra-realista sigues siendo cuadrado. Asúmelo.', 'Si ves una ventana de error, no pulses «Sí». Tampoco «Sí».');

/* ---------- Registro de enemigos ---------- */
const MAKERS = { imp: makeImp, sentinel: makeSentinel, oni: makeOni, dragon: makeDragon, orb: makeOrb, glass: makeGlass, redoni: makeRedOni,
  skeleton: makeSkeleton, teapot: makeTeapot, error: makeError, sixeyes: makeSixEyes, brute: () => makeBrute(false), boss: () => makeBrute(true) };

/* ---------- Cuelgue falso antes del modo ULTRA ---------- */
const crashEl = document.getElementById('crash');
let crashPh = -1;
function updateCrash(t){
  const ph = t < 2.0 ? 0 : t < 4.4 ? 1 : 2;
  if (ph !== crashPh){ crashPh = ph; crashEl.className = 'ph' + ph; if (ph === 0) play('crash'); if (ph === 2) play('bootup'); }
  if (ph === 0) crashEl.querySelector('.pct').textContent = Math.min(100, Math.floor(t / 1.8 * 100)) + ' % completado';
  if (ph === 1){ const p = Math.min(99, Math.floor((t - 2.0) / 1.6 * 99)); crashEl.querySelector('.bar i').style.width = p + '%'; crashEl.querySelector('.pp').textContent = p + ' %' + (p >= 99 ? ' (esto tarda un poco)' : ''); }
}
