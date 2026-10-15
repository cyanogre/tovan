'use strict';
/* ---------- Oni azul con kanabō ---------- */
const circleGeo = new THREE.CircleGeometry(1, 20); circleGeo.rotateX(-Math.PI / 2);
function makeOni(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x3f6fd8], [0x1c1c2c], [0xffe040, 1], [0xf0e6c8], [0xe09a28], [0x4a4450], [0x2a4aa0]]);
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.24 * s, 0.5, 0); body.add(L);
    mesh(B(0.3, 0.36, 0.32), S[0].m, 0, -0.12, 0, L); mesh(B(0.32, 0.14, 0.42), S[6].m, 0, -0.43, 0.05, L); return L; });
  mesh(B(0.74, 0.3, 0.52), S[4].m, 0, 0.56, 0, body);
  for (let i = 0; i < 3; i++) mesh(B(0.06, 0.28, 0.02), S[1].m, -0.22 + i * 0.22, 0.56, 0.27, body);
  const torso = new THREE.Group(); torso.position.y = 0.7; body.add(torso);
  mesh(B(0.86, 0.62, 0.54), S[0].m, 0, 0.34, 0, torso);
  mesh(B(0.5, 0.26, 0.06), S[6].m, 0, 0.22, 0.28, torso);
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
  mesh(B(0.48, 0.44, 0.44), S[0].m, 0, 0.2, 0.02, head);
  for (let i = 0; i < 5; i++){ const c = mesh(new THREE.ConeGeometry(0.1, 0.34, 4), S[1].m, (i - 2) * 0.1, 0.46, -0.08 - Math.abs(i - 2) * 0.02, head); c.rotation.set(-0.6, 0, (i - 2) * -0.35); }
  for (const s of [-1, 1]){
    const h = mesh(new THREE.ConeGeometry(0.06, 0.3, 4), S[3].m, 0.15 * s, 0.5, 0.06, head); h.rotation.z = -0.35 * s;
    mesh(B(0.1, 0.06, 0.04), S[2].m, 0.11 * s, 0.25, 0.24, head);
    const t = mesh(new THREE.ConeGeometry(0.03, 0.1, 4), S[3].m, 0.09 * s, 0.1, 0.25, head); t.rotation.x = 0.1;
  }
  const brow = mesh(B(0.38, 0.06, 0.06), S[1].m, 0, 0.31, 0.23, head); brow.rotation.x = 0.2;
  mesh(B(0.26, 0.05, 0.04), S[1].m, 0, 0.08, 0.24, head);
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.54 * s, 0.56, 0); torso.add(A);
    mesh(B(0.26, 0.44, 0.28), S[0].m, 0, -0.2, 0, A); mesh(B(0.28, 0.06, 0.3), S[4].m, 0, -0.36, 0, A); mesh(B(0.3, 0.27, 0.3), S[0].m, 0, -0.52, 0.02, A); return A; });
  const club = new THREE.Group(); club.position.set(0, -0.52, 0.08); club.rotation.x = 1.45; arms[1].add(club);
  mesh(C(0.05, 0.05, 0.4, 6), S[1].m, 0, 0.1, 0, club);
  mesh(C(0.17, 0.08, 1.3, 6), S[5].m, 0, 0.9, 0, club);
  for (let i = 0; i < 10; i++){ const a = i / 5 * TAU, y = 0.55 + (i % 5) * 0.16 + (i > 4 ? 0.08 : 0);
    mesh(B(0.06, 0.06, 0.06), S[3].m, Math.cos(a) * 0.15, y, Math.sin(a) * 0.15, club); }
  const tele = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); tele.visible = false;
  const sc = 1.2; g.scale.setScalar(sc);
  return newEnemy('oni', g, body, S, { hp: 170, r: 0.55 * sc, speed: 1.75, numY: 2.4 * sc, legs, arms, torso, tele, heavy: true, scale: sc, eye: S[2] });
}
function updOni(e, dt, dist, toP, face, move){
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.5 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const to = (o, v, k = 10) => { o.rotation.x = lerp(o.rotation.x, v, 1 - Math.exp(-dt * k)); };
  const R = e.arms[1], L = e.arms[0];
  e.tele.visible = false;
  if (e.state === 'hurt'){ e.torso.rotation.x = -0.2; if (e.t <= 0) e.state = 'chase'; return; }
  if (e.state === 'chase'){
    face(toP, 6); e.torso.rotation.x = 0.1; to(R, -0.35 + Math.sin(time * 5) * 0.1); to(L, Math.sin(time * 5) * 0.25);
    if (!player.dead && dist > 1.8){ move(toP, e.speed); walk(7); } else walk(0);
    if (!player.dead && dist < 2.7 && e.cd <= 0){ e.state = 'windup'; e.t = 0.85; e.hitOnce = false; play('oniRoar'); }
  } else if (e.state === 'windup'){
    if (e.t > 0.35) face(toP, 8);
    const a = e.g.rotation.y, reach = 1.55 * e.scale / 1.2;
    e.ix = e.g.position.x + Math.sin(a) * reach; e.iz = e.g.position.z + Math.cos(a) * reach;
    e.tele.visible = true; e.tele.position.set(e.ix, 0.05, e.iz); e.tele.scale.setScalar(1.35);
    e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
    to(R, -3.0, 8); to(L, -0.6, 8); e.torso.rotation.x = -0.25; walk(0);
    if (e.t <= 0){ e.state = 'smash'; e.t = 0.18; }
  } else if (e.state === 'smash'){
    to(R, -0.5, 30); e.torso.rotation.x = 0.35;
    if (!e.hitOnce && e.t <= 0.1){ e.hitOnce = true;
      ringFx(e.ix, e.iz, 0xffa060, 0.2, 1.7, 0.3); puffAt(e.ix, e.iz, 8, 2); shake = Math.max(shake, 0.18); play('slam');
      if (Math.hypot(hero.position.x - e.ix, hero.position.z - e.iz) < 1.65 && hero.position.y < 0.8) hurtPlayer(18 * e.dm, e.ix, e.iz, 7); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.9; }
  } else if (e.state === 'recover'){ to(R, -0.4, 4); e.torso.rotation.x = 0.15; walk(0); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.6 + rnd() * 0.8; } }
}
