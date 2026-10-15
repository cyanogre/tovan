'use strict';
/* ---------- Estela del bastón ---------- */
const TN = 16;
const trailPos = new Float32Array(TN * 6);
const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3).setUsage(THREE.DynamicDrawUsage));
trailGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(TN * 6), 3));
trailGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(TN * 4), 2));
{ const ix = []; for (let i = 0; i < TN - 1; i++){ const a = i * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } trailGeo.setIndex(ix); }
const trailMat = makeMat(0xd8fbff, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide });
const trail = new THREE.Mesh(trailGeo, trailMat); trail.frustumCulled = false; trail.visible = false; scene.add(trail);
const trailSamples = []; let trailAlpha = 0;
function pushTrail(a, b){ trailSamples.push([a.clone(), b.clone()]); if (trailSamples.length > TN) trailSamples.shift(); }
function updateTrail(){
  const n = trailSamples.length;
  if (n < 2 || trailAlpha <= 0.02){ trail.visible = false; return; }
  trail.visible = true;
  for (let i = 0; i < TN; i++){ const s = trailSamples[Math.min(i, n - 1)]; trailPos.set([s[0].x, s[0].y, s[0].z, s[1].x, s[1].y, s[1].z], i * 6); }
  trailGeo.attributes.position.needsUpdate = true;
  trailMat.uniforms.uOpacity.value = 0.85 * trailAlpha;
  if (meta.cos && (meta.cos.effect === 'rainbow' || meta.cos.effect === 'rainbow2')) trailMat.uniforms.uColor.value.setHSL((time * 0.9) % 1, 0.9, 0.62);
  else trailMat.uniforms.uColor.value.setHex(TRAIL_COLS[Math.min(comboTier, TRAIL_COLS.length - 1)]);
}

/* ---------- Partículas y anillos ---------- */
const fxPool = Array.from({ length: 140 }, () => {
  const m = mesh(B(1, 1, 1), makeMat(0xffffff, { emissive: 1, opacity: 1 }), 0, -10, 0);
  m.visible = false; m.userData = { life: 0, max: 1, vel: new V3(), grav: 0, grow: 0, size: 0.1 }; return m;
});
let fxI = 0;
function spawnFx(x, y, z, vx, vy_, vz, color, size, life, grav = 0, grow = 0){
  const m = fxPool[fxI++ % fxPool.length], u = m.userData;
  m.visible = true; m.position.set(x, y, z); u.vel.set(vx, vy_, vz); u.life = u.max = life; u.grav = grav; u.grow = grow; u.size = size;
  m.material.uniforms.uColor.value.setHex(color); m.scale.setScalar(size); m.rotation.set(rnd() * 3, rnd() * 3, 0);
}
function puffAt(x, z, n, spread = 1.2, color = 0xb8a898){
  for (let i = 0; i < n; i++){ const a = rnd() * TAU;
    spawnFx(x + Math.cos(a) * 0.2, 0.08, z + Math.sin(a) * 0.2, Math.cos(a) * spread, 0.35 + rnd() * 0.3, Math.sin(a) * spread, color, 0.1, 0.45, 0, 1.6); }
}
const puff = (n, spread) => puffAt(hero.position.x, hero.position.z, n, spread);
function sparks(x, y, z, n, color = 0xfff0a0, speed = 3.5){
  for (let i = 0; i < n; i++){ const a = rnd() * TAU, e = rnd() * 1.2;
    spawnFx(x, y, z, Math.cos(a) * speed, 1.5 + e * 3, Math.sin(a) * speed, color, 0.06, 0.35, 12, 0); }
}
const vRings = Array.from({ length: 10 }, () => {
  const m = mesh(new THREE.RingGeometry(0.86, 1, 24), makeMat(0xffffff, { emissive: 1, opacity: 0.9, side: THREE.DoubleSide }), 0, 0.05, 0);
  m.rotation.x = -Math.PI / 2; m.visible = false; m.userData = { t: 0, dur: 0.4, r0: 0.2, r1: 3 }; return m;
});
let vrI = 0;
function ringFx(x, z, color, r0, r1, dur, y = 0.05){
  const m = vRings[vrI++ % vRings.length]; m.visible = true; m.position.set(x, y, z);
  m.material.uniforms.uColor.value.setHex(color); Object.assign(m.userData, { t: 0, dur, r0, r1 }); m.scale.setScalar(Math.max(0.01, r0));
}

/* ---------- Números flotantes y avisos ---------- */
const dmgLayer = document.getElementById('dmg');
const nums = [];
function spawnNumber(pos, text, cls = '', color){
  if (nums.length > 44){ const o = nums.shift(); o.el.remove(); }
  const el = document.createElement('div'); el.className = 'dmg ' + cls;
  el.innerHTML = cls === 'crit' ? `<small>¡Crítico!</small>${text}` : String(text);
  if (color) el.style.color = color;
  dmgLayer.appendChild(el);
  nums.push({ el, pos: pos.clone().add(new V3((rnd() - 0.5) * 0.3, 0.2, 0)), t: 0 });
}
const bannerEl = document.getElementById('banner');
function banner(html, dur = 1.6){ bannerEl.innerHTML = html; bannerEl.hidden = false; bannerEl.style.opacity = '1'; bannerT = dur; }
const flashEl = document.getElementById('flash');
function flash(color, a){ flashColor = color; flashA = a; flashEl.style.background = color; }
