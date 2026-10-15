'use strict';
/* ---------- Texturas de círculos mágicos ---------- */
const runeTex7 = texAsset('efectos/circulo-runas');
const alchTex7 = texAsset('efectos/circulo-alquimia');
const starTex7 = texAsset('efectos/circulo-estrella');
const clockTex7 = texAsset('efectos/circulo-reloj');
const stampTex7 = texAsset('efectos/sello-firmado');
const planeGeo7 = new THREE.PlaneGeometry(1, 1);
function decal7(tex, x, y, z, size, col, dur, spin, vertical){
  const m = addMesh7(planeGeo7, addMat7(col, 0, tex)); m.position.set(x, y, z); if (!vertical) m.rotation.x = -Math.PI / 2; m.scale.setScalar(size);
  return ob7({ m, own: true, upd(o, dt){ const k = o.t / dur; if (!vertical) m.rotation.z += dt * (spin || 0);
    m.material.uniforms.uAlpha.value = (k < 0.12 ? k / 0.12 : k > 0.7 ? (1 - k) / 0.3 : 1) * (0.85 + 0.15 * Math.sin(time * 30)); return k >= 1; } });
}

/* ---------- Objetos animados efímeros ---------- */
const OB7 = [];
function ob7(o){ o.t = 0; OB7.push(o); return o; }
function updObjs7(dt){
  for (let i = OB7.length - 1; i >= 0; i--){ const o = OB7[i]; o.t += dt; let done = false;
    try { done = o.upd(o, dt); } catch (err) { console.error(err); done = true; }
    if (done){ endOb7(o); OB7.splice(i, 1); } }
}
function endOb7(o){ try { if (o.end) o.end(o); } catch (err) { console.error(err); }
  if (o.m){ if (o.m.parent) o.m.parent.remove(o.m); if (o.own && o.m.material) o.m.material.dispose(); } }
function clearObjs7(){ for (const o of OB7) endOb7(o); OB7.length = 0; }

/* ---------- Textos de poder (estilo manga) ---------- */
function shout7(text, col, x, y, z){ t7d.set(x, y, z); spawnNumber(t7d, `<span class="s7">${text}</span>`, 'react', col); }
function shoutHero7(text, col, dy){ shout7(text, col, hero.position.x, hero.position.y + (dy || 2.7) * hero.scale.y, hero.position.z); }

/* ---------- Materiales de los accesorios ---------- */
const MA7 = {
  iron: makeMat(0xa8aebb, { emissive: 0.18 }), ironD: makeMat(0x5a5f6a, { emissive: 0.1 }), rivet: makeMat(0xffd27a, { emissive: 0.55 }),
  wingW: makeMat(0xffffff, { emissive: 0.7 }), wingB: makeMat(0xbfe8ff, { emissive: 0.75 }),
  cactus: makeMat(0x4ac04a, { emissive: 0.3 }), cactusD: makeMat(0x2a8a3a, { emissive: 0.2 }), spine: makeMat(0xfff6c8, { emissive: 0.8 }), flower: makeMat(0xff7ac8, { emissive: 0.7 }),
  ice: makeMat(0xbff4ff, { emissive: 0.7, opacity: 0.82 }), stone: makeMat(0xa49a90, { emissive: 0.15 }), core: makeMat(0xff2a4a, { emissive: 1 }),
  clover: makeMat(0x4aff6a, { emissive: 0.75 }), gold: makeMat(0xffd23a, { emissive: 0.7 }), lens: makeMat(0xff4a4a, { emissive: 1, opacity: 0.6 }),
  cupW: makeMat(0xf6f2ea, { emissive: 0.25 }), cupB: makeMat(0x8a5a2a, { emissive: 0.2 }), lid: makeMat(0x3a2418),
  magR: makeMat(0xe82a2a, { emissive: 0.45 }), magS: makeMat(0xe8eef6, { emissive: 0.6 }),
  glass: makeMat(0x9ff6ff, { emissive: 0.75, opacity: 0.62 }), wood: makeMat(0xc08a50, { emissive: 0.25 }), woodD: makeMat(0x5a3a1e), cloth: makeMat(0xeee6d4, { emissive: 0.2 }),
  steel: makeMat(0xe8f0fa, { emissive: 0.55 }), can: makeMat(0x6a6f78, { emissive: 0.1 }),
  milkP: makeMat(0xff9ac8, { emissive: 0.45 }), milkW: makeMat(0xffffff, { emissive: 0.35 }), berry: makeMat(0xff2a5a, { emissive: 0.6 }),
  propY: makeMat(0xffd23a, { emissive: 0.35 }), propR: makeMat(0xe83a3a, { emissive: 0.35 }), dark: makeMat(0x2a2a36), light: makeMat(0xfff2a0, { emissive: 1 }),
  boxR: makeMat(0xe8302a, { emissive: 0.35 }), door: makeMat(0xff8ac8, { emissive: 0.4 }), doorF: makeMat(0xd8589a, { emissive: 0.3 }), knob: makeMat(0xffd23a, { emissive: 0.7 }),
  mirror: makeMat(0xe8faff, { emissive: 0.85 }), vein: makeMat(0xff2222, { emissive: 1 }), eyeR: makeMat(0xff1414, { emissive: 1 }),
  note: makeMat(0xffd84a, { emissive: 0.95 }), ghost: makeMat(0xeef4ff, { emissive: 0.85, opacity: 0.85 }), ghostDS: makeMat(0xeef4ff, { emissive: 0.85, opacity: 0.85, side: THREE.DoubleSide }), ghostE: makeMat(0x16162a),
  bubble: makeMat(0x9fd8ff, { emissive: 0.7, opacity: 0.6 }), crystal: makeMat(0x8ff6ff, { emissive: 1, opacity: 0.88 }),
  green: makeMat(0x4aff6a, { emissive: 0.95 }), red: makeMat(0xff4a4a, { emissive: 0.95 }), pogo: makeMat(0xd8302a, { emissive: 0.35 }),
  meat: makeMat(0xc0642a, { emissive: 0.3 }), bone: makeMat(0xf6eedc, { emissive: 0.35 }), parcel: makeMat(0xc8925a, { emissive: 0.2 }), tape: makeMat(0xe8d8a0, { emissive: 0.3 }),
  fist: makeMat(0xffb060, { emissive: 0.55 }), skin: makeMat(0xf0c09c, { emissive: 0.38 }), sleeve: makeMat(0x3a5ad8, { emissive: 0.25 }), book: makeMat(0x141418), page: makeMat(0xf2eee4, { emissive: 0.4 })
};

/* ---------- Corazón (para Corazón de piedra, trébol, etc.) ---------- */
const heartShape7 = new THREE.Shape();
heartShape7.moveTo(0, -0.5); heartShape7.bezierCurveTo(0.12, -0.32, 0.56, -0.12, 0.5, 0.16); heartShape7.bezierCurveTo(0.44, 0.46, 0.1, 0.46, 0, 0.24);
heartShape7.bezierCurveTo(-0.1, 0.46, -0.44, 0.46, -0.5, 0.16); heartShape7.bezierCurveTo(-0.56, -0.12, -0.12, -0.32, 0, -0.5);
const heartGeo7 = new THREE.ExtrudeGeometry(heartShape7, { depth: 0.2, bevelEnabled: false, curveSegments: 3 }); heartGeo7.translate(0, 0, -0.1);
