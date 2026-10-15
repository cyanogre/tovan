'use strict';
/* ---------- Rayos ---------- */
const BOLT_N = 10;
const bolts = Array.from({ length: 18 }, () => {
  const pos = new Float32Array(BOLT_N * 4 * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(BOLT_N * 12), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(BOLT_N * 8), 2));
  const ix = [];
  for (let i = 0; i < BOLT_N - 1; i++){ const a = i * 4;
    ix.push(a, a + 1, a + 4, a + 1, a + 5, a + 4, a + 2, a + 3, a + 6, a + 3, a + 7, a + 6); }
  g.setIndex(ix);
  const m = new THREE.Mesh(g, makeMat(0xfff6b0, { emissive: 1, opacity: 1, side: THREE.DoubleSide, noFog: true }));
  m.frustumCulled = false; m.visible = false; scene.add(m);
  return { m, pos, g, t: 0, dur: 0.16 };
});
let boltI = 0;
function bolt(ax, ay, az, bx, by, bz, color = 0xfff6b0, w = 0.1){
  const b = bolts[boltI++ % bolts.length];
  const dx = bx - ax, dz = bz - az, len = Math.max(0.001, Math.hypot(dx, dz)), px = -dz / len, pz = dx / len;
  for (let i = 0; i < BOLT_N; i++){
    const k = i / (BOLT_N - 1), j = (i === 0 || i === BOLT_N - 1) ? 0 : 1, amp = Math.sin(k * Math.PI) * 0.55;
    const ox = (rnd() - 0.5) * amp * j, oy = (rnd() - 0.5) * amp * j;
    const x = lerp(ax, bx, k) + px * ox, y = lerp(ay, by, k) + oy, z = lerp(az, bz, k) + pz * ox;
    b.pos.set([x, y + w, z, x, y - w, z, x + px * w, y, z + pz * w, x - px * w, y, z - pz * w], i * 12);
  }
  b.g.attributes.position.needsUpdate = true;
  b.m.material.uniforms.uColor.value.setHex(color); b.m.material.uniforms.uOpacity.value = 1;
  b.m.visible = true; b.t = 0;
}
function updateBolts(dt){
  for (const b of bolts){ if (!b.m.visible) continue; b.t += dt; const k = b.t / b.dur;
    if (k >= 1) b.m.visible = false; else b.m.material.uniforms.uOpacity.value = k < 0.5 ? 1 : 0.95 * (1 - k) * 2; }
}
const rayoJumps = () => setOn('rayo') ? 2 : 0;
const rayoMul = () => setOn('rayo') ? 1.3 : 1;
function nearestFrom(x, z, maxD, excl){
  let b = null, bd = maxD;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || (excl && excl.has(e))) continue;
    const d = Math.hypot(e.g.position.x - x, e.g.position.z - z) - e.r; if (d < bd){ bd = d; b = e; } }
  return b;
}
function chainLightning(sx, sy, sz, first, jumps, base){
  if (!first) return;
  const seen = new Set(); let cur = first, x0 = sx, y0 = sy, z0 = sz, k = 0;
  const step_ = () => {
    if (!cur || !cur.alive || k > jumps){ return; }
    seen.add(cur);
    const ex = cur.g.position.x, ey = 0.9 * cur.scale, ez = cur.g.position.z;
    bolt(x0, y0, z0, ex, ey, ez); bolt(x0, y0, z0, ex, ey, ez, 0xffffff, 0.03);
    lightFlash(ex, 1.2, ez, 0xfff0a0, 1.1, 4); play('zap');
    const d = Math.max(0.001, Math.hypot(ex - x0, ez - z0));
    hitEnemy(cur, rdmg(base * rayoMul()), false, (ex - x0) / d, (ez - z0) / d, 1, 2, false, { src: 'bolt', el: 'shock' });
    x0 = ex; y0 = ey; z0 = ez; k++;
    cur = nearestFrom(ex, ez, 3.8, seen);
    if (cur) later(0.06, step_);
  };
  step_();
}
function skyStrike(e, base){
  if (!e || !e.alive) return;
  const x = e.g.position.x, z = e.g.position.z;
  bolt(x + (rnd() - 0.5) * 2, 9, z + (rnd() - 0.5) * 2, x, 0.3, z, 0xfff6b0, 0.12); bolt(x, 9, z, x, 0.3, z, 0xffffff, 0.04);
  ringFx(x, z, 0xfff27a, 0.2, 1.4, 0.3); sparks(x, 0.4, z, 8, 0xfff6b0, 4);
  lightFlash(x, 2, z, 0xfff0a0, 1.6, 6); play('zap'); shake = Math.min(0.6, shake + 0.08);
  hitEnemy(e, rdmg(base * rayoMul()), false, 0, 0, 2, 2, false, { src: 'bolt', el: 'shock' });
}
