'use strict';
/* ---------- Motor de guion (async con tiempo de juego) ---------- */
const cs = { active: false, t: 0, waits: [], tweens: [], cam: null, camT0: 0, tick: null, pose: { hold: 0, reach: 0, look: 0, armsUp: 0, readDown: 0 }, walk: false, aborted: false };
const csAbortErr = new Error('cinemática saltada');
const quiet = pr => { pr.catch(() => {}); return pr; };                    // cancelar la cinemática no debe dejar errores sueltos
function csWait(s){ return quiet(new Promise((res, rej) => { if (cs.aborted) return rej(csAbortErr); cs.waits.push({ t: s, res, rej }); })); }
function csTween(dur, fn){ return quiet(new Promise((res, rej) => { if (cs.aborted) return rej(csAbortErr); cs.tweens.push({ t: 0, dur, fn, res, rej }); })); }
function csSay(lines){ return quiet(new Promise((res, rej) => { if (cs.aborted) return rej(csAbortErr); cs.sayRej = rej; say(lines, res, true); })); }
function csShot(fn){ cs.cam = fn; cs.camT0 = cs.t; }
function dollyShot(p0, p1, l0, l1, dur){ return (cam, t) => { const k = smooth(clamp(t / dur, 0, 1));
  cam.position.set(lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)); cam.lookAt(lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k), lerp(l0[2], l1[2], k)); }; }
function csUpdate(dt){
  if (!cs.active) return;
  cs.t += dt;
  for (let i = cs.waits.length - 1; i >= 0; i--){ const w = cs.waits[i]; w.t -= dt; if (w.t <= 0){ cs.waits.splice(i, 1); w.res(); } }
  for (let i = cs.tweens.length - 1; i >= 0; i--){ const w = cs.tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur); w.fn(k); if (k >= 1){ cs.tweens.splice(i, 1); w.res(); } }
  if (cs.tick) cs.tick(dt);
  catTail.rotation.y = Math.sin(time * 2.2) * 0.5; catHead.rotation.y = Math.sin(time * 0.5) * 0.3;
  if (ambMode === 'rain'){ cs.rainT = (cs.rainT || 0) - dt; if (cs.rainT <= 0){ cs.rainT = 0.16; play('rain'); } }
}
function csCamera(cam){ if (cs.active && cs.cam) cs.cam(cam, cs.t - cs.camT0); }
function csApplyPose(){
  if (!cs.active) return;
  const p = cs.pose;
  if (p.hold > 0.001) for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){
    bl(A.sh.rotation, 'x', -0.95, p.hold); bl(A.sh.rotation, 'z', -0.2 * s, p.hold); bl(A.sh.rotation, 'y', 0, p.hold); bl(A.el.rotation, 'x', -0.95, p.hold); bl(A.el.rotation, 'z', 0, p.hold); }
  if (p.reach > 0.001){ bl(P.armR.sh.rotation, 'x', -1.75, p.reach); bl(P.armR.sh.rotation, 'z', 0.05, p.reach); bl(P.armR.el.rotation, 'x', -0.15, p.reach); }
  if (p.armsUp > 0.001) for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 2.3 * s, p.armsUp); bl(A.sh.rotation, 'x', -0.2, p.armsUp); bl(A.el.rotation, 'x', -0.1, p.armsUp); }
  if (p.look) bl(P.neck.rotation, 'x', -p.look, 1);
  if (p.readDown > 0.001) bl(P.neck.rotation, 'x', 0.45, p.readDown);
}
const cineEls = { top: document.getElementById('cineTop'), bot: document.getElementById('cineBot'), cap: document.getElementById('csCap'), label: document.getElementById('csLabel'),
  skip: document.getElementById('csSkip'), white: document.getElementById('csWhite'), shout: document.getElementById('csShout') };
function csCaption(text){ cineEls.cap.textContent = text || ''; cineEls.cap.classList.toggle('on', !!text); }
function csShout(text){ cineEls.shout.textContent = text; cineEls.shout.classList.remove('on'); void cineEls.shout.offsetWidth; cineEls.shout.classList.add('on'); }
const tw = (p0, p1, fn) => k => fn(lerp(p0, p1, smooth(k)));
