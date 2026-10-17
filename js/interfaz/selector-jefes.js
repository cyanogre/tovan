'use strict';
/* ======================================================================
   SELECTOR DE JEFES (contraseña «jefes»): pelear directamente contra el
   jefe que quieras, para probar. Al acertar la contraseña aparece la
   lista (y desde entonces, un botón «Jefes» en el título).
   · Cartas al azar: las que llevarías al llegar jugando (una por oleada).
   · Invencible: no te hacen daño (para mirar ataques con calma).
   · Ryūjin: normal o directo a la forma colosal. ERROR 404: normal, directo a TOVAN.EXE o a su forma «fuera de memoria».
   · Míster Confianza: desde qué programa del show empezar (o la fase 2).
   ====================================================================== */
const CLAVE_JEFES = 'jefes';
const SELJ = { on: false, dios: false, col: false, ter: false, max: false, mgDesde: 0, fase2: false, pend: null };
const SELJ_LISTA = [
  { id: 'boss', n: 'Guardián de las Ruinas', d: 'Oleada 5 · Ruinas del Ocaso', w: 5 },
  { id: 'dragon', n: 'Ryūjin', d: 'Oleada 10 · el dragón de jade', w: 10, sub: [['Normal', 'n'], ['Directo a la forma colosal', 'col']] },
  { id: 'skeleton', n: 'Gashadokuro', d: 'Oleada 15', w: 15 },
  { id: 'star', n: 'Míster Confianza', d: 'Oleada 20 · el show', w: 20, sub: [['Show completo', 0], ['2 · ¡Humor Confianza!', 1], ['3 · ¡Marcianitos!', 2], ['4 · La Fantasía Final', 3], ['Fase 2 · ¡Sin guion!', 4]] },
  { id: 'teapot', n: 'La Tetera de Utah', d: 'Oleada 25', w: 25 },
  { id: 'error', n: 'ERROR 404', d: 'Oleada 30', w: 30, sub: [['Normal', 'n'], ['Directo a TOVAN.EXE', 'ter'], ['Directo a «fuera de memoria»', 'max']] },
  { id: 'sixeyes', n: 'El de los Seis Ojos', d: 'Castillo Infinito', w: 20 },
  { id: 'final', n: '???', d: 'El jefe final (destripa la historia)', w: FINAL_WAVE },
  { id: 'prueba', n: 'Campo de pruebas', d: 'Oleada 3 · sin jefe, para probar poderes', w: 3 }
];

/* ---------- Panel ---------- */
const selJEl = document.createElement('div'); selJEl.id = 'selJ'; selJEl.hidden = true;
selJEl.innerHTML = `<h3>⚔ Elegir jefe</h3>
  <div class="sjOpc"><label><input type="checkbox" id="sjCartas" checked> Con cartas al azar (como si llegaras jugando)</label>
  <label><input type="checkbox" id="sjDios"> Invencible (para probar)</label>
  <label>Poder foil <select id="sjFoil" aria-label="Poder foil"><option value="">Ninguno</option><option value="azar">Uno al azar</option></select></label></div>
  <div class="sjLista">${SELJ_LISTA.map((B, i) => `<div class="sjJefe"><button class="win btn sjGo" data-i="${i}"><b>${B.n}</b><small>${B.d}</small></button>${B.sub ? `<select class="sjSub" data-i="${i}" aria-label="Variante">${B.sub.map(([t, v]) => `<option value="${v}">${t}</option>`).join('')}</select>` : ''}</div>`).join('')}</div>`;
document.querySelector('#passScr .passp').appendChild(selJEl);
selJEl.addEventListener('keydown', e => e.stopPropagation());
selJEl.querySelectorAll('.sjGo').forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.i, s = selJEl.querySelector(`.sjSub[data-i="${i}"]`); play('confirm'); selJefeEmpieza(SELJ_LISTA[i], s ? s.value : null); }));
function selJAbre(){ selJEl.hidden = false; passScr.querySelector('.passp').classList.add('conJefes');
  const s = document.getElementById('sjFoil'); if (s.options.length <= 2) for (const u of UPGRADES.filter(x => x.r === 'foil')){ const o = document.createElement('option'); o.value = u.id; o.textContent = `${u.ic} ${u.name}`; s.appendChild(o); } }   // (los foil se registran después de este fichero)
const _probarPassJ = probarPass;
probarPass = function(){
  if (passIn.value.trim().toLowerCase() === CLAVE_JEFES){ meta.selJefes = true; saveMeta(); selJBoton(); selJAbre(); passMsg.textContent = '¡Selector de jefes desbloqueado! Elige contra quién quieres pelear.'; passMsg.className = 'ok'; play('achieve'); return; }
  _probarPassJ();
};
// (el botón Aceptar guardaba la versión vieja; el Enter ya llama a probarPass por su nombre)
{ const ok = document.getElementById('passOk'), nb = ok.cloneNode(true); ok.replaceWith(nb); nb.addEventListener('click', () => probarPass()); }
function selJBoton(){
  if (!meta.selJefes || document.getElementById('selJBtn')) return;
  const b = document.createElement('button'); b.className = 'win tbtn'; b.id = 'selJBtn';
  b.innerHTML = '<span class="ti">⚔</span><span class="tl">Jefes</span><span class="td">Pelear con cualquiera</span>';
  b.addEventListener('click', () => { openPass(); selJAbre(); }); document.getElementById('passBtn').after(b);
}
selJBoton();

/* ---------- Empezar contra un jefe ---------- */
function selJCartas(n){   // n cartas al azar entre las que podrían salir (sin foil, ni menores, ni de arma)
  for (let k = 0; k < n; k++){
    const ok = UPGRADES.filter(u => (taken[u.id] || 0) < u.max && (!u.req || u.req()) && u.r !== 'foil' && u.r !== 'menor' && !u.w && (typeof pwOn !== 'function' || pwOn(u.id)));
    if (!ok.length) break; const u = ok[Math.floor(rnd() * ok.length)];
    taken[u.id] = (taken[u.id] || 0) + 1; try { u.apply(); } catch (err) { console.error(err); }
  }
  try { recountTags(); renderTagChips(); } catch (err) { console.error(err); }
}
function selJefeEmpieza(B, sub){
  const cartas = document.getElementById('sjCartas').checked;
  SELJ.dios = document.getElementById('sjDios').checked; SELJ.col = B.id === 'dragon' && sub === 'col'; SELJ.ter = B.id === 'error' && (sub === 'ter' || sub === 'max'); SELJ.max = B.id === 'error' && sub === 'max';
  SELJ.mgDesde = B.id === 'star' ? +sub || 0 : 0;
  passScr.hidden = true; meta.intro2 = true; meta.introSeen = true; saveMeta();
  startRun(); SELJ.on = true;
  // con el kit de bienvenida (poder al empezar), startRun abre ya sus cartas: primero se elige y luego sale el jefe
  // (antes el jefe empezaba detrás, con las cartas encima y sin poder elegir: gameState ya no era 'upgrade')
  if (kitAfter){ SELJ.pend = [B, cartas]; banner(`Kit de bienvenida<small>Elige con qué empiezas · luego, ${B.n}</small>`, 1.8); return; }
  selJefeSigue(B, cartas);
}
function selJefeSigue(B, cartas){
  queue.length = 0; if (cartas) selJCartas(B.id === 'final' ? 28 : Math.max(0, B.w - 1));
  let fv = document.getElementById('sjFoil').value;   // un poder foil para probarlo
  if (fv){ const L = UPGRADES.filter(u => u.r === 'foil'), u = fv === 'azar' ? L[Math.floor(rnd() * L.length)] : L.find(x => x.id === fv); if (u){ foilDa(u.id); fv = `${u.ic} ${u.name}`; } }
  player.hp = player.maxHp;
  if (B.id === 'final'){ applyBiome(FINAL); startFinal(); }
  else if (B.id === 'sixeyes'){ wave = B.w; isekaiRun = true; isekaiArrive(); special = { kind: 'castle', stage: 4, max: 4, retWave: B.w, retBiome: biomeOfWave(B.w), done: false }; startSpecialWave(); }
  else { const b = biomeOfWave(B.w); if (b !== curBiome){ wave = B.w - 1; travelTo(b, B.w, true); } else startWave(B.w); }
  banner(`Selector de jefes<small>${B.n}${SELJ.dios ? ' · invencible' : ''}${fv ? ' · ' + fv : ''}</small>`, 1.8);
}
// invencible: los golpes no hacen nada (sí cuentan como esquiva para los poderes que miran el resultado)
const _hurtPlayerSelJ = hurtPlayer;
hurtPlayer = function(...a){ if (SELJ.on && SELJ.dios && gameState === 'play'){ player.inv = Math.max(player.inv, 0.2); return 'none'; } return _hurtPlayerSelJ(...a); };
const _startRunSelJ = startRun;
startRun = function(){ SELJ.on = false; SELJ.pend = null; _startRunSelJ(); };
const _afterUpgradeSelJ = afterUpgrade;
afterUpgrade = function(){ if (SELJ.pend && kitAfter){ const [B, c] = SELJ.pend; SELJ.pend = null; kitAfter = false; selJefeSigue(B, c); return; } _afterUpgradeSelJ(); };
const _toTitleSelJ = toTitle;
toTitle = function(){ SELJ.on = false; SELJ.pend = null; SELJ.dios = false; SELJ.col = false; SELJ.ter = false; SELJ.max = false; SELJ.mgDesde = 0; _toTitleSelJ(); };
// Ryūjin directo a la forma colosal (y ERROR 404 directo a TOVAN.EXE): en cuanto puede pelear, «muere» y empieza la segunda vida
const _v3UpdateSelJ = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateSelJ(dt, pdt, playing);
  if (!(SELJ.col || SELJ.ter) || !playing || cs.active) return;
  const d = enemies.find(e => e.alive && e.type === (SELJ.col ? 'dragon' : 'error') && e.spawnT <= 0);
  if (d && (SELJ.col ? colPuede(d) : terPuede(d))){ SELJ.col = SELJ.ter = false; if (d.escJ){ d.escJ.est = 'espera'; d.escJ.t = 99; } d.hp = 0; killEnemy(d); } };
// Míster Confianza: empezar el show por otro programa (o saltarlo hasta la fase 2)
const _mgNextSelJ = mgNext;
mgNext = function(){
  if (SELJ.on && SELJ.mgDesde && MG.round === -1){ const k = SELJ.mgDesde; SELJ.mgDesde = 0;
    if (k >= MG.order.length){ MG.round = MG.order.length - 1; later(0.1, () => { if (MG.active) mgEndShow(true); }); return; }   // directo a la fase 2
    MG.round = k - 1; }
  _mgNextSelJ();
};
