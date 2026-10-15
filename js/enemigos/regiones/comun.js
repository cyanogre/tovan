'use strict';
/* ======================================================================
   ENEMIGOS v5: cada nivel con sus bichos propios (gárgolas, yokais,
   muñecos de nieve, pingüinos, drones, fans, cangrejos, ventanas
   emergentes, cursores y ninjas), y los ogros por fin parpadean
   ====================================================================== */
const EN = { lobs: [], beams: [] };
const tele5 = () => redTele();
const sideMat = (c, em = 0) => { const m = makeMat(c, { emissive: em, side: THREE.DoubleSide }); return { m, c, base: c, em }; };
const lineTele = () => { const m = mesh(teleGeo, tele5(), 0, 0.05, 0); m.visible = false; return m; };
const circTele = () => { const m = mesh(circleGeo, tele5(), 0, 0.05, 0); m.visible = false; return m; };
const pulse = m => { m.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); };
const showLine = (m, x, z, a, w, len) => { m.visible = true; m.position.set(x, 0.05, z); m.rotation.y = a; m.scale.set(w, 1, len); pulse(m); };
const showCirc = (m, x, z, r) => { m.visible = true; m.position.set(x, 0.05, z); m.scale.setScalar(r); pulse(m); };
const hurtAt = (x, z, r, dmg, kn, yMax = 0.9) => { if (Math.hypot(hero.position.x - x, hero.position.z - z) < r && hero.position.y < yMax) return hurtPlayer(dmg, x, z, kn); return 'none'; };
function inLineHit(x, z, a, len, w){ const ex = hero.position.x - x, ez = hero.position.z - z, fx = Math.sin(a), fz = Math.cos(a), along = ex * fx + ez * fz; return along > 0 && along < len && Math.abs(ex * fz - ez * fx) < w; }
function shoot5(e, a, sp, dmg, geo, mat, y = 1.05, life = 3){ const m = mesh(geo, mat, e.g.position.x + Math.sin(a) * 0.6, y, e.g.position.z + Math.cos(a) * 0.6);
  projectiles.push({ m, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, life, owner: 'enemy', dmg }); return m; }
function lob5(from, to, dur, dmg, mat, geo, onLand){
  const c = circTele(); c.visible = true; c.position.set(to.x, 0.05, to.z); c.scale.setScalar(1.2);
  EN.lobs.push({ m: mesh(geo, mat, from.x, from.y, from.z), from: from.clone(), to: to.clone(), t: 0, dur, dmg, c, onLand });
}
const dropOf = { gargoyle: 0.16, kasa: 0.18, chochin: 0.15, snowman: 0.3, penguin: 0.12, drone: 0.15, fanatic: 0.18, crab: 0.3, popup: 0.14, cursor: 0.12, ninja: 0.18 };
