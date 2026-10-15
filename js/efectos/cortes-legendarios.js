'use strict';
/* ======================================================================
   ESPECIALES LEGENDARIOS: corte cinemático con cambios de plano
   ====================================================================== */
const LEGEND_SP = [
  ['supernova', 'SUPERNOVA', '#ffb040'], ['zero', 'INVIERNO ETERNO', '#9fe8ff'], ['tempest', 'TORMENTA DE CRISTAL', '#c89aff'],
  ['phoenix', 'VUELO DEL FÉNIX', '#ff6a3a'], ['clones', 'ATAQUE DE LAS SOMBRAS', '#8a6aff']
];
const cutInEl = document.getElementById('cutIn');
let lcut = null, lcutBypass = false, lcutSeen = new Set();
function legendNames(){
  const n = LEGEND_SP.filter(([id]) => lvl(id)).map(([, name, col]) => [name, col]);
  const ts = techSet(); if (ts.length > 1) n.push([TECH_CALL[ts.slice().sort().join('+')].replace(/[¡!]/g, ''), '#8ff6ff']);
  return n;
}
function startLegendCut(list, done){
  const key = list.map(x => x[0]).join('+'), full = !lcutSeen.has(key); lcutSeen.add(key);
  const dur = full ? 1.9 : 0.95;
  lcut = { t: 0, dur, done, full, target: null };
  hitStop = Math.max(hitStop, dur + 0.05);
  document.body.classList.add('cine');
  cutInEl.querySelector('.ci-n').textContent = list.map(x => x[0]).join(' + ');
  cutInEl.style.setProperty('--ci', list[0][1]); cutInEl.className = 'on';
  play('superOn'); flash('#ffffff', 0.35);
}
// también sirve para las transformaciones del jefe final (plano sobre otro objetivo)
function startBossCut(e, title, col, done){
  lcut = { t: 0, dur: 2.1, done, full: true, target: e };
  hitStop = Math.max(hitStop, 2.15); document.body.classList.add('cine');
  cutInEl.querySelector('.ci-n').textContent = title; cutInEl.style.setProperty('--ci', col); cutInEl.className = 'on boss';
  play('roar'); shake = 0.6;
}
function updateLegendCut(dt){
  if (!lcut) return;
  lcut.t += dt;
  if (lcut.t >= lcut.dur){ const d = lcut.done; lcut = null; document.body.classList.remove('cine'); cutInEl.className = ''; flash('#fff6c0', 0.4); shake = Math.max(shake, 0.35); if (d) d(); }
}
function legendCamera(cam){
  if (!lcut) return;
  const t = lcut.t / lcut.dur, shots = lcut.full ? 3 : 2, k = Math.min(shots - 1, Math.floor(t * shots)), u = (t * shots) % 1;
  const tg = lcut.target, H = tg ? tg.g.position : hero.position, f = tg ? tg.g.rotation.y : hero.rotation.y, fx = Math.sin(f), fz = Math.cos(f);
  const sc = tg ? tg.numY / 2 : hero.scale.y, headY = tg ? tg.numY * 0.92 : 1.72 * sc;
  if (k === 0){ const d = (tg ? 2.2 : 1.55) * sc * (1 - u * 0.3);
    cam.position.set(H.x + fx * d, H.y + headY, H.z + fz * d); cam.lookAt(H.x, H.y + headY - 0.05, H.z); cam.rotation.z += 0.16; }
  else if (k === 1 && lcut.full){ const a = tg ? f + 0.9 - u * 1.8 : f + Math.PI + 0.8 - u * 1.3, r = (tg ? 4.5 : 2.6) * sc;
    cam.position.set(H.x + Math.sin(a) * r, H.y + 0.25, H.z + Math.cos(a) * r); cam.lookAt(H.x, H.y + headY * 0.8, H.z); }
  else { const a = f + 0.6, r = (tg ? 7 : 4) + u * 5;
    cam.position.set(H.x + Math.sin(a) * r, H.y + 2 + u * 5, H.z + Math.cos(a) * r); cam.lookAt(H.x, H.y + 1, H.z); }
}
function legendPose(){
  if (!lcut || lcut.target) return;
  for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 2.2 * s, 0.5); bl(A.sh.rotation, 'x', -0.4, 0.5); bl(A.el.rotation, 'x', -0.3, 0.5); }
  bl(P.neck.rotation, 'x', -0.3, 0.5);
}
// efectos de los especiales legendarios (además del especial normal o de las técnicas)
function legendFx(){
  const H = hero.position;
  if (lvl('zero')){
    for (const e of enemies) if (e.alive && e.spawnT <= 0) freezeEnemy(e, 3 + S10('zero'));
    for (let i = 0; i < 14 + 7 * S10('zero'); i++) later(0.05 * i, () => { const a = rnd() * TAU, r = 1.5 + rnd() * 5; const x = H.x + Math.cos(a) * r, z = H.z + Math.sin(a) * r;
      for (let k = 0; k < 6; k++) spawnFx(x, 0.2, z, (rnd() - 0.5), 5 + rnd() * 3, (rnd() - 0.5), rnd() < 0.5 ? 0xffffff : 0x9fe8ff, 0.14, 0.7, 12, 0);
      explode(x, z, 1.4, 0x9fe8ff, 30, { el: 'ice', sfx: 'shatter', kind: 'shatter', knock: 2 }); });
  }
  if (lvl('tempest')){
    for (let i = 0; i < 12 + 6 * S10('tempest'); i++) later(0.12 + i * 0.1, () => { const live = enemies.filter(e => e.alive && e.spawnT <= 0); if (!live.length) return;
      const t = live[Math.floor(rnd() * live.length)]; chainLightning(t.g.position.x, 4, t.g.position.z, t, 3 + rayoJumps(), 30); });
  }
  if (lvl('phoenix')){
    heal(Math.round(player.maxHp * (0.15 + 0.1 * S10('phoenix')))); ringFx(H.x, H.z, 0xff6a3a, 0.3, 7, 0.5);
    [2.5, 4.5, 6.5].forEach((r, i) => later(0.15 + i * 0.2, () => explode(H.x, H.z, r, 0xff6a3a, 40, { el: 'fire', sfx: 'boom', kind: 'nova', knock: 4 })));
  }
  if (lvl('clones')){
    for (const c of cloneP) for (let i = 0; i < 6 + 3 * S10('clones'); i++) later(i * 0.12, () => { const t = nearestExcept(c.x, c.z, 9, null); if (!t) return;
      bolt(c.x, 1, c.z, t.g.position.x, 1, t.g.position.z, 0x8a6aff, 0.12); hitEnemy(t, rdmg(28), true, 0, 0, 3, 0, false, { src: 'clone' }); });
  }
  if (lvl('supernova') && techSet().length) onSpecial();
}
