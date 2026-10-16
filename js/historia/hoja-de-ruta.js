'use strict';
/* ======================================================================
   HOJA DE RUTA: el hilo de la historia durante la partida
   Al sacar a Lumen de la caja, el sello se partió en seis trozos y cada
   uno acabó dentro de un jefe. La partida es una ruta de reparto:
   seis paradas (un capítulo y un trozo cada una) y la entrega final en
   la azotea del anticuario, donde espera el destinatario (el Gato).
     · Tarjeta de la ruta al empezar la partida y en cada viaje (#rutaCard y el capítulo)
     · Lumen cuenta qué se busca en cada parada (1.ª y 3.ª oleada del capítulo)
     · Al tumbar al jefe: «Trozo del sello N de 6» (#trozoFx) y un recuerdo de Lumen
       (la primera vez, un diálogo; después, un comentario)
     · La ruta también sale en la pausa y al caer
   ====================================================================== */
const RUTA = [
  { n: 'Ruinas', jefe: 'el Guardián de piedra',
    inicio: 'Primera parada: las Ruinas del Ocaso. Aquí hay un trozo del sello, dentro de algo grande y de piedra. Despeja la plaza y saldrá a por ti.',
    corto: 'Parada 1: las Ruinas. El trozo lo tiene el Guardián de piedra.',
    medio: 'El suelo tiembla cada vez que cae un monstruo. Lo que guarda el trozo se está despertando.' },
  { n: 'Santuario', jefe: 'Ryūjin',
    inicio: 'Segunda parada: el Santuario de los Cerezos. El trozo está en el cielo: algo muy largo se lo ha tragado.',
    corto: 'Parada 2: el Santuario. El trozo lo tiene el dragón.',
    medio: 'Escucha: un rugido entre las nubes. Cuantos más caen, más cerca está.' },
  { n: 'Cumbre', jefe: 'Gashadokuro',
    inicio: 'Tercera parada: la Cumbre Nevada. El trozo está enterrado bajo un montón de huesos. Un montón muy alto.',
    corto: 'Parada 3: la Cumbre. El trozo está bajo los huesos.',
    medio: 'La montaña cruje. No es la nieve: son costillas.' },
  { n: 'Canal X', jefe: 'Míster Confianza',
    inicio: 'Cuarta parada: el Canal X. Míster Confianza enseña un trozo del sello como trofeo en su programa. Gánate al público y ve a por él.',
    corto: 'Parada 4: el Canal X. El trozo es el trofeo de Míster Confianza.',
    medio: 'Cada golpe vistoso sube tu confianza. Y aquí cambian el estilo de dibujo sin avisar: tú a lo tuyo.' },
  { n: 'Playa', jefe: 'la Tetera de Utah',
    inicio: 'Quinta parada: el mundo real. El trozo se coló en un parche de gráficos y ahora brilla demasiado.',
    corto: 'Parada 5: la playa. El trozo está dentro de algo que hierve.',
    medio: 'Huele a té. El trozo está dentro de algo que hierve.' },
  { n: 'Ruinas rotas', jefe: 'el ERROR',
    inicio: 'Sexta parada: las Ruinas otra vez, pero rotas. El último trozo ha corrompido el juego entero.',
    corto: 'Parada 6: las Ruinas rotas. El último trozo lo tiene un ERROR.',
    medio: 'Con cinco trozos ya leo la dirección de entrega: el mundo real, en un tejado. Solo falta uno.' },
  { n: 'Azotea', jefe: 'el destinatario', destino: true }
];
Object.assign(STORY, {
  trozo_1: [['lumen', '¡Primer trozo del sello! Y… espera. Me ha vuelto un recuerdo.'], ['lumen', 'Ese no era el Guardián de las Ruinas. Era su estatua: le hacía de portero.'],
    ['tovan', '¿Entonces a quién le firmo el albarán?'], ['lumen', 'Al de verdad. Era más pequeño. Y más… peludo, creo.']],
  trozo_2: [['lumen', 'Segundo trozo. Otro recuerdo: el Guardián me metió en la caja para protegerme, no para castigarme.'],
    ['tovan', 'Qué detalle. A mí mi casero me encierra para cobrarme.'], ['lumen', 'Y luego alguien escribió una dirección en la caja y llamó a una mensajería.']],
  trozo_3: [['lumen', 'Tercer trozo. Ya sé quién envió el paquete: el propio Guardián.'], ['tovan', '¿Se mandó una linterna a sí mismo?'],
    ['lumen', 'Para que alguien me llevara de vuelta encendida. Alguien valiente. O despistado.'], ['tovan', 'Las dos cosas, gracias.', 'happy']],
  trozo_4: [['lumen', 'Cuarto trozo. Recuerdo la dirección de entrega: una tienda de antigüedades. La del cartel.'],
    ['tovan', '¿El anticuario? ¡Pero si allí solo había un gato!'], ['lumen', '…Sí. Solo había un gato.']],
  trozo_5: [['lumen', 'Quinto trozo. Tovan, tengo que decírtelo: el Guardián no es una persona.'], ['tovan', '¿Es una tetera? Dime que no es una tetera.'],
    ['lumen', 'Tiene bigotes, cuatro patas y odia que llegues tarde.']],
  trozo_6: [['lumen', '¡El sello está completo! Ya puedo abrir el camino hasta la dirección de entrega.'], ['tovan', '¿Y el destinatario nos espera?'],
    ['lumen', 'En la azotea del anticuario. Lleva tres semanas esperando.'], ['tovan', 'Uy. Eso es una estrella en la valoración, mínimo.']]
});
const TROZO_CORTO = ['Primer trozo. El de piedra solo era el portero.', 'Segundo trozo. Ya van dos sellos en el albarán.', 'Tercer trozo. La mitad del sello: vamos bien.',
  'Cuarto trozo. Y sin firmar autógrafos.', 'Quinto trozo. Solo queda uno.', '¡El sello está completo! Rumbo a la dirección de entrega.'];
const ruta = { pend: 0 };
const rutaParada = n => n >= FINAL_WAVE ? 6 : Math.min(5, Math.floor((n - 1) / 5));   // capítulo (0-5) o 6 = la azotea

/* ---------- La tira de la ruta: seis paradas y el destino ---------- */
function rutaHTML(actual, nueva){
  return '<div class="ruta">' + RUTA.map((p, i) => {
    const cls = i < actual ? 'hecha' : i === actual ? 'actual' : '';
    return `<span class="rp ${cls}${i === nueva ? ' nueva' : ''}${p.destino ? ' destino' : ''}"><i>${p.destino ? '✉' : i + 1}</i><b>${p.n}</b></span>`;
  }).join('') + '</div>';
}

/* ---------- Tarjeta al empezar la partida ---------- */
const rutaCard = document.createElement('div'); rutaCard.id = 'rutaCard'; rutaCard.hidden = true; rutaCard.setAttribute('aria-live', 'polite'); document.body.appendChild(rutaCard);
let rutaCardT = 0;
function rutaTarjeta(parada, txt){
  rutaCard.innerHTML = `<div class="rt">Hoja de ruta · <b>Parada ${parada + 1} de 7</b></div>${rutaHTML(parada, -1)}<div class="rs">${txt}</div>`;
  rutaCard.hidden = false; rutaCard.classList.remove('on'); void rutaCard.offsetWidth; rutaCard.classList.add('on'); rutaCardT = 3.6;
}

/* ---------- Trozo del sello ---------- */
const trozoFx = document.createElement('div'); trozoFx.id = 'trozoFx'; trozoFx.hidden = true; document.body.appendChild(trozoFx);
let trozoT = 0;
function trozoMuestra(n){
  trozoFx.innerHTML = `<div class="sello6" style="--n:${n}"><i></i></div><div class="tt">Trozo del sello</div><div class="tn"><b>${n}</b> de 6</div><div class="ts">${RUTA[n - 1].jefe[0].toUpperCase() + RUTA[n - 1].jefe.slice(1)} lo llevaba encima</div>`;
  bannerEl.hidden = true; bannerT = 0; trozoFx.hidden = false; trozoFx.classList.remove('on'); void trozoFx.offsetWidth; trozoFx.classList.add('on'); trozoT = 3.2; play('achieve');
}

/* ---------- Ganchos ---------- */
const _startRunRuta = startRun;
startRun = function(){ ruta.pend = 0; trozoFx.hidden = true; rutaCard.hidden = true; _startRunRuta(); };
const _startWaveRuta = startWave;
startWave = function(n){
  _startWaveRuta(n);
  try {
    if (n >= FINAL_WAVE || n % 5 === 0) return;
    const ch = rutaParada(n), k = (n - 1) % 5, R = RUTA[ch];
    if (!meta.seen) meta.seen = {};
    if (k === 0){
      const visto = meta.seen['ruta_' + ch]; meta.seen['ruta_' + ch] = true; saveMeta();
      if (n === 1){ bannerEl.hidden = true; bannerT = 0; rutaTarjeta(0, R.corto); }   // la tarjeta hace de rótulo de la 1.ª oleada
      later(0.9, () => { if (gameState === 'play' && !(typeof tutoActivo === 'function' && tutoActivo())) bark(visto ? R.corto : R.inicio); });
    } else if (k === 2 && !meta.seen['ruta_m' + ch]){ meta.seen['ruta_m' + ch] = true; saveMeta(); later(0.9, () => { if (gameState === 'play') bark(R.medio); }); }
  } catch (err) { console.error(err); }
};
// El jefe de cada capítulo lleva un trozo
const _killEnemyRuta = killEnemy;
killEnemy = function(e){
  const was = e.alive; _killEnemyRuta(e);
  if (was && !e.alive && e.isBoss && !special && wave % 5 === 0 && wave <= 30 && e.type === bossOfWave(wave)) ruta.pend = wave / 5;
};
// Tras el diálogo de victoria del jefe (y antes de las cartas y del viaje): el trozo y el recuerdo de Lumen
const _onWaveDoneRuta = onWaveDone;
onWaveDone = function(){
  if (pendingWin || finalBeaten || special || !ruta.pend) return _onWaveDoneRuta();
  const n = ruta.pend, k = 'trozo_' + n; ruta.pend = 0; trozoMuestra(n);
  if (!meta.seen || !meta.seen[k]) sayOnce(k, STORY[k], onWaveDone);
  else { barkT = 0; bark(TROZO_CORTO[n - 1]); clearT = 2.4; }   // el bucle principal vuelve a llamar a onWaveDone al acabar clearT
};
// En cada viaje, la tarjeta del capítulo enseña la ruta con la parada nueva
const chapRuta = document.createElement('div'); chapRuta.className = 'cruta'; chapEl.appendChild(chapRuta);
let chapRutaN = -1;
const _updateTravelRuta = updateTravel;
updateTravel = function(dt){
  const t = travel; _updateTravelRuta(dt);
  if (t && t.swapped && chapRutaN !== t.n){ chapRutaN = t.n; const p = rutaParada(t.n); chapRuta.innerHTML = rutaHTML(p, p - 1); }
  if (!travel) chapRutaN = -1;
};
// En la pausa y al caer
const _renderPauseTabsRuta = renderPauseTabs;
renderPauseTabs = function(){
  _renderPauseTabsRuta();
  const pan = pauseScr.querySelector('.panel'); let el = pan.querySelector('.pruta');
  if (!el){ el = document.createElement('div'); el.className = 'pruta'; pan.querySelector('h2').after(el); }
  const p = rutaParada(Math.max(1, wave));
  el.innerHTML = rutaHTML(p, -1) + `<p class="rs">${special ? 'Desvío: el Castillo Infinito' : p >= 6 ? 'Entrega final: la azotea del anticuario' : `Parada ${p + 1}: el trozo lo tiene ${RUTA[p].jefe}`} · <b>${p} de 6</b> trozos del sello</p>`;
};
const _showOverRuta = showOver;
showOver = function(){
  _showOverRuta();
  const pan = overScr.querySelector('.panel'); let el = pan.querySelector('.pruta');
  if (!el){ el = document.createElement('div'); el.className = 'pruta'; pan.querySelector('h2').after(el); }
  const p = rutaParada(Math.max(1, wave));
  el.innerHTML = rutaHTML(p, -1) + `<p class="rs">Lumen te trae de vuelta desde la parada ${p + 1} · <b>${p} de 6</b> trozos del sello</p>`;
};

const _v3UpdateRuta = v3Update;
v3Update = function(dt, pdt, playing){
  _v3UpdateRuta(dt, pdt, playing);
  if (rutaCardT > 0 && (rutaCardT -= dt) <= 0) rutaCard.hidden = true;
  if (trozoT > 0 && (trozoT -= dt) <= 0) trozoFx.hidden = true;
};
