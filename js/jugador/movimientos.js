'use strict';
/* ---------- Bastón: espalda ↔ mano ---------- */
const staffTip = new THREE.Object3D(); staffTip.position.y = 0.92; staff.add(staffTip);
const staffMid = new THREE.Object3D(); staffMid.position.y = 0.2; staff.add(staffMid);
let staffInHand = false;
function staffToHand(){ if (staffInHand) return; P.armR.el.add(staff); staff.position.set(0, -0.84, 0.02); staff.rotation.set(Math.PI, 0, 0); staffInHand = true; }
function staffToBack(){ if (!staffInHand) return; P.spine.add(staff); staff.position.set(0, 0.3, -0.33); staff.rotation.set(0.06, 0, 0.72); staffInHand = false; }

/* ---------- Movimientos (tiempos normalizados 0..1) ---------- */
const HOLD = { shX: -1.1, shY: 0.6, elX: -0.3, spY: 0.2, spX: 0.08, dy: -0.03 };
const pose = o => Object.assign({}, HOLD, o);
const A_END = pose({ shX: -1.2, shY: -1.0, spY: -0.5, spX: 0.1, elX: -0.2, dy: -0.05 });
const B_END = pose({ shX: -1.1, shY: 1.2, spY: 0.5, spX: 0.08, dy: -0.05 });
const SPIN_OUT = pose({ shX: -1.5, shY: 1.6, spY: 0.4, spX: 0.05, elX: -0.05, dy: -0.06 });
const MV = {
  a: { dur: 0.42, hit: 0.5, trail: [0.28, 0.66], lunge: [0.3, 0.6, 0.35], dmg: [26, 34], range: 2.4, cone: 0.15, meter: 6, knock: 2.5,
       keys: [[0, HOLD], [0.3, pose({ shX: -1.35, shY: 1.7, spY: 0.6, spX: 0, elX: -0.2, dy: -0.02 })],
              [0.6, pose({ shX: -1.45, shY: -1.2, spY: -0.7, spX: 0.12, elX: -0.05, dy: -0.08 })], [1, A_END]] },
  b: { dur: 0.42, hit: 0.48, trail: [0.26, 0.64], lunge: [0.28, 0.58, 0.35], dmg: [28, 36], range: 2.4, cone: 0.15, meter: 6, knock: 2.5,
       keys: [[0, A_END], [0.28, pose({ shX: -1.5, shY: -1.7, spY: -0.8, spX: 0.05 })],
              [0.58, pose({ shX: -1.3, shY: 1.5, spY: 0.7, spX: 0.12, dy: -0.08 })], [1, B_END]] },
  spin: { dur: 0.55, hit: 0.55, trail: [0.2, 0.8], lunge: [0.2, 0.7, 0.3], dmg: [30, 40], range: 2.5, cone: -2, meter: 8, knock: 3.5, noNeck: true,
       keys: [[0, B_END], [0.2, SPIN_OUT], [0.8, pose({ shX: -1.5, shY: 1.6, spY: 0.4 - TAU, spX: 0.05, elX: -0.05, dy: -0.08 })],
              [0.999, pose({ shX: -1.3, shY: 1.3, spY: 0.4 - TAU, spX: 0.08, dy: -0.05 })], [1, pose({ shX: -1.3, shY: 1.3, spY: 0.4, spX: 0.08, dy: -0.05 })]] },
  slam: { dur: 0.75, hit: 0.49, trail: [0.36, 0.53], lunge: [0.36, 0.5, 0.4], dmg: [55, 70], range: 2.7, slam: true, meter: 10, knock: 6,
       keys: [[0, B_END], [0.2, pose({ shX: -3.3, shY: 0.25, spY: 0.1, spX: -0.25, elX: -0.1, dy: 0.03 })],
              [0.36, pose({ shX: -3.5, shY: 0.25, spY: 0.1, spX: -0.3, elX: -0.1, dy: 0.04 })],
              [0.5, pose({ shX: -1.32, shY: 0.12, spY: 0, spX: 0.38, elX: -0.05, dy: -0.2 })],
              [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  special: { dur: 0.95, hit: 0.66, trail: [0.56, 0.68], lunge: [0, 0, 0], dmg: [140, 170], range: 4.2, slam: true, special: true, meter: 0, knock: 9,
       keys: [[0, HOLD], [0.3, pose({ shX: -3.2, shY: 0, spY: 0, spX: -0.25, elX: -0.05, dy: 0.04 })],
              [0.55, pose({ shX: -3.25, shY: 0, spY: 0, spX: -0.3, elX: 0, dy: 0.05 })],
              [0.68, pose({ shX: -1.3, shY: 0.1, spY: 0, spX: 0.35, dy: -0.2 })], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] }
};
const comboSeq = () => weaponSeq();
let curPose = Object.assign({}, HOLD);
function samplePose(keysArr, t){
  for (let i = 0; i < keysArr.length - 1; i++){
    const [t0, a] = keysArr[i], [t1, b] = keysArr[i + 1];
    if (t <= t1){ const e = smooth(clamp((t - t0) / (t1 - t0), 0, 1)); const o = {}; for (const k in a) o[k] = lerp(a[k], b[k], e); return o; }
  }
  return Object.assign({}, keysArr[keysArr.length - 1][1]);
}

/* ---------- Apoyo al suelo ---------- */
const staffMeshes = new Set(); staff.traverse(o => { if (o.isMesh) staffMeshes.add(o); });
const heroBoxes = []; hero.traverse(o => { if (o.isMesh && !staffMeshes.has(o)){ o.geometry.computeBoundingBox(); heroBoxes.push(o); } });
const _bb = new THREE.Box3();
function heroMinY(){
  hero.updateMatrixWorld(true); let m = Infinity;
  for (const o of heroBoxes){ _bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); if (_bb.min.y < m) m = _bb.min.y; }
  return m;
}
