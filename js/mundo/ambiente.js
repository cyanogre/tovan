'use strict';
/* ---------- Partículas de ambiente (pétalos, nieve) ---------- */
const ambMat = makeMat(0xffc0d8, { emissive: 0.7, side: THREE.DoubleSide });
const ambGeo = new THREE.PlaneGeometry(1, 1);
let ambMode = null;
const ambP = Array.from({ length: 90 }, () => { const m = mesh(ambGeo, ambMat, 0, -20, 0); m.visible = false; m.userData = { ph: rnd() * 6, sp: 0.7 + rnd() * 0.6 }; return m; });
function updateAmbient(dt, cx, cz){
  if (!ambMode) return;
  const snow = ambMode === 'snow', rain = ambMode === 'rain';
  for (const p of ambP){
    const u = p.userData;
    if (!p.visible || p.position.y < 0.02){
      const fresh = !p.visible; p.visible = true;
      p.position.set(cx + (rnd() - 0.5) * 18, fresh ? rnd() * 7 : 6 + rnd() * 2, cz + (rnd() - 0.5) * 18);
      if (rain) p.scale.set(0.022, 0.5, 1); else if (snow) p.scale.set(0.07, 0.07, 1); else p.scale.set(0.13, 0.08, 1);
    }
    if (rain){ p.position.y -= 11 * u.sp * dt; p.position.x += 0.8 * dt; p.rotation.set(0, Math.atan2(camera.position.x - p.position.x, camera.position.z - p.position.z), 0.06); if (Math.abs(p.position.x - cx) > 10) p.position.y = -1; continue; }
    p.position.y -= (snow ? 1.0 : 0.55) * u.sp * dt;
    p.position.x += (Math.sin(time * (snow ? 0.8 : 1.6) + u.ph) * (snow ? 0.25 : 0.9) + (snow ? 0.3 : 0.45)) * dt;
    p.position.z += Math.cos(time * 1.1 + u.ph) * (snow ? 0.15 : 0.5) * dt;
    p.rotation.set(time * 2 * u.sp + u.ph, time * 1.3 + u.ph, 0);
    if (Math.abs(p.position.x - cx) > 10 || Math.abs(p.position.z - cz) > 10) p.position.y = -1;
  }
}
