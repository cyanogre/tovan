'use strict';
/* ======================================================================
   VALORACIÓN DEL CLIENTE: cada oleada se puntúa de 1 a 5 estrellas
   Cuenta la vida perdida, el tiempo (frente a un tiempo de entrega según
   cuántos enemigos había), el encargo de la oleada y el mejor combo.
     ★★★★★ +8 ✦ y una carta más (y la peor sube de rareza). Tres seguidas:
           «Cliente fiel», la siguiente oferta trae una legendaria.
     ★★★★  +3 ✦.        ★★★ nada.
     ★★    Queja: una carta menos.
     ★     Reclamación: una carta menos, −5 ✦ y la oleada siguiente viene
           con ganas (+20 % de daño y +15 % de vida).
   No puntúan el tutorial, el Castillo Infinito ni la pelea final.
   ====================================================================== */
const VAL = { ola: 0, t0: 0, perdida: 0, combo: 0, hecho: true, mod: null, racha: 0, enfadados: 0, ultima: null };
const valEl = document.createElement('div'); valEl.id = 'valora'; valEl.hidden = true; valEl.setAttribute('aria-live', 'polite'); document.body.appendChild(valEl);
let valT = 0;
const valEstrellas = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function valPar(){ const base = wave % 5 === 0 ? 70 : 10 + waveTotal * 1.8; return base * (MP.on ? 1.35 : 1); }
function valPuntua(){
  VAL.hecho = true;
  const o = OBJ.cur, perd = VAL.perdida / Math.max(1, player.maxHp), t = time - VAL.t0, par = valPar(), motivos = [];
  let s = 5;
  if (perd > 0.08) s--; if (perd > 0.3) s--; if (perd > 0.6) s--;
  motivos.push(perd === 0 ? ['Sin un rasguño', 1] : perd <= 0.08 ? ['Casi intacto', 1] : [`−${Math.round(perd * 100)} % de vida`, 0]);
  if (t > par) s--; if (t > par * 1.7) s--;
  motivos.push(t <= par ? ['Entrega rápida', 1] : [`Con retraso (${Math.round(t)} s)`, 0]);
  if (o && o.fin){ if (o.ok) motivos.push(['Encargo cumplido', 1]); else { s--; motivos.push(['Encargo fallido', 0]); } }
  if (VAL.combo >= 25){ s++; motivos.push([`Combo ×${VAL.combo}`, 1]); }
  s = clamp(s, 1, 5);
  let efecto = '';
  if (s === 5){ castleBonus += 8; VAL.mod = 'mas'; VAL.racha++; efecto = '+8 ✦ · una carta más';
    if (VAL.racha >= 3){ VAL.racha = 0; forceLegend = true; efecto += ' · ¡Cliente fiel: carta legendaria!'; } }
  else { VAL.racha = 0;
    if (s === 4){ castleBonus += 3; efecto = '+3 ✦'; }
    else if (s === 2){ VAL.mod = 'menos'; efecto = 'Queja: una carta menos'; }
    else if (s === 1){ VAL.mod = 'menos'; castleBonus -= 5; VAL.enfadados = wave + 1; efecto = 'Reclamación: una carta menos, −5 ✦ y la próxima oleada viene con ganas'; } }
  VAL.ultima = { s, efecto };
  valEl.className = 's' + s;
  valEl.innerHTML = `<div class="vt">Valoración del cliente</div><div class="ve">${valEstrellas(s)}</div><div class="vm">${motivos.map(([m, b]) => `<span class="${b ? 'si' : 'no'}">${m}</span>`).join('')}</div>${efecto ? `<div class="vf">${efecto}</div>` : ''}`;
  valEl.hidden = false; valEl.classList.remove('on'); void valEl.offsetWidth; valEl.classList.add('on'); valT = 3.2;
  play(s >= 4 ? 'objOk' : s <= 2 ? 'objFail' : 'cursor');
  if (s === 1) later(0.8, () => { barkT = 0; bark('Una estrella. El cliente ha escrito una reseña muy larga. Y muy enfadada.'); });
}

/* ---------- Ganchos ---------- */
const _startWaveVal = startWave;
startWave = function(n){
  _startWaveVal(n);
  Object.assign(VAL, { ola: wave, t0: time, perdida: 0, combo: 0, hecho: n >= FINAL_WAVE || (typeof tutoActivo === 'function' && tutoActivo()) });
  if (VAL.enfadados && VAL.enfadados === wave) later(1.6, () => { barkT = 0; bark('Vienen enfadados por la reclamación. Más fuertes y con más aguante. Gracias, cliente.'); });
};
const _startSpecialWaveVal = startSpecialWave;
startSpecialWave = function(){ _startSpecialWaveVal(); VAL.hecho = true; };
const _hurtPlayerVal = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){ const h0 = player.hp, r = _hurtPlayerVal(dmg, sx, sz, knock); if (player.hp < h0) VAL.perdida += h0 - player.hp; return r; };
const _spawnEnemyVal = spawnEnemy;
spawnEnemy = function(type, at){
  const e = _spawnEnemyVal(type, at);
  if (e && VAL.enfadados && VAL.enfadados === wave && !e.isBoss){ e.dm *= 1.2; e.hp = e.maxHp = Math.round(e.maxHp * 1.15); }
  return e;
};
// las cartas: una más (y la peor sube de rareza) o una menos
const _dealCardsVal = dealCards;
dealCards = function(){
  _dealCardsVal();
  if (FOIL.premio || !VAL.mod) return valCabecera();
  const cw = curW(), avail = UPGRADES.filter(u => !u.minor && u.r !== 'foil' && (taken[u.id] || 0) < u.max && (!u.req || u.req()) && pwOn(u.id) && (!u.w || u.w === cw) && (!u.useful || u.useful()) && !offer.includes(u));
  if (VAL.mod === 'mas'){
    const buenas = avail.filter(u => u.r === 'rara' || u.r === 'epica'), pool = buenas.length ? buenas : avail;
    if (pool.length) offer.push(pool[Math.floor(rnd() * pool.length)]);
    const iPeor = offer.findIndex(u => u.minor || u.r === 'comun'), mejor = avail.filter(u => (u.r === 'rara' || u.r === 'epica') && !offer.includes(u));
    if (iPeor >= 0 && mejor.length) offer[iPeor] = mejor[Math.floor(rnd() * mejor.length)];
  } else if (VAL.mod === 'menos' && offer.length > 2){
    let k = offer.length - 1; while (k > 0 && (offer[k].r === 'leyenda' || offer[k].branch)) k--; offer.splice(k, 1);
  }
  try { renderCards10(); foilDecora(); } catch (err) { console.error(err); }
  valCabecera();
};
const valUp = document.createElement('div'); valUp.id = 'valUp'; document.querySelector('#upScr .uptitle').after(valUp);
function valCabecera(){
  const v = VAL.ultima; valUp.hidden = !v || FOIL.premio;
  if (v) valUp.innerHTML = `<b class="s${v.s}">${valEstrellas(v.s)}</b> ${v.efecto ? `<span>${v.efecto.replace(/ · ¡Cliente fiel.*$/, '')}</span>` : ''}`;
}
const _chooseUpgradeVal = chooseUpgrade;
chooseUpgrade = function(i){ _chooseUpgradeVal(i); VAL.mod = null; VAL.ultima = null; };
const _startRunVal = startRun;
startRun = function(){ Object.assign(VAL, { mod: null, racha: 0, enfadados: 0, ultima: null, hecho: true }); valEl.hidden = true; _startRunVal(); };
const _v3UpdateVal = v3Update;
v3Update = function(dt, pdt, playing){
  _v3UpdateVal(dt, pdt, playing);
  try {
    if (playing){ if (combo > VAL.combo) VAL.combo = combo; if (!VAL.hecho && clearT > 0 && wave === VAL.ola && !player.dead) valPuntua(); }
    if (valT > 0 && (valT -= dt) <= 0) valEl.hidden = true;
  } catch (err) { console.error(err); }
};
