'use strict';
/* ---------- Tragaperras ---------- */
const slotEl13 = document.createElement('div'); slotEl13.id = 'slot13'; slotEl13.hidden = true; document.body.appendChild(slotEl13);
/* (estilos de esta parte: css/tragaperras-v13.css) */
const SLOT_IC13 = ['🍒', '🔔', '💎', '7️⃣'];
function slotSpin13(res, done){
  slotEl13.hidden = false; slotEl13.innerHTML = `<div class="rl">${res.map(() => '<span class="spin">❔</span>').join('')}</div><div class="rs"></div>`; play('cursor');
  const sp = [...slotEl13.querySelectorAll('.rl span')]; let tick = 0;
  hzFx({ upd(dt){ this.t += dt; tick -= dt;
      if (tick <= 0){ tick = 0.06; sp.forEach((s, i) => { if (this.t < 0.5 + i * 0.3) s.textContent = pick10(SLOT_IC13); }); }
      for (let i = 0; i < 3; i++) if (this.t >= 0.5 + i * 0.3 && sp[i].classList.contains('spin')){ sp[i].classList.remove('spin'); sp[i].textContent = res[i]; play('hit'); }
      if (this.t >= 1.15 && !this.fired){ this.fired = true; try { done(); } catch (err) { console.error(err); } }
      return this.t > 2.4; }, end(){ slotEl13.hidden = true; } });
}
function slotMsg13(t){ const r = slotEl13.querySelector('.rs'); if (r) r.textContent = t; }
function jackpot13(sym, k){
  const H = hero.position;
  if (sym === '🍒'){ slotMsg13('¡Cerezas! Te curas'); heal(Math.round(player.maxHp * 0.25)); play('heal'); }
  else if (sym === '🔔'){ slotMsg13('¡Campanas! Barra llena'); player.meter = 100; play('tier'); }
  else if (sym === '💎'){ slotMsg13('¡Diamantes! Lluvia de cristal'); crystalRain13(8, 30 * k); }
  else { slotMsg13('¡JACKPOT!'); flash('#ffe070', 0.35); play('superOn'); heal(Math.round(player.maxHp * 0.15)); player.meter = Math.min(100, player.meter + 40);
    explode(H.x, H.z, 5.5, 0xffd23a, 70 * k, { kind: 'nova', knock: 7 }); gring(H.x, 0.1, H.z, 0xffd23a, 0.4, 6, 0.5); coinRain13(12, 34 * k); }
}
function coinRain13(n, dmg){
  for (let i = 0; i < n; i++) later(0.1 + i * 0.08, () => { const L = liveE10(); let x, z;
    if (L.length){ const e = pick10(L); x = e.g.position.x; z = e.g.position.z; } else { const a = rnd() * TAU, r = 1 + rnd() * 4; x = hero.position.x + Math.cos(a) * r; z = hero.position.z + Math.sin(a) * r; }
    const v = clampArena(new V3(x, 0, z)), m = mesh(coinGeo13, coinMat13, v.x, 9, v.z); m.rotation.x = Math.PI / 2;
    hzFx({ upd(dt){ this.t += dt; m.position.y = 9 * (1 - Math.min(1, this.t / 0.38) ** 2); m.rotation.z += dt * 14;
        if (this.t >= 0.38 && !this.hit){ this.hit = true; explode(v.x, v.z, 1.4, 0xffd23a, dmg, { kind: 'impact', knock: 3, sfx: 'hit' });
          for (let j = 0; j < 6; j++){ const a = rnd() * TAU; pa(v.x, 0.3, v.z, Math.cos(a) * 3, 3 + rnd() * 2, Math.sin(a) * 3, 0xffd23a, 0.14, 0.6, 9, 0.5, 1, SH7.dia); } }
        return this.t > 0.45; }, end(){ scene.remove(m); } }); });
}
function crystalRain13(n, dmg){
  for (let i = 0; i < n; i++) later(0.1 + i * 0.09, () => { const L = liveE10(); if (!L.length) return; const e = pick10(L), v = clampArena(new V3(e.g.position.x, 0, e.g.position.z));
    const m = mesh(crisGeo13, makeMat(0xb69cff, { emissive: 1 }), v.x, 9, v.z); m.scale.set(1, 2, 1);
    hzFx({ upd(dt){ this.t += dt; m.position.y = 9 * (1 - Math.min(1, this.t / 0.35) ** 2); m.rotation.y += dt * 9;
        if (this.t >= 0.35 && !this.hit){ this.hit = true; explode(v.x, v.z, 1.5, 0xb69cff, dmg, { sfx: 'shatter', kind: 'shatter', knock: 3 }); } return this.t > 0.45; }, end(){ scene.remove(m); } }); });
}
function slotPull13(){
  const casino = syn13('casino');
  let r = [pick10(SLOT_IC13), pick10(SLOT_IC13), pick10(SLOT_IC13)];
  if (casino && r[0] !== r[1] && r[1] !== r[2] && r[0] !== r[2]) r[1] = r[0];
  if (rnd() < 0.18) r = [r[0], r[0], r[0]];
  slotSpin13(r, () => {
    if (r[0] === r[1] && r[1] === r[2]) jackpot13(r[0], 1 + 0.3 * S10('tragaperras13'));
    else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]){ slotMsg13('Dos iguales: algo es algo'); heal(Math.round(player.maxHp * 0.06), true); player.meter = Math.min(100, player.meter + 15); }
    else slotMsg13(pick10(['Nada. Como el 97 % de las veces.', 'La casa gana. La casa siempre gana.', 'Ni una. Estadística pura.']));
    if (casino) discover('s13_casino', 'Casino', SYNM13.casino[4]);
  });
}

/* ---------- Fortaleza (escudo de coraza) ---------- */
function fortStart13(k){
  if (P13.fort){ P13.fort.t = Math.max(P13.fort.t, 6); return; }
  const m = mesh(bubbleGeo13, bubbleMat13, hero.position.x, 1, hero.position.z);
  P13.fort = { t: 6 + S10('brCoraza'), cap: player.maxHp * 0.4, got: 0, k, m };
  banner('¡Fortaleza!<small>Pega todo lo que quieras. Luego te lo devuelvo.</small>', 1); play('block'); gring(hero.position.x, 0.1, hero.position.z, 0xc0c8d8, 0.3, 3, 0.4);
}
function fortEnd13(){
  const F = P13.fort; if (!F) return; P13.fort = null; scene.remove(F.m);
  const H = hero.position, dmg = (40 + F.got * 1.5) * F.k;
  explode(H.x, H.z, 4.5, 0xdfe6f0, dmg, { kind: 'nova', knock: 8, sfx: 'shatter' }); gring(H.x, 0.1, H.z, 0xffffff, 0.4, 5, 0.45); crack7(H.x, H.z, 8, 3.5, false);
  tA.set(H.x, H.y + 2.8, H.z); spawnNumber(tA, F.got > 0 ? `Devuelto: ${Math.round(F.got)} + intereses` : '¡Pum!', 'react', '#dfe6f0');
}
