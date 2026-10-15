'use strict';
/* ---------- Director del programa ---------- */
function showEp9(G_){ epCard.className = G_.ep; epCard.querySelector('.epn').textContent = G_.title[0]; epCard.querySelector('.ept').textContent = G_.title[1]; epCard.querySelector('.eps').textContent = G_.title[2];
  epCard.hidden = false; epCard.style.opacity = '1'; epCardT = 2.3; }
function mgStartShow(){
  MG.active = true; MG.done = false; MG.round = -1; MG.game = null; MG.ending = false; P9.length = 0; N9.length = 0;
  queue.length = 0; for (const e of enemies) if (e.alive && !e.isBoss) killEnemy(e); for (const q of projectiles) scene.remove(q.m); projectiles.length = 0;
  setSuper(false); state = 'normal'; attackW = 0; staffToBack();
  if (bossE){ bossE.g.visible = false; bossE.g.position.set(0, 0, -45); bossE.vx = bossE.vz = 0; }
  stat('mgShows'); mgNext();
}
function mgNext(){
  if (MG.game && MG.game.end) MG.game.end();
  MG.round++; MG.game = null; MG.ending = false; MG.endT = 0; P9.length = 0; N9.length = 0; MG.big = null;
  if (chMode === 'invaders') setChannel('anime');
  invActive = true; mgEl.hidden = true; document.body.classList.remove('mg-on');
  const G_ = MG_GAMES[MG.order[MG.round]]; MG.pending = G_; MG.trans = 2.3; staticT = 0.55; play('static'); showEp9(MG.round === 0 ? Object.assign({}, G_, { ep: 'ep-show', title: ['¡EN DIRECTO!', 'El Show de Míster Confianza', `${G_.title[1]} · ${G_.title[2]}`] }) : G_);
  if (bossE && MG.round) bossE.hp = bossE.maxHp * MG_THR[MG.round - 1];
}
function mgBegin(G_){
  MG.game = G_; MG.t = 0;
  if (G_.overlay){ mgEl.hidden = false; document.body.classList.add('mg-on'); invActive = true; musOverride(G_.song); }
  else { musRelease(); }
  G_.start();
}
function mgEndShow(win){
  if (MG.game && MG.game.end) MG.game.end();
  MG.active = false; MG.game = null; MG.done = !!win; mgEl.hidden = true; document.body.classList.remove('mg-on');
  if (chMode === 'invaders') setChannel('anime'); invActive = false; chT = 22; musRelease();
  if (win && bossE && bossE.alive && bossE.type === 'star'){ const b = bossE; b.g.visible = true; b.g.position.set(0, 0, -3); b.hp = 0; killEnemy(b);
    queue.length = 0; for (const e of enemies) if (e.alive && !e.isBoss) killEnemy(e); }
  for (const q of projectiles) scene.remove(q.m); projectiles.length = 0;
}
function mgUpdate(dt, pdt, playing){
  if (!MG.active){
    if (playing && !MG.done && bossE && bossE.type === 'star' && bossE.alive && bossE.spawnT <= 0 && !player.dead) mgStartShow();
    return; }
  if (player.dead || !bossE || !bossE.alive || bossE.type !== 'star'){ mgEndShow(false); return; }
  chT = 99;                                         // durante el show no se cambia de canal
  if (!playing){ if (MG.game && MG.game.overlay) mgDraw(0); return; }
  if (MG.trans > 0){ MG.trans -= dt; if (MG.trans <= 0) mgBegin(MG.pending); return; }
  const G_ = MG.game; if (!G_) return;
  MG.t += pdt;
  if (!MG.ending && bossE.hp <= bossE.maxHp * MG_THR[MG.round] + 0.5){ MG.ending = true; bossE.hp = Math.max(0, bossE.maxHp * MG_THR[MG.round]); G_.finish(); }
  try { G_.upd(pdt); } catch (err) { console.error(err); }
  if (MG.ending && MG.endT > 0){ MG.endT -= pdt; if (MG.endT <= 0){ if (MG.round >= MG.order.length - 1) mgEndShow(true); else mgNext(); return; } }
  if (G_.overlay) mgDraw(pdt);
}
function mgDraw(dt){
  const G_ = MG.game; if (!G_) return;
  updP9(dt); updN9(dt);
  mgX.setTransform(1, 0, 0, 1, 0, 0); mgX.imageSmoothingEnabled = false;
  if (MG.shake > 0){ MG.shake = Math.max(0, MG.shake - dt); const k = MG.shake * 12; mgX.translate(Math.round((rnd() - 0.5) * k), Math.round((rnd() - 0.5) * k)); }
  try { G_.draw(MG.t); } catch (err) { console.error(err); }
  mgX.setTransform(1, 0, 0, 1, 0, 0);
  drawBig9(dt);
  if (MG.flashA > 0){ mgX.globalAlpha = Math.min(1, MG.flashA); mgX.fillStyle = MG.flashC; mgX.fillRect(0, 0, MGW, MGH); mgX.globalAlpha = 1; MG.flashA = Math.max(0, MG.flashA - dt * 3); }
  // líneas de televisión
  mgX.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < MGH; y += 2) mgX.fillRect(0, y, MGW, 1);
}

/* ---------- Mandos: durante el show los botones van al minijuego ---------- */
function mgBtn(b){ if (MG.trans > 0 || !MG.game || !MG.game.overlay) return; try { MG.game.btn(b); } catch (err) { console.error(err); } }
const _doAttack9 = doAttack; doAttack = function(){ if (mgOverlay()){ mgBtn('attack'); return; } _doAttack9(); };
const _doJump9 = doJump; doJump = function(){ if (mgOverlay()){ mgBtn('jump'); return; } _doJump9(); };
const _doRoll9 = doRoll; doRoll = function(){ if (mgOverlay()){ mgBtn('roll'); return; } _doRoll9(); };
const _doSpecial9 = doSpecial; doSpecial = function(){ if (mgOverlay()){ mgBtn('special'); return; } _doSpecial9(); };
mgEl.addEventListener('pointerdown', ev => {
  if (!mgOverlay()) return; ev.preventDefault();
  const r = mgC.getBoundingClientRect(), s = Math.min(r.width / MGW, r.height / MGH), ox = r.left + (r.width - MGW * s) / 2, oy = r.top + (r.height - MGH * s) / 2;
  const x = (ev.clientX - ox) / s, y = (ev.clientY - oy) / s;
  if (MG.game === RP9 && RP9.st === 'menu'){ RP9.pick(x, y); return; }
  if (ev.pointerType === 'mouse') mgBtn(ev.button === 2 ? 'special' : 'attack');
});
mgEl.addEventListener('contextmenu', ev => ev.preventDefault());

/* ---------- Música propia de cada programa ---------- */
Object.assign(SONGS, {
  mgFight: { comp: true, gain: 0.8, bassVol: 0.7, leadVol: 1.25, meter: 16, sd: 0.085, len: 16, root: 57, scale: SCALE.dorian, prog: [0, 0, 5, 6, 0, 0, 3, 4], lo: 3, hi: 12, start: 7, seed: 919, rhythm: R16.concat(R16f),
    lead: 'chip', leadOct: 12, harm: -2, harmIns: 'brass', arp: 'chipArp', arpPat: 'x.xxx.xxx.xxx.xx', arpOct: 0, bassPat: 'x.xox.xox.xox.xo', bassIns: 'sawBass', bassLen: 0.7,
    drums: { kick: 'x...x...x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' }, crashEvery: 8, intro: 1, breakUp: true },
  mgRun: { comp: true, gain: 0.78, bassVol: 0.6, leadVol: 1.2, meter: 16, sd: 0.075, len: 16, root: 60, scale: SCALE.major, prog: [0, 4, 5, 3, 0, 4, 3, 4], lo: 3, hi: 12, start: 7, seed: 929, rhythm: R16f.concat(R16),
    lead: 'chip', leadOct: 12, harm: 2, harmIns: 'chip', arp: 'chipArp', arpPat: 'xxxxxxxxxxxxxxxx', arpOct: 0, bassPat: 'x.x.x.x.x.x.x.x.', bassIns: 'sawBass', bassLen: 0.6,
    drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' }, crashEvery: 8, intro: 1, breakUp: true },
  mgRpg: { comp: true, gain: 0.82, bassVol: 0.75, leadVol: 1.35, meter: 16, sd: 0.095, len: 16, root: 57, scale: SCALE.minor, prog: [0, 5, 6, 4, 0, 5, 3, 4], lo: 3, hi: 12, start: 7, seed: 939, rhythm: R16.concat(R16f),
    lead: 'violin', leadOct: 12, harm: -2, harmIns: 'brass', arp: 'strings', arpPat: 'x.x.x.x.x.x.x.x.', arpOct: 0, bassPat: 'xoxoxoxoxoxoxoxo', bassIns: 'bass', bassLen: 0.8, pad: 'choir', padOct: 0,
    drums: { kick: 'x...x...x...x...', snare: '....x.......x.x.', hat: '..x...x...x...x.' }, crashEvery: 4, intro: 1, breakUp: true }
});
const MO9 = { name: null, prev: null, track: null };
function musOverride(name){
  if (!name) return; if (MO9.name) musRelease();
  MO9.name = name; MO9.prev = song; MO9.track = curTrack; pendingTrack = null;
  if (curTrack){ try { curTrack.a.pause(); } catch (err) {} curTrack = null; }
  setSong(name); applyMusVol();
}
function musRelease(){
  if (!MO9.name) return; const n = MO9.name; MO9.name = null;
  if (song !== n){ MO9.track = null; return; }
  if (MO9.track && bossE && bossE.alive){ setSong(null); curTrack = MO9.track; try { const pr = curTrack.a.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (err) {} }
  else setSong(MO9.prev);
  MO9.track = null; applyMusVol();
}

const _v3UpdateMG9 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateMG9(dt, pdt, playing); try { mgUpdate(dt, pdt, playing); } catch (err) { console.error(err); } };
const _startRunMG9 = startRun;
startRun = function(){ if (MG.active) mgEndShow(false); MG.done = false; MO9.name = null; _startRunMG9(); };
