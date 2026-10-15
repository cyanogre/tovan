'use strict';
/* ---------- Resolución ---------- */
const RES = [{ label: '320×240', h: 240 }, { label: '640×480', h: 480 }, { label: 'Nativa', h: 0 }];
let resIdx = 0;
function resize(){
  const W = innerWidth, H = innerHeight, r = resOverride || RES[resIdx];
  let w, h;
  if (r.h){ const k = r.h / Math.min(W, H); w = Math.round(W * k); h = Math.round(H * k); }
  else { const dpr = Math.min(window.devicePixelRatio || 1, 2); w = Math.round(W * dpr); h = Math.round(H * dpr); }
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  shared.uRes.value.set(w, h);
  camera.aspect = W / H; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
