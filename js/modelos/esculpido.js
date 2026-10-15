'use strict';
/* ======================================================================
   MODELOS v3: enemigos esculpidos con anillos facetados (como la cabeza
   de Tovan). Nada de cajas: torsos en V, músculos, cabezas con cara.
   ====================================================================== */
// anillos: [altura, mediaAnchura, profFrente, profAtrás, dx, dProf]
// eje 'y' (por defecto): profundidad = z.  eje 'z': altura = z, profundidad = y (frente = arriba)
function sculptGeos(rings, o = {}){
  const n = o.n || 8, ph = o.ph != null ? o.ph : Math.PI / n, su = o.su || 1, sv = o.sv || 1, axZ = o.axis === 'z';
  const rs = rings.slice().sort((a, b) => a[0] - b[0]);
  const h0 = rs[0][0], h1 = rs[rs.length - 1][0], H = (h1 - h0) || 1;
  const P = (h, x, d) => axZ ? new V3(x, d, h) : new V3(x, h, d);
  const R = rs.map(([h, w, df, db, dx = 0, dd = 0]) => { const pts = [];
    for (let k = 0; k <= n; k++){ const a = k / n * TAU + ph, s = Math.sin(a), c = Math.cos(a); const p = P(h, s * w + dx, (c >= 0 ? c * df : c * db) + dd); p.u = k / n; p.v = (h - h0) / H; pts.push(p); }
    pts.c = P(h, dx, dd); return pts; });
  const axis = axZ ? new V3(0, 0, 1) : new V3(0, 1, 0);
  const side = [], caps = [];
  for (let i = 0; i < R.length - 1; i++){ const cen = R[i].c.clone().add(R[i + 1].c).multiplyScalar(0.5);
    for (let k = 0; k < n; k++){ const a = R[i][k], b = R[i][k + 1], c = R[i + 1][k + 1], d = R[i + 1][k]; side.push([a, b, c, cen], [a, c, d, cen]); } }
  const capT = o.capT != null ? o.capT : 0.35, capB = o.capB != null ? o.capB : 0.35;
  const last = R[R.length - 1], first = R[0];
  if (capT >= 0){ const span = Math.max(...last.slice(0, n).map(p => p.distanceTo(last.c))); const top = last.c.clone().addScaledVector(axis, span * capT); top.u = 0.5; top.v = 1;
    for (let k = 0; k < n; k++) caps.push([last[k], last[k + 1], top, 1]); }
  if (capB >= 0){ const span = Math.max(...first.slice(0, n).map(p => p.distanceTo(first.c))); const bot = first.c.clone().addScaledVector(axis, -span * capB); bot.u = 0.5; bot.v = 0;
    for (let k = 0; k < n; k++) caps.push([first[k + 1], first[k], bot, -1]); }
  const e1 = new V3(), e2 = new V3(), nn = new V3(), cc = new V3();
  const main = { pos: [], uv: [] }, face = { pos: [], uv: [] }, fb = o.face && o.face.box;
  const emit = (t, flipTest) => {
    let [a, b, c] = t; e1.subVectors(b, a); e2.subVectors(c, a); nn.crossVectors(e1, e2); cc.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (flipTest(nn, cc)){ const tmp = b; b = c; c = tmp; nn.negate(); }
    nn.normalize();
    const toFace = fb && o.face.test(cc, nn), dst = toFace ? face : main;
    for (const p of [a, b, c]){ dst.pos.push(p.x, p.y, p.z);
      if (toFace) dst.uv.push((p.x - fb[0]) / (fb[1] - fb[0]), ((axZ ? p.z : p.y) - fb[2]) / (fb[3] - fb[2]));
      else dst.uv.push(p.u * su, p.v * sv); }
  };
  for (const t of side) emit(t, (nrm, cen) => { const out = cen.clone().sub(t[3]); out.addScaledVector(axis, -out.dot(axis)); return nrm.dot(out) < 0; });
  for (const t of caps) emit(t, nrm => nrm.dot(axis) * t[3] < 0);
  const toGeo = d => { if (!d.pos.length) return null; const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2)); g.computeVertexNormals(); return g; };
  return { main: toGeo(main), face: toGeo(face) };
}
function sculpt(parent, rings, mat, o = {}){
  const { main, face } = sculptGeos(rings, o);
  const m = mesh(main, mat, o.x || 0, o.y || 0, o.z || 0, parent);
  if (face && o.faceMat) mesh(face, o.faceMat, 0, 0, 0, m);
  if (o.rx || o.ry || o.rz) m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
  if (o.s) m.scale.set(...o.s);
  return m;
}
// bulto orgánico (puños, rodillas, hombreras)
function lump(parent, r, mat, x, y, z, sx = 1, sy = 1, sz = 1, kind = 'd'){
  const geo = kind === 'i' ? new THREE.IcosahedronGeometry(r, 0) : kind === 'o' ? new THREE.OctahedronGeometry(r, 0) : new THREE.DodecahedronGeometry(r, 0);
  const m = mesh(geo, mat, x, y, z, parent); m.scale.set(sx, sy, sz); return m;
}
// cabeza con cara proyectada de frente
function sculptHead(parent, rings, skinMat, faceMat, box, o = {}){
  const test = o.test || ((c, nrm) => nrm.z > (o.nz || 0.42) && c.y > box[2] + 0.01 && c.y < box[3] - 0.01);
  return sculpt(parent, rings, skinMat, Object.assign({ n: 8, faceMat, face: { box, test } }, o));
}
