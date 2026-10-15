'use strict';
/* ======================================================================
   v9 · EL SHOW DE MÍSTER CONFIANZA
   La pelea entera es un programa de TV con cuatro juegos: lucha tipo
   Street Fighter, carrera disparando, marcianitos y combate por turnos
   ====================================================================== */
const MGW = 320, MGH = 180, GROUND9 = 150;
const mgEl = document.createElement('div'); mgEl.id = 'mg9'; mgEl.hidden = true;
const mgC = document.createElement('canvas'); mgC.width = MGW; mgC.height = MGH; mgEl.appendChild(mgC);
canvas.parentNode.insertBefore(mgEl, canvas.nextSibling);
const mgX = mgC.getContext('2d');
const PB9 = document.createElement('canvas'); PB9.width = 180; PB9.height = 150; const pbX = PB9.getContext('2d');
let G9 = mgX;
/* (estilos de esta parte: css/show.css) */

/* ---------- Utilidades de dibujo ---------- */
const FONT9 = s => `bold ${s}px 'Pixelify Sans', ui-monospace, monospace`;
const SHADE9 = {};
function shade9(hex, k){ if (k === 1) return hex; const key = hex + k; if (SHADE9[key]) return SHADE9[key];
  const n = parseInt(hex.slice(1), 16), r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return (SHADE9[key] = `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`); }
function rect9(x, y, w, h, col){ G9.fillStyle = col; G9.fillRect(x, y, w, h); }
function tri9(a, b, c, col){ G9.fillStyle = col; G9.beginPath(); G9.moveTo(a[0], a[1]); G9.lineTo(b[0], b[1]); G9.lineTo(c[0], c[1]); G9.closePath(); G9.fill(); }
function txt9(s, x, y, size, col, align, out){
  mgX.font = FONT9(size); mgX.textAlign = align || 'left'; mgX.textBaseline = 'top';
  if (out !== false){ mgX.fillStyle = out || '#000'; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) mgX.fillText(s, x + dx, y + dy); }
  mgX.fillStyle = col; mgX.fillText(s, x, y);
}
function bar9(x, y, w, h, f, col, back, flip){
  rect9(x - 1, y - 1, w + 2, h + 2, '#000'); rect9(x, y, w, h, back || '#3a0a14');
  const fw = Math.round(clamp(f, 0, 1) * w), bx = flip ? x + w - fw : x; rect9(bx, y, fw, h, col); rect9(bx, y, fw, 1, 'rgba(255,255,255,.5)');
}
function win9(x, y, w, h){   // ventana azul estilo RPG clásico
  const g = mgX.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3a4ae0'); g.addColorStop(1, '#0c0e62');
  mgX.fillStyle = '#000'; mgX.fillRect(x - 1, y - 1, w + 2, h + 2); mgX.fillStyle = g; mgX.fillRect(x, y, w, h);
  mgX.strokeStyle = '#ffffff'; mgX.lineWidth = 1; mgX.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); mgX.strokeStyle = '#8a94ff'; mgX.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
}
const starFace9 = () => assetImg('canal-x/marcianitos/mister-1');

/* partículas, números y textos grandes */
const P9 = [], N9 = [];
function part9(x, y, vx, vy, col, s, life, g){ if (P9.length > 500) P9.shift(); P9.push({ x, y, vx, vy, col, s, life, max: life, g: g || 0 }); }
function burst9(x, y, n, cols, sp, s, life, g){ for (let i = 0; i < n; i++){ const a = rnd() * TAU, v = sp * (0.3 + rnd() * 0.7); part9(x, y, Math.cos(a) * v, Math.sin(a) * v, cols[i % cols.length], s, life * (0.6 + rnd() * 0.6), g); } }
function updP9(dt){ for (let i = P9.length - 1; i >= 0; i--){ const p = P9[i]; p.life -= dt; if (p.life <= 0){ P9.splice(i, 1); continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
function drawP9(){ for (const p of P9){ const s = Math.max(1, Math.round(p.s * (0.35 + 0.65 * p.life / p.max))); rect9(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s, p.col); } }
function num9(x, y, text, col, size){ N9.push({ x, y, text, col, size: size || 9, t: 0 }); if (N9.length > 30) N9.shift(); }
function updN9(dt){ for (let i = N9.length - 1; i >= 0; i--){ const n = N9[i]; n.t += dt; n.y -= dt * (n.t < 0.25 ? 40 : 8); if (n.t > 1.1) N9.splice(i, 1); } }
function drawN9(){ for (const n of N9){ mgX.globalAlpha = n.t > 0.8 ? Math.max(0, (1.1 - n.t) / 0.3) : 1; txt9(n.text, n.x, n.y, n.t < 0.1 ? n.size + 4 : n.size, n.col, 'center'); } mgX.globalAlpha = 1; }
function big9(text, sub, dur, col){ MG.big = { text, sub: sub || '', t: 0, dur: dur || 1.2, col: col || '#ffd23a' }; }
function drawBig9(dt){
  const B_ = MG.big; if (!B_) return; B_.t += dt; if (B_.t > B_.dur){ MG.big = null; return; }
  const k = B_.t / B_.dur, sc = B_.t < 0.15 ? 1 + (0.15 - B_.t) * 5 : 1; mgX.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
  txt9(B_.text, MGW / 2, 62 - (sc - 1) * 10, Math.round(26 * sc), B_.col, 'center', '#3a0a14'); if (B_.sub) txt9(B_.sub, MGW / 2, 92, 10, '#ffffff', 'center'); mgX.globalAlpha = 1;
}

/* ---------- Muñecos: Tovan y Míster Confianza dibujados por piezas ---------- */
const PUP9 = {
  tovan: { hair: '#5a2e16', hairL: '#8a4a26', skin: '#efc29c', coat: '#24467e', coatL: '#3462a8', trim: '#e0b048', pants: '#4a3526', boot: '#2a201c', glove: '#8a5a36', scarf: '#c8303a', belt: '#3a2418' },
  star:  { hair: '#15151f', hairL: '#4a5ad8', skin: '#efc29c', coat: '#f0c040', coatL: '#ffe07a', trim: '#d83a3a', pants: '#e8b030', boot: '#d83a3a', glove: '#ffffff', scarf: '#9a1e18', belt: '#d83a3a' }
};
const mkPose9 = (lean, cr, af0, af1, ab0, ab1, lf0, lf1, lb0, lb1, head) => ({ lean, crouch: cr, aF: [af0, af1], aB: [ab0, ab1], lF: [lf0, lf1], lB: [lb0, lb1], head: head || 0 });
const POSE9 = {
  idle:   mkPose9(0.05, 0.15, 0.5, 1.3, 0.3, 1.5, 0.25, 0.3, -0.25, 0.3),
  walkA:  mkPose9(0.1, 0.05, 0.7, 1.1, 0.0, 1.3, 0.55, 0.25, -0.45, 0.6),
  walkB:  mkPose9(0.1, 0.05, 0.3, 1.3, 0.5, 1.1, -0.45, 0.6, 0.55, 0.25),
  jab:    mkPose9(0.18, 0.1, 1.55, 0.05, 0.4, 1.6, 0.4, 0.2, -0.4, 0.3),
  windup: mkPose9(-0.15, 0.2, -0.5, 1.7, 0.6, 1.3, 0.3, 0.45, -0.3, 0.4),
  upper:  mkPose9(-0.2, 0.0, 2.8, 0.3, 0.2, 1.4, 0.2, 0.1, -0.4, 0.5, -0.3),
  akick:  mkPose9(-0.3, 0.0, 0.9, 1.0, -0.6, 1.0, 1.4, 0.1, -0.8, 1.6),
  jump:   mkPose9(0.05, 0.0, 1.2, 1.4, 0.8, 1.4, 0.9, 1.6, -0.2, 1.4),
  hurt:   mkPose9(-0.45, 0.1, -0.4, 0.6, -0.7, 0.5, 0.3, 0.3, -0.5, 0.2, -0.3),
  block:  mkPose9(-0.1, 0.25, 1.1, 2.2, 0.9, 2.3, 0.3, 0.4, -0.35, 0.4, 0.15),
  cast:   mkPose9(0.2, 0.15, 1.6, 0.1, 1.5, 0.15, 0.4, 0.3, -0.45, 0.3),
  dash:   mkPose9(0.5, 0.2, 1.45, 0.1, -0.8, 0.6, 0.7, 0.4, -0.9, 0.9),
  taunt:  mkPose9(-0.08, 0.0, 2.7, 0.6, -0.3, 0.4, 0.15, 0.1, -0.15, 0.1, -0.15),
  phone:  mkPose9(0.0, 0.05, 2.1, 1.5, 0.3, 1.2, 0.2, 0.1, -0.2, 0.1),
  ko:     mkPose9(-1.35, 0.6, -1.0, 0.3, -1.4, 0.2, 1.2, 0.6, 0.9, 0.8, -0.4),
  run1:   mkPose9(0.28, 0.1, 1.1, 1.5, -0.7, 0.9, 0.95, 0.4, -0.7, 1.4),
  run2:   mkPose9(0.28, 0.1, -0.5, 1.2, 0.9, 1.4, -0.7, 1.4, 0.95, 0.4),
  slide:  mkPose9(-0.95, 0.75, 1.5, 0.1, 0.6, 0.8, 1.5, 0.1, 1.2, 0.6),
  shoot:  mkPose9(0.15, 0.1, 1.55, 0.0, 0.3, 1.3, 0.3, 0.3, -0.3, 0.4),
  fly:    mkPose9(0.1, 0.0, 0.9, 1.2, 0.5, 1.1, 0.4, 0.6, -0.3, 0.9),
  throw:  mkPose9(0.25, 0.0, 2.4, 0.4, -0.4, 0.8, 0.4, 0.6, -0.3, 0.9),
  win:    mkPose9(-0.05, 0.0, 2.9, 0.2, 0.4, 1.3, 0.2, 0.1, -0.2, 0.1, -0.2),
  guard:  mkPose9(0.0, 0.3, 1.0, 1.7, 0.6, 1.9, 0.4, 0.5, -0.4, 0.4)
};
const cpPose9 = p => ({ lean: p.lean, crouch: p.crouch, head: p.head, aF: [...p.aF], aB: [...p.aB], lF: [...p.lF], lB: [...p.lB] });
function lerpPose9(p, q, k){ p.lean = lerp(p.lean, q.lean, k); p.crouch = lerp(p.crouch, q.crouch, k); p.head = lerp(p.head, q.head || 0, k);
  for (const key of ['aF', 'aB', 'lF', 'lB']){ p[key][0] = lerp(p[key][0], q[key][0], k); p[key][1] = lerp(p[key][1], q[key][1], k); } }
function leg9(L, C, k){
  const pa = shade9(C.pants, k); G9.rotate(-L[0]); rect9(-3, -2, 6, 13, pa); G9.translate(0, 11); G9.rotate(L[1]); rect9(-2.5, 0, 5, 9, pa);
  rect9(-3, 7, 8, 4, shade9(C.boot, k)); if (C === PUP9.tovan) rect9(-3, 6, 6, 1, shade9(C.trim, k));
}
function arm9(A, C, k, weapon){
  const co = shade9(C.coat, k); G9.rotate(-A[0]); rect9(-2.5, -2, 5, 11, co); rect9(-2.5, 7, 5, 2, shade9(C.trim, k)); G9.translate(0, 9); G9.rotate(-A[1]);
  rect9(-2, 0, 4, 7, co); rect9(-2.5, 6, 5, 5, shade9(C.glove, k));
  if (weapon === 'staff'){ rect9(-1, 3, 2, 25, '#6a4426'); rect9(-2, 26, 4, 3, '#e0b048'); rect9(-2, 29, 4, 4, '#7ff5ff'); rect9(-1, 30, 2, 2, '#ffffff'); }
  else if (weapon === 'phone'){ rect9(-2, 9, 5, 8, '#1a1a2a'); rect9(-1, 10, 3, 5, '#4ad8ff'); }
}
function head9(kind, C, t, o){
  rect9(-5, -12, 10, 12, C.skin); rect9(-6, -10, 2, 6, shade9(C.skin, 0.82));
  if (kind === 'tovan'){
    rect9(2, -8, 2, 3, '#1a1a2a'); rect9(2, -8, 1, 1, '#ffffff'); rect9(3, -3, 2, 1, o.hurt ? '#1a1a2a' : '#9a4a3a');
    const H = C.hair; rect9(-6, -14, 12, 4, H); rect9(-6, -12, 3, 7, H); rect9(-1, -11, 7, 2, H); rect9(4, -10, 2, 3, H);
    tri9([-6, -13], [-12, -16], [-3, -14], H); tri9([-4, -14], [-5, -21], [1, -14], H); tri9([0, -14], [4, -20], [5, -13], H); tri9([3, -12], [9, -14], [5, -9], H);
    tri9([0, -14], [3, -23], [2, -14], C.hairL);
    const w = Math.sin(t * 7); rect9(-10, -11 + w, 4, 3, H); rect9(-13, -10 + w * 1.5, 4, 5, C.hairL);
    const s = Math.sin(t * 9); rect9(-11, 1 + s, 6, 2, C.scarf); rect9(-15, 2 + s * 1.6, 5, 2, C.scarf);
  } else {
    rect9(-1, -8, 7, 3, '#101014'); rect9(4, -8, 1, 1, '#ffffff'); rect9(1, -3, 5, 1, '#ffffff'); rect9(-3, 0, 8, 2, C.skin);
    const H = C.hair; rect9(-6, -15, 12, 5, H); rect9(-1, -18, 10, 4, H); rect9(5, -17, 5, 3, H); rect9(1, -17, 6, 1, C.hairL); rect9(-6, -11, 2, 6, H);
    if (o.shine && Math.sin(t * 6) > 0.6){ rect9(6, -5, 1, 3, '#ffffff'); rect9(5, -4, 3, 1, '#ffffff'); }
  }
}
function torso9(kind, C, t){
  rect9(-6, -19, 12, 20, C.coat); rect9(1, -18, 4, 18, C.coatL); rect9(-6, -1, 12, 2, C.trim); rect9(-6, -7, 12, 2, C.belt);
  if (kind === 'tovan'){ rect9(2, -14, 2, 2, C.trim); rect9(-5, -21, 11, 3, C.scarf); }
  else { rect9(0, -19, 3, 8, '#ffffff'); rect9(-5, -21, 11, 2, '#ffffff'); rect9(2, -14, 3, 1, '#d83a3a'); rect9(3, -15, 1, 3, '#d83a3a'); rect9(2, -13, 3, 1, '#ffe24a'); }
}
function puppet9(kind, x, y, face, p, sc, o){
  o = o || {}; const C = PUP9[kind], t = MG.t + (o.ph || 0);
  G9 = pbX; pbX.setTransform(1, 0, 0, 1, 0, 0); pbX.clearRect(0, 0, 180, 150); pbX.translate(90, 140); pbX.scale(face * sc, sc);
  const hipY = -22 + p.crouch * 7;
  pbX.save(); pbX.translate(0, hipY); pbX.rotate(p.lean);
  if (kind === 'star'){ const w = Math.sin(t * 6) * 2; rect9(-9 - w, -19, 5, 22, C.scarf); rect9(-12 - w * 1.5, -6, 4, 13, C.scarf); }
  else { rect9(-8, -3, 4, 8 + Math.sin(t * 8), C.coat); rect9(-9, 3, 3, 4, shade9(C.coat, 0.8)); }
  pbX.restore();
  pbX.save(); pbX.translate(-2, hipY); leg9(p.lB, C, 0.72); pbX.restore();
  pbX.save(); pbX.translate(2, hipY); leg9(p.lF, C, 1); pbX.restore();
  pbX.save(); pbX.translate(0, hipY); pbX.rotate(p.lean); pbX.translate(-2, -15); arm9(p.aB, C, 0.72, o.weaponB); pbX.restore();
  pbX.save(); pbX.translate(0, hipY); pbX.rotate(p.lean); torso9(kind, C, t); pbX.save(); pbX.translate(1, -19); pbX.rotate(p.head); head9(kind, C, t, o); pbX.restore(); pbX.restore();
  pbX.save(); pbX.translate(0, hipY); pbX.rotate(p.lean); pbX.translate(2, -15); arm9(p.aF, C, 1, o.weapon); pbX.restore();
  pbX.setTransform(1, 0, 0, 1, 0, 0);
  if (o.flash > 0){ pbX.globalCompositeOperation = 'source-atop'; pbX.fillStyle = `rgba(255,255,255,${Math.min(1, o.flash)})`; pbX.fillRect(0, 0, 180, 150); pbX.globalCompositeOperation = 'source-over'; }
  if (o.tint){ pbX.globalCompositeOperation = 'source-atop'; pbX.fillStyle = o.tint; pbX.fillRect(0, 0, 180, 150); pbX.globalCompositeOperation = 'source-over'; }
  G9 = mgX; mgX.globalAlpha = o.alpha == null ? 1 : o.alpha; mgX.drawImage(PB9, Math.round(x - 90), Math.round(y - 140)); mgX.globalAlpha = 1;
}
function shadow9(x, y, w){ mgX.fillStyle = 'rgba(0,0,0,.4)'; mgX.beginPath(); mgX.ellipse(Math.round(x), Math.round(y), w, 3, 0, 0, TAU); mgX.fill(); }

/* ---------- Estado del show ---------- */
const MG = { active: false, done: false, round: -1, order: ['fight', 'run', 'inv', 'rpg'], game: null, trans: 0, pending: null, t: 0, shake: 0, flashA: 0, flashC: '#ffffff', big: null, ending: false, endT: 0, invT: 0, ax: { x: 0, y: 0 }, axPrev: { x: 0, y: 0 } };
const MG_THR = [0.75, 0.5, 0.25, 0];
const mgF = () => clamp(0.75 + 0.25 * up.dmg, 1, 2.2);
const mgOverlay = () => MG.active && gameState === 'play' && (!MG.game || MG.game.overlay);
function mgAxis(){ const k = keys; return { x: clamp((k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + (Math.abs(joy.x) > 0.25 ? joy.x : 0), -1, 1),
  y: clamp((k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0) + (Math.abs(joy.y) > 0.25 ? joy.y : 0), -1, 1) }; }
function mgDmg(pct, x, y){
  if (!bossE || !bossE.alive) return 0;
  const crit = rnd() < up.crit, floor = bossE.maxHp * MG_THR[Math.max(0, MG.round)];
  const v = Math.max(1, Math.round(bossE.maxHp * pct / 100 * mgF() * (crit ? critMul() : 1) * (1 + 0.08 * ml('bossS'))));
  bossE.hp = Math.max(floor, bossE.hp - v); stat('mgHits');
  num9(x, y, (crit ? '¡' : '') + v + (crit ? '!' : ''), crit ? '#ffd23a' : '#ffffff', crit ? 13 : 10); play(crit ? 'crit' : 'hit');
  player.meter = Math.min(100, player.meter + 2.5 * up.meterRate);
  if (crit){ burst9(x, y + 6, 12, ['#ffd23a', '#ffffff', '#ff8a3a'], 90, 3, 0.45, 0); MG.flashA = 0.25; MG.flashC = '#fff6c0'; }
  return v;
}
function mgHurt(base, x, y){
  if (player.dead || player.inv > 0) return 'none';
  state = 'normal'; const hp0 = player.hp;
  const r = hurtPlayer(base * dmgScale(wave) * 0.62, hero.position.x + 0.5, hero.position.z, 0);
  if (r === 'hit'){ MG.shake = Math.max(MG.shake, 0.3); MG.flashA = 0.35; MG.flashC = '#ff2a2a'; if (x != null) num9(x, y, '-' + Math.max(1, Math.round(hp0 - player.hp)), '#ff6a5a', 10); }
  return r;
}

/* ---------- Fondos ---------- */
function bandSky9(cols, y0, y1){ const n = cols.length, h = (y1 - y0) / n; cols.forEach((c, i) => rect9(0, Math.round(y0 + i * h), MGW, Math.ceil(h) + 1, c)); }
const crowd9 = Array.from({ length: 34 }, (_, i) => ({ x: i * 10 + (rnd() * 4 | 0), y: 0, ph: rnd() * 6, c: ['#1a1030', '#24143a', '#140c26'][i % 3], row: i % 2 }));
function bgStudio9(t){
  bandSky9(['#140828', '#1c0c36', '#261244', '#301852', '#3a1e5e'], 0, 112);
  for (let i = 0; i < 6; i++){ const x = 16 + i * 54; rect9(x, 8, 2, 104, '#24143e'); }
  // pantalla gigante con su cara
  rect9(108, 12, 104, 60, '#05061a'); rect9(110, 14, 100, 56, '#0e1450'); mgX.strokeStyle = '#4a5ad8'; mgX.strokeRect(108.5, 12.5, 103, 59);
  mgX.drawImage(starFace9(), 136, 18, 48, 48); txt9('EN DIRECTO', 160, 61, 7, Math.sin(t * 4) > 0 ? '#ff4a5a' : '#ffffff', 'center');
  rect9(14, 14, 26, 9, Math.sin(t * 3) > -0.2 ? '#ff3040' : '#5a1018'); txt9('ON AIR', 27, 15, 6, '#ffffff', 'center', false);
  // focos que barren
  for (let i = 0; i < 4; i++){ const a = Math.sin(t * 0.9 + i * 1.7) * 0.45, x0 = 40 + i * 80; mgX.fillStyle = `rgba(255,236,170,${0.07 + 0.03 * Math.sin(t * 3 + i)})`;
    mgX.beginPath(); mgX.moveTo(x0, 0); mgX.lineTo(x0 + Math.sin(a) * 140 - 26, 150); mgX.lineTo(x0 + Math.sin(a) * 140 + 26, 150); mgX.closePath(); mgX.fill(); }
  // público
  for (const c of crowd9){ const y = 104 + c.row * 9 + Math.abs(Math.sin(t * 5 + c.ph)) * -2; rect9(c.x, y, 8, 14, c.c); rect9(c.x + 1, y - 5, 6, 6, c.c);
    if (Math.sin(t * 7 + c.ph * 3) > 0.985){ rect9(c.x + 2, y - 3, 3, 3, '#ffffff'); part9(c.x + 3, y - 2, 0, 0, '#fff6c0', 5, 0.08, 0); } }
  // escenario
  rect9(0, 122, MGW, 58, '#2a1838'); rect9(0, 122, MGW, 2, '#ffd23a'); for (let x = 0; x < MGW; x += 20) rect9(x + ((t * 0) | 0), 126, 10, 1, '#3a2450');
  for (let i = 0; i < 7; i++){ const y = 130 + i * 7; rect9(0, y, MGW, 1, i % 2 ? '#32204a' : '#22142e'); }
}
const city9 = { far: Array.from({ length: 24 }, (_, i) => ({ w: 18 + (rnd() * 18 | 0), h: 28 + (rnd() * 40 | 0) })), near: Array.from({ length: 16 }, () => ({ w: 26 + (rnd() * 20 | 0), h: 40 + (rnd() * 46 | 0), seed: rnd() * 100 })) };
function bgCity9(t, scroll){
  bandSky9(['#2a1450', '#4a1e6a', '#7a2a7a', '#b03a74', '#e0566a', '#ff8a5a', '#ffb06a'], 0, 120);
  mgX.fillStyle = '#ffe9a0'; mgX.beginPath(); mgX.arc(250, 70, 18, 0, TAU); mgX.fill(); rect9(232, 74, 36, 2, '#ff8a5a'); rect9(234, 80, 32, 2, '#ff9a60');
  let x = -((scroll * 0.15) % 600); for (let k = 0; k < 2; k++) for (const b of city9.far){ rect9(Math.round(x), 120 - b.h, b.w, b.h, '#3a1a52'); x += b.w + 3; }
  x = -((scroll * 0.4) % 700);
  for (let k = 0; k < 2; k++) for (const b of city9.near){ const bx = Math.round(x); rect9(bx, 132 - b.h, b.w, b.h, '#1e0e30');
    for (let wy = 132 - b.h + 4; wy < 126; wy += 7) for (let wx = bx + 3; wx < bx + b.w - 3; wx += 6) if (((wx * 7 + wy * 13 + b.seed) | 0) % 5 < 2) rect9(wx, wy, 2, 3, '#ffd870');
    x += b.w + 8; }
  // vallas publicitarias
  const bx0 = -((scroll * 0.6) % 260) + 40;
  for (let k = 0; k < 3; k++){ const bx = Math.round(bx0 + k * 260); rect9(bx + 20, 92, 3, 34, '#2a1a3a'); rect9(bx, 66, 64, 30, '#f0c040'); rect9(bx + 2, 68, 60, 26, '#d83a3a');
    mgX.drawImage(starFace9(), bx + 3, 69, 24, 24); txt9('¡CONFÍA', bx + 45, 71, 7, '#ffffff', 'center', false); txt9('EN MÍ!', bx + 45, 81, 7, '#ffe24a', 'center', false); }
  // carretera
  rect9(0, 132, MGW, 48, '#24203a'); rect9(0, 132, MGW, 2, '#ffd23a'); rect9(0, 150, MGW, 1, '#3a3456');
  const d0 = -((scroll) % 40); for (let dx = d0; dx < MGW; dx += 40) rect9(Math.round(dx), 164, 20, 2, '#d8d0e8');
  const l0 = -((scroll) % 160); for (let lx = l0; lx < MGW + 40; lx += 160){ rect9(Math.round(lx), 100, 2, 34, '#5a5470'); rect9(Math.round(lx) - 6, 98, 10, 3, '#5a5470'); rect9(Math.round(lx) - 6, 101, 8, 2, '#fff6c0'); }
}
function bgRpg9(t){
  bandSky9(['#06082a', '#0c1040', '#141a56', '#1e2470', '#2a2a80'], 0, 70);
  for (let i = 0; i < 30; i++){ const x = (i * 37) % MGW, y = (i * 23) % 60; if (Math.sin(t * 2 + i) > 0.3) rect9(x, y, 1, 1, '#ffffff'); }
  // telón
  for (let i = 0; i < 6; i++){ rect9(i * 9, 0, 8, 118, i % 2 ? '#7a1020' : '#9a1a2a'); rect9(MGW - 9 - i * 9, 0, 8, 118, i % 2 ? '#7a1020' : '#9a1a2a'); }
  rect9(0, 0, MGW, 10, '#5a0a18'); for (let x = 0; x < MGW; x += 8) rect9(x, 10, 4, 3, '#e0b048');
  // suelo con perspectiva
  for (let i = 0; i < 12; i++){ const y = 70 + i * 4; rect9(0, y, MGW, 4, i % 2 ? '#2a2468' : '#22205a'); }
  mgX.strokeStyle = 'rgba(160,170,255,.25)'; for (let i = -8; i <= 8; i++){ mgX.beginPath(); mgX.moveTo(160 + i * 6, 70); mgX.lineTo(160 + i * 40, 118); mgX.stroke(); }
}
