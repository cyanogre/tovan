'use strict';
/* ---------- Personaje: Tovan ---------- */
const hero = new THREE.Group(); scene.add(hero);
const P = {};
P.body = new THREE.Group(); P.body.position.y = 0.62; hero.add(P.body);
const bodyOff = new THREE.Group(); bodyOff.position.y = -0.62; P.body.add(bodyOff);
P.hips = new THREE.Group(); P.hips.position.y = 0.67; bodyOff.add(P.hips);
mesh(B(0.46, 0.2, 0.28), M.pants, 0, 0, 0, P.hips);
P.tail = mesh(C(0.25, 0.4, 0.46, 5, true, 0.55, Math.PI * 2 - 1.1), M.coatDS, 0, -0.18, 0, P.hips);

function leg(side){
  const hip = new THREE.Group(); hip.position.set(0.12 * side, -0.06, 0); P.hips.add(hip);
  mesh(B(0.18, 0.28, 0.2), M.pants, 0, -0.14, 0, hip);
  const knee = new THREE.Group(); knee.position.y = -0.28; hip.add(knee);
  mesh(B(0.16, 0.1, 0.17), M.pants, 0, -0.03, 0, knee);
  mesh(B(0.23, 0.2, 0.24), M.boot, 0, -0.15, 0, knee);
  mesh(B(0.245, 0.05, 0.255), M.gold, 0, -0.05, 0, knee);
  mesh(B(0.25, 0.12, 0.38), M.boot, 0, -0.27, 0.06, knee);
  mesh(B(0.2, 0.04, 0.08), M.gold, 0, -0.2, 0.24, knee);
  return { hip, knee };
}
P.legL = leg(-1); P.legR = leg(1);

P.spine = new THREE.Group(); P.spine.position.y = 0.08; P.hips.add(P.spine);
const rot6 = m => { m.rotation.y = Math.PI / 6; return m; };
rot6(mesh(C(0.26, 0.23, 0.12, 6), M.belt, 0, 0.02, 0, P.spine));
mesh(B(0.1, 0.09, 0.04), M.gold, 0, 0.02, 0.235, P.spine);
rot6(mesh(C(0.31, 0.24, 0.46, 6), M.coat, 0, 0.3, 0, P.spine));
const emblem = mesh(B(0.07, 0.07, 0.02), M.gold, 0, 0.42, 0.262, P.spine); emblem.rotation.z = Math.PI / 4;
rot6(mesh(C(0.2, 0.31, 0.08, 6), M.coat, 0, 0.57, 0, P.spine));
rot6(mesh(C(0.17, 0.22, 0.13, 6), M.scarf, 0, 0.645, 0, P.spine));
mesh(C(0.08, 0.09, 0.3, 5), M.skin, 0, 0.82, -0.02, P.spine);   // cuello: llega hasta la nuca

// cola de la bufanda
P.scarf = [];
{
  let parent = new THREE.Group(); parent.position.set(0.1, 0.63, -0.17); P.spine.add(parent); P.scarf.push(parent);
  for (let i = 0; i < 3; i++){
    mesh(B(0.12 - i * 0.015, 0.2, 0.035), M.scarf, 0, -0.1, 0, parent);
    if (i < 2){ const n = new THREE.Group(); n.position.y = -0.2; parent.add(n); parent = n; P.scarf.push(n); }
  }
}

// cabeza
P.neck = new THREE.Group(); P.neck.position.y = 0.71; P.neck.scale.set(1.45, 1.42, 1.45); P.spine.add(P.neck);
// Cabeza modelada "a mano": anillos de 8 vértices, mandíbula en V y barbilla en punta.
function buildHead(){
  // [y, zFrente, [x,z] diagonal delantera, [x,z] lateral, [x,z] diagonal trasera, zNuca, desplazamiento y por punto]
  const rings = [
    [-0.19, 0.15, [0.08, 0.12], [0.13, 0.02], [0.10, -0.08], -0.11, [-0.03, -0.02, 0.05, 0.06, 0.06]], // barbilla y mandíbula
    [-0.08, 0.20, [0.15, 0.16], [0.20, 0.03], [0.15, -0.13], -0.17, [0, 0, 0, 0, 0]],                 // mejillas
    [ 0.06, 0.20, [0.17, 0.16], [0.22, 0.02], [0.18, -0.15], -0.20, [0, 0, 0, 0, 0]],                 // ojos (lo más ancho)
    [ 0.18, 0.17, [0.16, 0.13], [0.21, 0.00], [0.17, -0.16], -0.20, [0, 0, 0, 0, 0]],                 // frente
    [ 0.26, 0.10, [0.10, 0.08], [0.14, -0.02], [0.11, -0.12], -0.14, [0, 0, 0, 0, 0]]                 // coronilla
  ];
  const idx = [0, 1, 2, 3, 4, 3, 2, 1], sgn = [1, 1, 1, 1, 1, -1, -1, -1];
  const pts = rings.map(([y, zf, fd, sd, bd, zb, dy]) => {
    const base = [[0, zf], fd, sd, bd, [0, zb]];
    return idx.map((j, k) => new THREE.Vector3(base[j][0] * sgn[k], y + dy[j], base[j][1]));
  });
  const top = new THREE.Vector3(0, 0.29, -0.03), bot = new THREE.Vector3(0, -0.16, -0.02);
  const tris = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++){
    const a = pts[i][k], b = pts[i][(k + 1) % 8], c = pts[i + 1][(k + 1) % 8], d = pts[i + 1][k];
    tris.push([a, b, c], [a, c, d]);
  }
  const lastR = pts[pts.length - 1];
  for (let k = 0; k < 8; k++){ tris.push([lastR[k], lastR[(k + 1) % 8], top]); tris.push([pts[0][(k + 1) % 8], pts[0][k], bot]); }

  const center = new THREE.Vector3(0, 0.03, 0), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3(), cen = new THREE.Vector3();
  const buckets = { face: [], hair: [], skin: [] };
  for (let t of tris){
    e1.subVectors(t[1], t[0]); e2.subVectors(t[2], t[0]); n.crossVectors(e1, e2);
    cen.copy(t[0]).add(t[1]).add(t[2]).multiplyScalar(1 / 3);
    if (n.dot(e1.copy(cen).sub(center)) < 0){ t = [t[0], t[2], t[1]]; n.negate(); }
    n.normalize();
    const key = (n.z > 0.42 && cen.y < 0.2) ? 'face' : (cen.y > -0.02 || cen.z < -0.07) ? 'hair' : 'skin';
    buckets[key].push(t);
  }
  const toGeo = (list, uvFn) => {
    const pos = [], uv = [];
    for (const t of list) for (const p of t){ pos.push(p.x, p.y, p.z); const q = uvFn(p); uv.push(q[0], q[1]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();   // sin índices → sombreado facetado
    return g;
  };
  const head = new THREE.Group();
  mesh(toGeo(buckets.face, p => [(p.x + 0.23) / 0.46, (p.y + 0.25) / 0.54]), M.face, 0, 0, 0, head); // proyección frontal
  mesh(toGeo(buckets.hair, p => [(p.x + p.z) * 3, p.y * 3]), M.hair, 0, 0, 0, head);
  mesh(toGeo(buckets.skin, () => [0, 0]), M.skin, 0, 0, 0, head);
  return head;
}
const headMesh = buildHead(); headMesh.position.set(0, 0.26, 0.02); P.neck.add(headMesh);
for (const s of [-1, 1]) mesh(B(0.06, 0.26, 0.13), M.hair, 0.215 * s, 0.32, 0.08, P.neck);
const spikes = [
  [ 0.00, 0.58,-0.02,-0.5, 0.0, 0.10, 0.26],
  [ 0.14, 0.56, 0.05,-0.3,-0.6, 0.09, 0.22],
  [-0.14, 0.56, 0.05,-0.3, 0.6, 0.09, 0.22],
  [ 0.07, 0.54,-0.14,-1.1,-0.2, 0.10, 0.28],
  [-0.09, 0.54,-0.14,-1.1, 0.3, 0.10, 0.26],
  [ 0.21, 0.46,-0.08,-0.4,-1.2, 0.08, 0.20],
  [-0.21, 0.46,-0.08,-0.4, 1.2, 0.08, 0.20]
];
for (const [x,y,z,rx,rz,r,h] of spikes){ const m = mesh(new THREE.ConeGeometry(r, h, 4), M.hair, x, y, z, P.neck); m.rotation.set(rx, 0, rz); }
for (const [x, h] of [[-0.15, 0.17], [-0.05, 0.2], [0.06, 0.16], [0.16, 0.19]]){
  const m = mesh(new THREE.ConeGeometry(0.065, h * 0.85, 4), M.hair, x, 0.46, 0.19, P.neck); m.rotation.set(Math.PI - 0.5, 0, x * 0.8);
}
mesh(new THREE.OctahedronGeometry(0.025, 0), M.gold, 0.2, 0.17, 0.02, P.neck);
P.ahoge = new THREE.Group(); P.ahoge.position.set(0.02, 0.54, 0.03); P.neck.add(P.ahoge);
{ const a1 = mesh(new THREE.ConeGeometry(0.04, 0.24, 3), M.hair, 0, 0.1, 0, P.ahoge); a1.rotation.z = -0.25; }

// coleta
P.tailHair = [];
{
  let parent = new THREE.Group(); parent.position.set(0, 0.42, -0.21); P.neck.add(parent); P.tailHair.push(parent);
  mesh(C(0.07, 0.07, 0.05, 6), M.gold, 0, 0, 0, parent);
  const radii = [[0.075, 0.06], [0.06, 0.045], [0.045, 0.02]];
  radii.forEach(([a, b], i) => {
    mesh(C(a, b, 0.2, 5), M.hair, 0, -0.1, 0, parent);
    if (i < 2){ const n = new THREE.Group(); n.position.y = -0.2; parent.add(n); parent = n; P.tailHair.push(n); }
  });
}

// brazos
function arm(side){
  const sh = new THREE.Group(); sh.position.set(0.36 * side, 0.5, 0); P.spine.add(sh);
  mesh(B(0.24, 0.14, 0.28), M.coat, 0.03 * side, 0.06, 0, sh);
  mesh(B(0.25, 0.035, 0.29), M.gold, 0.03 * side, -0.005, 0, sh);
  mesh(B(0.13, 0.22, 0.14), M.coat, 0, -0.11, 0, sh);
  const el = new THREE.Group(); el.position.y = -0.22; sh.add(el);
  mesh(B(0.16, 0.16, 0.17), M.coat, 0, -0.07, 0, el);
  mesh(B(0.18, 0.05, 0.19), M.gold, 0, -0.15, 0, el);
  mesh(B(0.22, 0.2, 0.18), M.glove, 0, -0.27, 0.01, el);
  mesh(B(0.06, 0.1, 0.07), M.glove, -0.09 * side, -0.23, 0.08, el);
  sh.rotation.z = 0.14 * side;
  return { sh, el };
}
P.armL = arm(-1); P.armR = arm(1);
P.armR.sh.rotation.order = 'YXZ';   // permite barridos horizontales con el bastón

// bastón-linterna a la espalda
const staff = new THREE.Group(); staff.position.set(0, 0.3, -0.33); staff.rotation.set(0.06, 0, 0.72); P.spine.add(staff);
mesh(C(0.025, 0.025, 1.5, 5), M.wood, 0, 0, 0, staff);
mesh(C(0.04, 0.04, 0.08, 6), M.gold, 0, -0.73, 0, staff);
const lamp = new THREE.Group(); lamp.position.y = 0.78; staff.add(lamp);
mesh(C(0.06, 0.03, 0.08, 6), M.gold, 0, -0.03, 0, lamp);
for (let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2; mesh(B(0.015, 0.22, 0.015), M.gold, Math.cos(a) * 0.08, 0.1, Math.sin(a) * 0.08, lamp); }
mesh(C(0.03, 0.1, 0.04, 6), M.gold, 0, 0.22, 0, lamp);
const crystal = mesh(new THREE.OctahedronGeometry(0.065, 0), M.crystal, 0, 0.1, 0, lamp);

// sombra de gota
const blob = mesh(new THREE.PlaneGeometry(1.15, 1.15), M.shadow, 0, 0.025, 0);
blob.rotation.x = -Math.PI / 2;
