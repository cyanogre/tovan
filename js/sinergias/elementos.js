'use strict';
/* ======================================================================
   SINERGIAS: estados elementales, reacciones, cadenas, combo
   ====================================================================== */
const TAGS = {
  fuego:   { n: 'Fuego',   ic: '🔥', col: '#ff8a3a', bonus: 'Las quemaduras hacen +50 % y los enemigos que arden explotan al morir.' },
  hielo:   { n: 'Hielo',   ic: '❄️', col: '#8fe6ff', bonus: 'La congelación dura +1 s y los golpes a enemigos congelados son siempre críticos.' },
  rayo:    { n: 'Rayo',    ic: '⚡', col: '#fff27a', bonus: 'Todos los rayos saltan a 2 enemigos más y hacen +30 % de daño.' },
  cristal: { n: 'Cristal', ic: '💎', col: '#b69cff', bonus: 'Un cristal guardián extra, y los cristales giran más rápido y pegan +50 %.' },
  impacto: { n: 'Impacto', ic: '💥', col: '#ffc070', bonus: 'Ondas un 40 % más grandes y el golpe final aplica todos tus elementos.' },
  sangre:  { n: 'Sangre',  ic: '🩸', col: '#ff5a6a', bonus: 'Golpes y rayos te curan 1 PV, y pegas +15 % con menos de la mitad de PV.' }
};
const TAG_KEYS = Object.keys(TAGS);
let tagCnt = {}, setsOn = {};
const setOn = t => !!setsOn[t];
const lvl = id => taken[id] || 0;
function recountTags(){
  const prev = Object.assign({}, setsOn);
  tagCnt = {};
  for (const [id, n] of Object.entries(taken)){ const u = UPGRADES.find(x => x.id === id); if (u && u.tags) for (const t of u.tags) tagCnt[t] = (tagCnt[t] || 0) + n; }
  for (const t of TAG_KEYS) setsOn[t] = (tagCnt[t] || 0) >= 3;
  if (TAG_KEYS.filter(t => setsOn[t]).length >= 3) unlock('sets3');
  for (const t of TAG_KEYS) if (setsOn[t] && !prev[t]) setActivated(t);
  renderTagChips();
}
function setActivated(t){
  banner(`¡Bonus de ${TAGS[t].n}! ${TAGS[t].ic}<small>${TAGS[t].bonus}</small>`, 2.6);
  play('setBonus');
  const c = parseInt(TAGS[t].col.slice(1), 16);
  ringFx(hero.position.x, hero.position.z, c, 0.3, 3.5, 0.6); ringFx(hero.position.x, hero.position.z, 0xffffff, 0.2, 2.2, 0.45, 0.6);
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, 0.4, hero.position.z, Math.cos(a) * 4, 2 + rnd() * 3, Math.sin(a) * 4, c, 0.08, 0.8, 6, 0.5); }
  if (t === 'cristal') addOrb();
}

/* ---------- Luz de explosión (tercera luz del shader) ---------- */
let lflash = 0;
const lflashCol = new THREE.Color();
function lightFlash(x, y, z, color, intensity, range){
  if (intensity < lflash * 0.7) return;
  lflash = intensity; lflashCol.setHex(color); shared.uP3Pos.value.set(x, y, z); shared.uP3Range.value = range;
}

/* ---------- Eventos diferidos (las cadenas se ven en cascada) ---------- */
const pending = [];
function later(delay, fn){ pending.push({ t: delay, fn }); }
function runPending(dt){
  let n = 0;
  for (let i = 0; i < pending.length && n < 40; i++){
    const p = pending[i]; p.t -= dt;
    if (p.t <= 0){ pending.splice(i, 1); i--; n++; try { p.fn(); } catch (err) { console.error(err); } }
  }
}
