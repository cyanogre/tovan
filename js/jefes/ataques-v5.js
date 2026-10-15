'use strict';
/* ======================================================================
   JEFES v5: ataques nuevos para cada jefe, una segunda fase al 50 %
   y Míster Confianza colándose en el minijuego de los marcianitos
   ====================================================================== */
const HZ = [];
const hzAdd = o => { HZ.push(o); return o; };
function hzCircle(x, z, r, delay, fire){ const m = circTele(); showCirc(m, x, z, r);
  return hzAdd({ t: delay, upd(dt){ pulse(m); m.scale.setScalar(r * (0.75 + 0.25 * Math.min(1, 1 - this.t / delay + 0.25))); this.t -= dt; if (this.t <= 0){ fire(x, z, r); return true; } }, end(){ scene.remove(m); } }); }
function hzLine(x, z, a, len, w, delay, fire){ const m = lineTele(); showLine(m, x, z, a, w, len);
  return hzAdd({ t: delay, upd(dt){ pulse(m); this.t -= dt; if (this.t <= 0){ fire(); return true; } }, end(){ scene.remove(m); } }); }
function hzFx(o){ return hzAdd(Object.assign({ t: 0 }, o)); }
function updateHZ(dt){ for (let i = HZ.length - 1; i >= 0; i--){ const h = HZ[i]; let done = false; try { done = h.upd(dt); } catch (err) { console.error(err); done = true; } if (done){ if (h.end) h.end(); HZ.splice(i, 1); } } }
function clearHZ(){ for (const h of HZ) if (h.end) h.end(); HZ.length = 0; }
const pillarMat = makeMat(0x9ff6ff, { emissive: 1, opacity: 0.8 }), rockMat5 = makeMat(0x8a8494), boneMat5 = makeMat(0xeee6d4), shadowMat5 = makeMat(0x2a1440, { emissive: 0.4, opacity: 0.75 }),
  eyeMat5 = makeMat(0xff4a3a, { emissive: 1 }), slashMat5 = makeMat(0xc89aff, { emissive: 1, opacity: 0.9 }), yarnMat = makeMat(0xff7ab0), yarnLine = makeMat(0xd84a8a), sugarMat = makeMat(0xffffff, { emissive: 0.4 });
const bsodTex = texAsset('jefes/error-404-pantallazo-azul', { borde: true }); bsodTex.wrapS = THREE.RepeatWrapping;
const photoTex = texAsset('jefes/mister-confianza-foto');
const photoMat = makeMat(0xffffff, { map: photoTex, emissive: 0.4, side: THREE.DoubleSide });
const strike = (x, z, dmg, col = 0x9ff6ff) => { bolt(x, 10, z, x, 0.1, z, col, 0.16); ringFx(x, z, col, 0.2, 1.3, 0.3); sparks(x, 0.3, z, 8, col); lightFlash(x, 2, z, col, 1.6, 6); play('zap'); hurtAt(x, z, 1.05, dmg, 4); };
const nearHero = (r) => { const a = rnd() * TAU, d = rnd() * r; return clampArena(new V3(hero.position.x + Math.cos(a) * d, 0, hero.position.z + Math.sin(a) * d)); };

/* ---------- Ataques nuevos ---------- */
const BX = {
  // Guardián: columnas rúnicas en anillos y lluvia de escombros
  boss: {
    idle: e => e.state === 'chase', reset: e => { e.state = 'chase'; e.bt = 1.2; e.torso.rotation.x = 0; },
    atks: ['pillars', 'rocks'],
    pillars(e){ const p2 = e.p2, n = p2 ? 4 : 3; let t = 0; starShout(e, '¡COLUMNAS RÚNICAS!'); play('roar');
      for (let k = 0; k < n; k++){ const R = 1.8 + k * 1.6, cnt = 5 + k * 3, off = rnd() * TAU;
        for (let i = 0; i < cnt; i++){ const a = off + i / cnt * TAU, v = clampArena(new V3(e.g.position.x + Math.cos(a) * R, 0, e.g.position.z + Math.sin(a) * R));
          hzCircle(v.x, v.z, 0.85, 0.7 + k * (p2 ? 0.28 : 0.38), (x, z) => { const m = mesh(C(0.5, 0.5, 7, 8, true), pillarMat, x, 3.5, z);
            hzFx({ upd(dt){ this.t += dt; m.scale.set(1 - this.t * 1.6, 1, 1 - this.t * 1.6); return this.t > 0.5; }, end(){ scene.remove(m); } });
            puffAt(x, z, 3, 0.8, 0x9ff6ff); hurtAt(x, z, 0.95, 18 * e.dm, 5); if (rnd() < 0.3) play('zap'); }); } }
      return { t: 0.7 + n * 0.4 + 0.6, upd(dt){ this.t -= dt; e.arms.forEach(A => { A.rotation.x = lerp(A.rotation.x, -2.7, 1 - Math.exp(-dt * 8)); }); e.torso.rotation.x = -0.15; if (Math.sin(time * 9) > 0.9) shake = Math.max(shake, 0.12); return this.t <= 0; } }; },
    rocks(e){ const n = e.p2 ? 12 : 8; starShout(e, '¡LLUVIA DE ESCOMBROS!'); play('bossSlam'); shake = Math.max(shake, 0.5); slamRing(e);
      for (let i = 0; i < n; i++){ const v = i === 0 ? clampArena(new V3(hero.position.x, 0, hero.position.z)) : nearHero(3.6);
        hzCircle(v.x, v.z, 1.05, 0.7 + i * 0.13, (x, z) => { const m = mesh(new THREE.DodecahedronGeometry(0.45, 0), rockMat5, x, 9, z);
          hzFx({ upd(dt){ this.t += dt; m.position.y = 9 * (1 - Math.min(1, this.t / 0.3) ** 2); m.rotation.x += dt * 6;
            if (this.t >= 0.3 && !this.hit){ this.hit = true; puffAt(x, z, 8, 1.5); play('land'); shake = Math.max(shake, 0.15); hurtAt(x, z, 1.1, 16 * e.dm, 6); } return this.t > 0.9; }, end(){ scene.remove(m); } }); }); }
      return { t: 0.9, upd(dt){ this.t -= dt; e.arms.forEach(A => { A.rotation.x = lerp(A.rotation.x, 0.6, 1 - Math.exp(-dt * 10)); }); e.torso.rotation.x = 0.35; return this.t <= 0; } }; }
  },
  // Ryūjin: tormenta de jade y anillo de fuego
  dragon: {
    parallel: true, idle: e => e.state === 'cruise', hold: e => { e.state = 'cruise'; e.t = 9; }, reset: e => { e.state = 'cruise'; e.t = 1.6; },
    atks: ['thunder', 'fireRing'],
    thunder(e){ const n = e.p2 ? 14 : 9; play('dragonRoar'); flash('#bfffe8', 0.3); banner('¡Tormenta de jade!', 0.9);
      for (let i = 0; i < n; i++) later(0.3 + i * 0.32, () => { if (!e.alive) return; const lead = i % 3 === 2 ? 1.2 : 0, v = clampArena(new V3(hero.position.x + Math.sin(heading) * lead, 0, hero.position.z + Math.cos(heading) * lead));
        hzCircle(v.x, v.z, 1.0, 0.7, (x, z) => strike(x, z, 15 * e.dm, 0x9fffe0)); });
      return { t: 0.3 + n * 0.32 + 0.9, upd(dt){ this.t -= dt; return this.t <= 0; } }; },
    fireRing(e){ play('dragonRoar'); const rings = e.p2 ? [2.6, 4.4] : [3.2], cx = hero.position.x, cz = hero.position.z; let k = 0;
      for (const R of rings){ const cnt = Math.round(R * 3.6), gap = Math.floor(rnd() * cnt);
        for (let i = 0; i < cnt; i++){ if (i === gap || i === (gap + 1) % cnt) continue; const a = i / cnt * TAU, to = clampArena(new V3(cx + Math.cos(a) * R, 0, cz + Math.sin(a) * R));
          later(0.1 + (k++) * 0.05, () => { if (!e.alive) return; e.head.updateMatrixWorld(); mouthPos(e, tA); lob5(tA, to, 0.9, 14 * e.dm, fballMat, orbGeo, (x, z) => { ringFx(x, z, 0xff7a2a, 0.2, 1.3, 0.3); sparks(x, 0.3, z, 6, 0xffc060, 4); play('boom'); }); play('fireball'); }); } }
      return { t: 0.2 + k * 0.05 + 1.2, upd(dt){ this.t -= dt; return this.t <= 0; } }; }
  },
  // Gashadokuro: muros de huesos y aullido helado
  skeleton: {
    parallel: true, idle: e => e.st === 'idle', hold: e => { e.st = 'idle'; e.t = 9; }, reset: e => { e.st = 'idle'; e.t = 1.0; },
    atks: ['boneWall', 'howl'],
    boneWall(e){ const rows = e.p2 ? 6 : 4, gapW = 2.4; banner('¡Muro de huesos!<small>Busca el hueco… o salta</small>', 1.0); play('roar');
      for (let r = 0; r < rows; r++){ const z = -4.8 + r * (10.5 / (rows - 1)), gx = (rnd() - 0.5) * 9, d = 0.9 + r * (e.p2 ? 0.5 : 0.65);
        for (const [x0, x1] of [[-7.5, gx - gapW / 2], [gx + gapW / 2, 7.5]]){ if (x1 - x0 < 0.3) continue; hzLine(x0, z, Math.PI / 2, x1 - x0, 1.0, d, () => {}); }
        later(d, () => { if (!e.alive) return; const spikes = [];
          for (let x = -7.4; x <= 7.4; x += 0.55){ if (Math.abs(x - gx) < gapW / 2 || Math.hypot(x, z) > ARENA + 0.4) continue; const s = mesh(new THREE.ConeGeometry(0.2, 1.3, 5), boneMat5, x, -0.7, z); s.rotation.z = (rnd() - 0.5) * 0.4; spikes.push(s); }
          play('shatter'); shake = Math.max(shake, 0.2);
          hzFx({ upd(dt){ this.t += dt; const k = this.t < 0.12 ? this.t / 0.12 : this.t > 0.5 ? Math.max(0, 1 - (this.t - 0.5) / 0.2) : 1; spikes.forEach(s => { s.position.y = -0.7 + k * 1.2; });
            if (!this.hit && this.t < 0.5 && Math.abs(hero.position.z - z) < 0.6 && Math.abs(hero.position.x - gx) > gapW / 2 - 0.1 && hero.position.y < 0.8){ if (hurtPlayer(16 * e.dm, hero.position.x, z, 6) === 'hit') this.hit = true; }
            return this.t > 0.7; }, end(){ spikes.forEach(s => scene.remove(s)); } }); }); }
      return { t: 0.9 + rows * 0.65 + 0.6, upd(dt){ this.t -= dt; return this.t <= 0; } }; },
    howl(e){ const n = e.p2 ? 4 : 3; banner('¡Aullido helado!<small>Salta las ondas</small>', 0.9); play('roar');
      for (let i = 0; i < n; i++) later(i * 0.8, () => { if (e.alive) waveWarn10(0, -5.6, 0x9fe8ff); }); for (let i = 0; i < n; i++) later(0.65 + i * 0.8, () => { if (!e.alive) return; const mat = makeMat(0x18c8ff, { emissive: 1, opacity: 0.95, side: THREE.DoubleSide });
        const m = mesh(new THREE.RingGeometry(0.93, 1, 40), mat, 0, 0.06, -5.6); m.rotation.x = -Math.PI / 2; eRings.push({ m, r: 0.8, speed: 5.6, max: 15, dmg: 15 * e.dm, hit: false, vivid: true }); play('bossSlam'); shake = Math.max(shake, 0.3); });
      for (let i = 0; i < 6; i++) later(0.8 + i * 0.25, () => { if (!e.alive) return; e.skull.getWorldPosition(tA); lob5(tA, nearHero(3.5), 0.8, 12 * e.dm, ghostMat, orbGeo, (x, z) => { ringFx(x, z, 0x9fe8ff, 0.2, 1.2, 0.3); play('freeze'); }); });
      return { t: 0.65 + n * 0.8 + 1.0, upd(dt){ this.t -= dt; e.jaw.rotation.x = lerp(e.jaw.rotation.x, 0.75, 1 - Math.exp(-dt * 8)); return this.t <= 0; } }; }
  },
  // Míster Confianza: selfie con fans y autógrafos teledirigidos
  star: {
    idle: e => e.st === 'idle', reset: e => { e.st = 'idle'; e.t = 1.0; },
    atks: ['selfie', 'autographs', 'superDash'],
    selfie(e){ starShout(e, '¡SELFIE CON MIS FANS!'); play('superOn'); const tele = mesh(coneGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), e.g.position.x, 0.05, e.g.position.z);
      let dir = angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z);
      return { t: 1.1, upd(dt){ this.t -= dt; if (this.t > 0.35) dir = lerpAngle(dir, angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z), 1 - Math.exp(-dt * 5));
          e.g.rotation.y = lerpAngle(e.g.rotation.y, dir, 1 - Math.exp(-dt * 12)); e.arms[1].rotation.x = lerp(e.arms[1].rotation.x, -2.9, 1 - Math.exp(-dt * 10));
          tele.position.set(e.g.position.x, 0.05, e.g.position.z); tele.rotation.y = dir; tele.scale.setScalar(7); pulse(tele);
          if (this.t <= 0){ flash('#ffffff', 0.7); play('bossCard'); lightFlash(e.g.position.x, 2, e.g.position.z, 0xffffff, 3, 12);
            const ex = hero.position.x - e.g.position.x, ez = hero.position.z - e.g.position.z, d = Math.hypot(ex, ez), ang = Math.abs(((Math.atan2(ex, ez) - dir + Math.PI) % TAU + TAU) % TAU - Math.PI);
            if (d < 7 && ang < 0.45 && hero.position.y < 1.6){ if (hurtPlayer(14 * e.dm, e.g.position.x, e.g.position.z, 4) === 'hit'){ tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Deslumbrado!', 'react', '#ffffff'); } }
            if (enemies.filter(o => o.alive).length < 6) for (let k = 0; k < (e.p2 ? 3 : 2); k++){ const a = rnd() * TAU, v = clampArena(new V3(e.g.position.x + Math.cos(a) * 2.4, 0, e.g.position.z + Math.sin(a) * 2.4)); spawnEnemy('fanatic', [v.x, v.z]); }
            return true; } }, end(){ scene.remove(tele); } }; },
    autographs(e){ starShout(e, '¡AUTÓGRAFOS PARA TODOS!'); play('superOn'); const n = e.p2 ? 9 : 6;
      for (let i = 0; i < n; i++) later(0.3 + i * 0.12, () => { if (!e.alive) return; const a = e.g.rotation.y + (i / n - 0.5) * 2.4, m = mesh(new THREE.PlaneGeometry(0.42, 0.52), photoMat, e.g.position.x + Math.sin(a), 1.5, e.g.position.z + Math.cos(a));
        hzFx({ a, life: 4, upd(dt){ this.life -= dt; const ta = angTo(m.position.x, m.position.z, hero.position.x, hero.position.z); this.a = lerpAngle(this.a, ta, 1 - Math.exp(-dt * 1.6));
            m.position.x += Math.sin(this.a) * 4.6 * dt; m.position.z += Math.cos(this.a) * 4.6 * dt; m.position.y = lerp(m.position.y, 1.0, 1 - Math.exp(-dt * 3)); m.rotation.y += dt * 9;
            if (Math.hypot(m.position.x - hero.position.x, m.position.z - hero.position.z) < 0.5 && hero.position.y < 1.0){ if (hurtPlayer(9 * e.dm, m.position.x, m.position.z, 3) === 'hit') return true; }
            if (state === 'attack' && hitDone && Math.hypot(m.position.x - hero.position.x, m.position.z - hero.position.z) < 2.2){ sparks(m.position.x, 1, m.position.z, 6, 0xffd23a); play('block'); return true; }
            return this.life <= 0; }, end(){ scene.remove(m); } }); play('shoot'); });
      return { t: 0.3 + n * 0.12 + 0.5, upd(dt){ this.t -= dt; e.arms[0].rotation.x = lerp(e.arms[0].rotation.x, -2.2, 1 - Math.exp(-dt * 8)); e.arms[1].rotation.x = lerp(e.arms[1].rotation.x, -2.2, 1 - Math.exp(-dt * 8)); return this.t <= 0; } }; },
    superDash(e){ if (!e.p2) return null; starShout(e, '¡TRIPLE EMBESTIDA ESTELAR!'); play('bruteWarn'); let k = 0, st = 'aim', t = 0.55, dir = 0; const line = lineTele();
      return { upd(dt){ t -= dt;
          if (st === 'aim'){ dir = angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z); e.g.rotation.y = dir; showLine(line, e.g.position.x, e.g.position.z, dir, 2, 8); if (t <= 0){ st = 'go'; t = 0.4; this.hit = false; play('swingBig'); line.visible = false; } }
          else { e.g.position.x += Math.sin(dir) * 17 * dt; e.g.position.z += Math.cos(dir) * 17 * dt; clampArena(e.g.position); e.arms[1].rotation.x = -1.6;
            if (!this.hit && Math.hypot(hero.position.x - e.g.position.x, hero.position.z - e.g.position.z) < e.r + 0.6 && hero.position.y < 1.2){ if (hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 8) === 'hit') this.hit = true; }
            if (t <= 0){ k++; if (k >= 3) return true; st = 'aim'; t = 0.35; } } return false; }, end(){ scene.remove(line); } }; }
  },
  // Tetera: terrones de azúcar que rebotan y tapa voladora
  teapot: {
    idle: e => e.st === 'idle', reset: e => { e.st = 'idle'; e.t = 1.2; if (e.lid) e.lid.visible = true; },
    atks: ['sugar', 'lidThrow'],
    sugar(e){ const n = e.p2 ? 10 : 6; play('teaWhistle'); starShout(e, '¡¿Azúcar?!');
      for (let i = 0; i < n; i++){ const a = rnd() * TAU, m = mesh(B(0.32, 0.32, 0.32), sugarMat, e.g.position.x, 3, e.g.position.z);
        hzFx({ vx: Math.sin(a) * 5, vz: Math.cos(a) * 5, vy: 4 + rnd() * 2, life: 4.5 + rnd(), upd(dt){ this.life -= dt; this.vy -= 14 * dt; m.position.x += this.vx * dt; m.position.z += this.vz * dt; m.position.y += this.vy * dt;
            if (m.position.y < 0.18){ m.position.y = 0.18; this.vy = Math.abs(this.vy) * 0.6 + 2.5; play('clonk'); }
            const r = Math.hypot(m.position.x, m.position.z); if (r > ARENA - 0.3){ const nx = m.position.x / r, nz = m.position.z / r, dot = this.vx * nx + this.vz * nz; this.vx -= 2 * dot * nx; this.vz -= 2 * dot * nz; m.position.x = nx * (ARENA - 0.35); m.position.z = nz * (ARENA - 0.35); }
            m.rotation.x += dt * 5; m.rotation.z += dt * 4;
            if (Math.hypot(m.position.x - hero.position.x, m.position.z - hero.position.z) < 0.55 && Math.abs(m.position.y - hero.position.y - 0.4) < 0.8){ if (hurtPlayer(8 * e.dm, m.position.x, m.position.z, 4) === 'hit'){ sparks(m.position.x, 0.4, m.position.z, 8, 0xffffff); return true; } }
            return this.life <= 0; }, end(){ scene.remove(m); } }); }
      return { t: 1.0, upd(dt){ this.t -= dt; if (e.lid) e.lid.position.y = Math.abs(Math.sin(time * 30)) * 0.3; return this.t <= 0; } }; },
    lidThrow(e){ if (!e.lid) return null; starShout(e, '¡TAPA VOLADORA!'); const throws = e.p2 ? 2 : 1; let k = 0;
      const one = (off) => { const dir = angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z) + off, line = lineTele(); showLine(line, e.g.position.x, e.g.position.z, dir, 1.6, 9);
        e.lid.updateMatrixWorld(); const m = e.lid.clone(); scene.add(m); const lp = new V3(); e.lid.getWorldPosition(lp); m.position.copy(lp); m.scale.setScalar(1.35); e.lid.visible = false;
        hzFx({ st: 0, d: 0, upd(dt){ this.t += dt;
            if (this.t < 0.6){ pulse(line); m.position.y = lp.y + Math.sin(this.t * 20) * 0.1; return false; } line.visible = false;
            const sp = 13; if (this.st === 0){ m.position.x += Math.sin(dir) * sp * dt; m.position.z += Math.cos(dir) * sp * dt; this.d += sp * dt; if (this.d > 9 || Math.hypot(m.position.x, m.position.z) > ARENA) this.st = 1; }
            else { const dx = e.g.position.x - m.position.x, dz = e.g.position.z - m.position.z, d = Math.hypot(dx, dz); m.position.x += dx / d * sp * dt; m.position.z += dz / d * sp * dt; if (d < 0.6) return true; }
            m.position.y = lerp(m.position.y, 1.0, 1 - Math.exp(-dt * 6)); m.rotation.y += dt * 20;
            if (!this.hit && Math.hypot(m.position.x - hero.position.x, m.position.z - hero.position.z) < 1.1 && hero.position.y < 1.1){ if (hurtPlayer(14 * e.dm, m.position.x, m.position.z, 7) === 'hit') this.hit = true; }
            return this.t > 5; }, end(){ scene.remove(m); scene.remove(line); k++; if (k >= throws && e.lid) e.lid.visible = true; } }); play('boomerang'); };
      one(-0.25 * (throws - 1)); if (throws > 1) later(0.5, () => { if (e.alive) one(0.35); });
      return { t: 0.7 + throws * 0.5, upd(dt){ this.t -= dt; return this.t <= 0; } }; }
  },
  // ERROR 404: pantallazo azul con hueco y lluvia de ventanas
  error: {
    idle: e => e.st === 'idle', reset: e => { e.st = 'idle'; e.t = 1.0; },
    atks: ['bsod', 'popups'],
    bsod(e){ const passes = e.p2 ? 2 : 1; banner('¡PANTALLAZO AZUL!<small>Busca el hueco</small>', 1.0); play('glitch'); document.body.classList.add('glitch-hard');
      const wall = (axis, delay) => later(delay, () => { if (!e.alive) return; const gap = (rnd() - 0.5) * 8, gw = 2.6, from = -8.5, to = 8.5;
        const g = new THREE.Group(); scene.add(g); const mat = makeMat(0xffffff, { map: bsodTex, emissive: 1, opacity: 0.4, side: THREE.DoubleSide });
        for (const [a, b] of [[-9, gap - gw / 2], [gap + gw / 2, 9]]){ const w = b - a; if (w < 0.2) continue; const p = mesh(new THREE.PlaneGeometry(w, 3.4), mat, (a + b) / 2, 1.7, 0, g); }
        if (axis) g.rotation.y = Math.PI / 2; const setPos = v => { if (axis) g.position.set(v, 0, 0); else g.position.set(0, 0, v); }; setPos(from);
        hzFx({ upd(dt){ this.t += dt; if (this.t < 1.0){ mat.uniforms.uOpacity.value = 0.25 + 0.25 * Math.abs(Math.sin(time * 10)); return false; }
            mat.uniforms.uOpacity.value = 0.92; const k = (this.t - 1.0) / 2.6, v = lerp(from, to, Math.min(1, k)); setPos(v);
            const hp_ = axis ? hero.position.x : hero.position.z, along = axis ? -hero.position.z : hero.position.x;
            if (!this.hit && Math.abs(hp_ - v) < 0.45 && Math.abs(along - gap) > gw / 2 - 0.15){ if (hurtPlayer(18 * e.dm, axis ? v : hero.position.x, axis ? hero.position.z : v, 6) === 'hit') this.hit = true; }
            if (rnd() < 0.3) play('tick'); return k >= 1; }, end(){ scene.remove(g); mat.dispose(); } }); });
      wall(0, 0); if (passes > 1) wall(1, 1.8);
      return { t: 1.0 + passes * 1.8, upd(dt){ this.t -= dt; if (this.t <= 0) document.body.classList.remove('glitch-hard'); return this.t <= 0; } }; },
    popups(e){ starShout(e, '¿DESEA CONTINUAR?'); play('glitch');
      for (let k = 0; k < (e.p2 ? 3 : 2); k++){ const a = rnd() * TAU, v = clampArena(new V3(e.g.position.x + Math.cos(a) * 2.5, 0, e.g.position.z + Math.sin(a) * 2.5)); spawnEnemy('popup', [v.x, v.z]); }
      for (let i = 0; i < (e.p2 ? 6 : 4); i++){ const v = i === 0 ? clampArena(new V3(hero.position.x, 0, hero.position.z)) : nearHero(3.2);
        hzCircle(v.x, v.z, 1.1, 0.8 + i * 0.2, (x, z) => { const m = mesh(new THREE.PlaneGeometry(1.4, 0.95), makeMat(0xffffff, { map: popupTex, emissive: 0.6, side: THREE.DoubleSide }), x, 8, z); m.rotation.x = -Math.PI / 2;
          hzFx({ upd(dt){ this.t += dt; m.position.y = 8 * (1 - Math.min(1, this.t / 0.3) ** 2) + 0.06; if (this.t >= 0.3 && !this.hit){ this.hit = true; play('clonk'); shake = Math.max(shake, 0.12); hurtAt(x, z, 1.1, 14 * e.dm, 5); } return this.t > 1.2; }, end(){ scene.remove(m); } }); }); }
      return { t: 1.4, upd(dt){ this.t -= dt; return this.t <= 0; } }; }
  },
  // El de los Seis Ojos: espejismos y eclipse giratorio
  sixeyes: {
    idle: e => e.state === 'chase', reset: e => { e.state = 'chase'; e.cd = 1.0; },
    atks: ['mirage', 'eclipse'],
    mirage(e){ const n = e.p2 ? 4 : 3; starShout(e, 'ESPEJISMO'); play('breath');
      for (let i = 0; i < n; i++){ const a = i / n * TAU + rnd() * 0.6, R = 4.2, v = clampArena(new V3(hero.position.x + Math.cos(a) * R, 0, hero.position.z + Math.sin(a) * R), ARENA - 0.3);
        const g = new THREE.Group(); scene.add(g); g.position.copy(v); mesh(C(0.32, 0.42, 1.6, 7), shadowMat5, 0, 0.8, 0, g); mesh(new THREE.IcosahedronGeometry(0.28, 0), shadowMat5, 0, 1.85, 0, g);
        for (const y of [1.92, 1.8]) for (const s of [-1, 1]) mesh(B(0.08, 0.04, 0.04), eyeMat5, 0.1 * s, y, 0.25, g);
        const line = lineTele(); let dir = 0;
        hzFx({ st: 0, upd(dt){ this.t += dt; const go = 0.6 + i * 0.4;
            if (this.t < go){ dir = angTo(g.position.x, g.position.z, hero.position.x, hero.position.z); g.rotation.y = dir; showLine(line, g.position.x, g.position.z, dir, 1.6, 9); return false; }
            line.visible = false; if (this.st === 0){ this.st = 1; play('swingBig'); }
            g.position.x += Math.sin(dir) * 18 * dt; g.position.z += Math.cos(dir) * 18 * dt;
            if (!this.hit && Math.hypot(hero.position.x - g.position.x, hero.position.z - g.position.z) < 0.8 && hero.position.y < 1.2){ if (hurtPlayer(16 * e.dm, g.position.x, g.position.z, 7) === 'hit') this.hit = true; }
            if (rnd() < 0.7) spawnFx(g.position.x, 1, g.position.z, 0, 0.5, 0, 0x5a3a7a, 0.18, 0.5, -0.5, 1);
            return this.t > go + 0.5; }, end(){ scene.remove(g); scene.remove(line); } }); }
      return { t: 0.6 + n * 0.4 + 0.6, upd(dt){ this.t -= dt; return this.t <= 0; } }; },
    eclipse(e){ const n = e.p2 ? 3 : 2; starShout(e, 'ECLIPSE'); play('kameCharge');
      const warn = circTele(); showCirc(warn, e.g.position.x, e.g.position.z, 7.2); warn.material.uniforms.uOpacity.value = 0.18;
      const g = new THREE.Group(); scene.add(g); g.position.set(e.g.position.x, 0.6, e.g.position.z); g.visible = false;
      for (let k = 0; k < n; k++){ const arm = new THREE.Group(); arm.rotation.y = k / n * TAU; g.add(arm); mesh(B(0.18, 0.12, 7), slashMat5, 0, 0, 3.6, arm); }
      return { t: 0, cd: 0, upd(dt){ this.t += dt; e.g.rotation.y += dt * 10;
          if (this.t < 0.8){ warn.material.uniforms.uOpacity.value = 0.12 + 0.12 * Math.abs(Math.sin(time * 12)); return false; }
          warn.visible = false; g.visible = true; const k = (this.t - 0.8) / 2.0; g.rotation.y = k * TAU * (e.p2 ? 1.3 : 1); g.position.set(e.g.position.x, 0.6, e.g.position.z);
          this.cd -= dt; const ex = hero.position.x - e.g.position.x, ez = hero.position.z - e.g.position.z, d = Math.hypot(ex, ez), ha = Math.atan2(ex, ez);
          if (this.cd <= 0 && d < 7.2 && d > 0.5 && hero.position.y < 0.9) for (let j = 0; j < n; j++){ const la = g.rotation.y + j / n * TAU, diff = Math.abs(((ha - la + Math.PI) % TAU + TAU) % TAU - Math.PI);
              if (diff * d < 0.45){ if (hurtPlayer(14 * e.dm, e.g.position.x, e.g.position.z, 5) === 'hit') this.cd = 0.6; break; } }
          if (rnd() < 0.5) play('swing'); return k >= 1; }, end(){ scene.remove(g); scene.remove(warn); } }; }
  },
  // El Gato: ovillo gigante y zarpazo en X
  finalcat: {
    idle: e => e.st === 'idle', reset: e => { e.st = 'idle'; e.t = 1.0; },
    atks: ['yarn', 'scratch'],
    yarn(e){ starShout(e, '¡OVILLO!'); play('meow'); const g = new THREE.Group(); scene.add(g); g.position.set(e.g.position.x, 1.1, e.g.position.z);
      mesh(new THREE.IcosahedronGeometry(1.1, 1), yarnMat, 0, 0, 0, g); for (let k = 0; k < 4; k++){ const r = mesh(new THREE.TorusGeometry(1.08, 0.05, 4, 18), yarnLine, 0, 0, 0, g); r.rotation.set(k * 0.8, k * 1.3, 0); }
      const a = angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z); const sp = e.phase === 3 ? 8 : 6.5;
      hzFx({ vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, life: e.phase === 3 ? 6 : 4.5, cd: 0, upd(dt){ this.life -= dt; this.cd -= dt; g.position.x += this.vx * dt; g.position.z += this.vz * dt;
          const r = Math.hypot(g.position.x, g.position.z); if (r > ARENA - 1.1){ const nx = g.position.x / r, nz = g.position.z / r, dot = this.vx * nx + this.vz * nz; this.vx -= 2 * dot * nx; this.vz -= 2 * dot * nz; g.position.x = nx * (ARENA - 1.15); g.position.z = nz * (ARENA - 1.15); play('boing'); shake = Math.max(shake, 0.15); }
          g.rotation.x += this.vz * dt; g.rotation.z -= this.vx * dt;
          if (this.cd <= 0 && Math.hypot(g.position.x - hero.position.x, g.position.z - hero.position.z) < 1.5 && hero.position.y < 1.6){ if (hurtPlayer(15 * e.dm, g.position.x, g.position.z, 9) === 'hit') this.cd = 0.8; }
          if (this.life < 0.4) g.scale.setScalar(Math.max(0.01, this.life / 0.4)); return this.life <= 0; }, end(){ scene.remove(g); } });
      return { t: 0.8, upd(dt){ this.t -= dt; return this.t <= 0; } }; },
    scratch(e){ starShout(e, '¡ZARPAZO!'); const cx = hero.position.x, cz = hero.position.z, L = 10, base = rnd() * Math.PI;
      for (const a of [base + Math.PI / 4, base - Math.PI / 4]){ const sx = cx - Math.sin(a) * L / 2, sz = cz - Math.cos(a) * L / 2;
        hzLine(sx, sz, a, L, 1.4, 0.85, () => { for (let k = 0; k < 3; k++){ tB.set(cx + Math.cos(a) * (k - 1) * 0.3, 1, cz - Math.sin(a) * (k - 1) * 0.3); slashFx(tB, a + Math.PI / 2, 0xff5a3a, L, true); }
          play('iaido'); shake = Math.max(shake, 0.3); if (inLineHit(sx, sz, a, L, 0.7) && hero.position.y < 1.2) hurtPlayer(18 * e.dm, cx, cz, 6); }); }
      if (e.phase === 3) later(0.6, () => { if (!e.alive) return; const cx2 = hero.position.x, cz2 = hero.position.z; for (const a of [0, Math.PI / 2]){ const sx = cx2 - Math.sin(a) * L / 2, sz = cz2 - Math.cos(a) * L / 2;
        hzLine(sx, sz, a, L, 1.4, 0.75, () => { tB.set(cx2, 1, cz2); slashFx(tB, a + Math.PI / 2, 0xff5a3a, L, true); play('iaido'); if (inLineHit(sx, sz, a, L, 0.7) && hero.position.y < 1.2) hurtPlayer(18 * e.dm, cx2, cz2, 6); }); } });
      return { t: 1.2, upd(dt){ this.t -= dt; e.arms.forEach(A => { A.rotation.x = lerp(A.rotation.x, -2.5, 1 - Math.exp(-dt * 10)); }); return this.t <= 0; } }; }
  }
};
function bossX(e, dt, dist, toP, face, move){
  const D = BX[e.type]; if (!D) return false;
  if (!e.p2 && e.hp < e.maxHp * 0.5 && e.alive){ e.p2 = true; e.x5cd = Math.min(e.x5cd || 1, 1.2); starShout(e, '¡FASE 2!'); flash('#ffffff', 0.25); shake = Math.max(shake, 0.35); play('roar');
    ringFx(e.g.position.x, e.g.position.z, 0xffd970, 0.4, 4, 0.5); barkOnce('phase2_' + e.type, '¡Está sacando ataques nuevos! ¡Al 50 % se ponen serios!'); }
  if (e.x5){ let done = true; try { done = e.x5.upd(dt); } catch (err) { console.error(err); }
    if (done){ if (e.x5.end) e.x5.end(); e.x5 = null; e.x5cd = (e.p2 ? 3 : 4.5) + rnd() * 2; D.reset(e); } else if (D.parallel) D.hold(e);
    return !D.parallel; }
  e.x5cd = (e.x5cd == null ? 3.5 : e.x5cd) - dt;
  if (e.x5cd <= 0 && D.idle(e) && !player.dead && !invActive && gameState === 'play' && e.spawnT <= 0){
    const opts = D.atks.filter(a => a !== e.x5last); const a = opts[Math.floor(rnd() * opts.length)]; const atk = D[a](e);
    if (atk){ e.x5 = atk; e.x5last = a; if (D.parallel) D.hold(e); return !D.parallel; }
    e.x5cd = 1;
  }
  return false;
}
const _spawnEnemyB5 = spawnEnemy;
spawnEnemy = function(type, at){
  const e = _spawnEnemyB5(type, at);
  if (e && e.isBoss && BX[e.type] && !e.x5wrap){ e.x5wrap = true;
    const base = e.upd || (e.type === 'dragon' ? ((q, dt) => updDragon(q, dt)) : updBrute);
    e.upd = function(q, dt, dist, toP, face, move){ if (bossX(q, dt, dist, toP, face, move)) return; base(q, dt, dist, toP, face, move); }; }
  return e;
};
const _killEnemyB5 = killEnemy;
killEnemy = function(e){ const boss = e.isBoss && e.alive; _killEnemyB5(e); if (boss){ clearHZ(); if (e.x5 && e.x5.end) e.x5.end(); e.x5 = null; document.body.classList.remove('glitch-hard'); if (e.lid) e.lid.visible = true; } };
const _clearWorldB5 = clearWorld;
clearWorld = function(){ _clearWorldB5(); clearHZ(); clearStarInv(); };
const _sweepHazardsB5 = sweepHazards;
sweepHazards = function(){ _sweepHazardsB5(); clearHZ(); };
