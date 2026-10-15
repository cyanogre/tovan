'use strict';
/* ---------- Billetes que se ven (y se recogen) ---------- */
const billTex = texAsset('objetos/billete');
const billMat = makeMat(0xffffff, { map: billTex, side: THREE.DoubleSide, emissive: 0.35 });
const billGeo = new THREE.PlaneGeometry(0.46, 0.23);
const bills = [];
function dropBills(x, z, n){
  for (let i = 0; i < n; i++){
    if (bills.length > 70){ const o = bills.shift(); scene.remove(o.m); }
    const a = rnd() * TAU, sp = 1.2 + rnd() * 1.6;
    const m = mesh(billGeo, billMat, x + Math.cos(a) * 0.2, 1.3 + rnd() * 0.7, z + Math.sin(a) * 0.2);
    bills.push({ m, vx: Math.cos(a) * sp, vy: 3.2 + rnd() * 2.4, vz: Math.sin(a) * sp, t: 0, st: 'air', seed: rnd() * 9, spin: (rnd() - 0.5) * 9 });
  }
  if (n) play('cash');
}
function updateBills(dt){
  for (let i = bills.length - 1; i >= 0; i--){
    const b = bills[i], m = b.m; b.t += dt;
    const dx = hero.position.x - m.position.x, dz = hero.position.z - m.position.z, d = Math.hypot(dx, dz);
    if (b.st === 'air'){
      b.vy -= 7 * dt; if (b.vy < -1.1) b.vy = -1.1;                          // caen como papel
      const k = Math.exp(-dt * 2.2); b.vx *= k; b.vz *= k;
      m.position.x += (b.vx + Math.sin(b.t * 4 + b.seed) * 0.9) * dt; m.position.z += (b.vz + Math.cos(b.t * 3.3 + b.seed) * 0.6) * dt; m.position.y += b.vy * dt;
      m.rotation.set(Math.sin(b.t * 5 + b.seed) * 0.9, m.rotation.y + b.spin * dt, Math.cos(b.t * 4 + b.seed) * 0.7);
      if (m.position.y <= 0.04){ m.position.y = 0.04; b.st = 'floor'; m.rotation.set(-Math.PI / 2, 0, rnd() * TAU); }
      clampArena(m.position);
    } else if (b.st === 'floor'){
      m.visible = b.t < 9 || Math.floor(b.t * 8) % 2 === 0; if (b.t > 11){ scene.remove(m); bills.splice(i, 1); continue; }
    }
    if (b.st !== 'mag' && b.t > 0.6 && d < 1.7 && !player.dead) b.st = 'mag';
    if (b.st === 'mag'){
      const sp = 9 + b.t * 2; m.position.x += dx / Math.max(0.01, d) * Math.min(d, sp * dt); m.position.z += dz / Math.max(0.01, d) * Math.min(d, sp * dt);
      m.position.y += (1.1 - m.position.y) * (1 - Math.exp(-dt * 8)); m.rotation.y += dt * 12; m.visible = true;
      if (d < 0.45){ billN++; billBonus = billN / 5; stat('bills'); if ((meta.stats.bills || 0) >= 300) unlock('bills300'); play('bill');
        if (billN % 5 === 0){ tA.set(hero.position.x, hero.position.y + 2.2, hero.position.z); spawnNumber(tA, '+1 ✦', 'heal', '#ffe070'); }
        scene.remove(m); bills.splice(i, 1); }
    }
  }
}
