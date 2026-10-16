'use strict';
/* ---------- Retratos (PNG en assets/texturas/retratos) ---------- */
function drawPortraitImg(c, nombre){ const g = c.getContext && c.getContext('2d'); if (!g) return; g.imageSmoothingEnabled = false; g.clearRect(0, 0, 32, 32); g.drawImage(assetImg(nombre), 0, 0); }
function drawLumen(c){
  const g = c.getContext && c.getContext('2d'); if (!g) return;
  g.imageSmoothingEnabled = false; g.fillStyle = '#0a0c30'; g.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 14; i++){ g.fillStyle = 'rgba(73,216,255,0.35)'; g.fillRect(rnd() * 32 | 0, rnd() * 32 | 0, 1, 1); }   // brillos al azar
  g.drawImage(assetImg('retratos/lumen'), 0, 0);
}
function drawCat(c){ drawPortraitImg(c, 'retratos/gato'); }
function drawTovan(c, happy){
  const g = c.getContext && c.getContext('2d'); if (!g) return;
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 32, 32);
  const t = happy ? faceHappy : faceTex; if (t.image) g.drawImage(t.image, 0, 0, 32, 32);
}

/* ---------- Diálogos ---------- */
const dlgEl = document.getElementById('dlg'), dlgPic = document.getElementById('dlgPic'), dlgName = document.getElementById('dlgName'), dlgText = document.getElementById('dlgText'), dlgArrow = document.getElementById('dlgArrow');
const dlg = { lines: null, i: 0, chars: 0, done: null, blip: 0 };
function say(lines, done, keep){
  if (!lines || !lines.length){ if (done) done(); return; }
  gameState = 'cutscene'; dlg.lines = lines; dlg.i = 0; dlg.done = done || null; dlg.keep = !!keep; dlgEl.hidden = false; showDlgLine();
  bannerEl.hidden = true; bannerT = 0;
}
function sayOnce(key, lines, done){
  if (!meta.seen) meta.seen = {};
  if (meta.seen[key]){ if (done) done(); return; }
  meta.seen[key] = true; saveMeta(); say(lines, done);
}
function showDlgLine(){
  const [who, , mood] = dlg.lines[dlg.i]; dlg.chars = 0; dlgArrow.style.visibility = 'hidden'; dlgText.textContent = '';
  const isL = who === 'lumen' || who === 'lumen?';
  dlgEl.className = 'win who-' + (isL ? 'lumen' : who);
  dlgName.textContent = who === 'tovan' ? 'Tovan' : who === 'lumen' ? 'Lumen' : who === 'lumen?' ? '???' : who === 'gato' ? 'Gato' : who === 'star' ? 'Míster Confianza' : who === 'jefe' ? 'Jefe (por teléfono)' : '';
  dlgPic.style.display = who === 'narr' ? 'none' : '';
  if (isL) drawLumen(dlgPic); else if (who === 'tovan') drawTovan(dlgPic, mood === 'happy'); else if (who === 'gato') drawCat(dlgPic); else if (who === 'star') drawStar(dlgPic); else if (who === 'jefe') drawPhone(dlgPic);
  if (who === 'tovan' && mood === 'happy') waveT = 1.2;
}
function advanceDlg(){
  if (gameState !== 'cutscene' || !dlg.lines) return;
  const full = dlg.lines[dlg.i][1];
  if (dlg.chars < full.length){ dlg.chars = full.length; dlgText.textContent = full; dlgArrow.style.visibility = 'visible'; return; }
  dlg.i++; play('cursor');
  if (dlg.i >= dlg.lines.length) endDlg(); else showDlgLine();
}
function endDlg(){
  dlgEl.hidden = true; dlg.lines = null; gameState = dlg.keep ? 'cutscene' : 'play';
  const d = dlg.done; dlg.done = null; if (d) d();
}
function updateDlg(dt){
  if (gameState !== 'cutscene' || !dlg.lines) return;
  const [who, full] = dlg.lines[dlg.i];
  if (dlg.chars < full.length){
    const before = Math.floor(dlg.chars); dlg.chars = Math.min(full.length, dlg.chars + dt * 42);
    dlgText.textContent = full.slice(0, Math.floor(dlg.chars));
    if (Math.floor(dlg.chars) !== before && Math.floor(dlg.chars) % 3 === 0 && full[Math.floor(dlg.chars) - 1] !== ' ') play(who === 'tovan' ? 'talkT' : who.startsWith('lumen') ? 'talkL' : 'talkN');
    if (dlg.chars >= full.length) dlgArrow.style.visibility = 'visible';
  }
}
dlgEl.addEventListener('click', e => { if (e.target.id === 'dlgSkip') return; advanceDlg(); });
document.getElementById('dlgSkip').addEventListener('click', e => { e.stopPropagation(); play('confirm'); endDlg(); });

/* ---------- Comentarios de Lumen durante la partida ---------- */
const barkEl = document.getElementById('bark'), barkText = document.getElementById('barkText');
drawLumen(document.getElementById('barkPic'));
let barkT = 0, barkSaid = {};
// El retrato se pinta al cargar, pero si la hoja de texturas aún no estaba decodificada salía vacío: se repinta en cada comentario (sin gastar rnd())
const barkPic = document.getElementById('barkPic');
function barkRetrato(){ const g = barkPic.getContext('2d'); if (!g) return; g.imageSmoothingEnabled = false; g.drawImage(assetImg('retratos/lumen'), 0, 0); }
let barkHabla = 0, barkTic = 0;   // el «bla bla» de Lumen, como en los diálogos: un tic cada 3 letras mientras «dice» el texto
function bark(text){ if (barkT > 0.6) return; barkRetrato(); barkText.textContent = text; barkEl.hidden = false; barkT = 3.4; barkHabla = Math.min(1.6, text.length * 0.022); barkTic = 0; play('talkL'); }
function barkOnce(key, text){ if (barkSaid[key]) return; barkSaid[key] = true; bark(text); }
function updateBark(dt){ if (barkHabla > 0){ barkHabla -= dt; if ((barkTic -= dt) <= 0){ barkTic = 0.066; play('talkL'); } }
  if (barkT > 0){ barkT -= dt; barkEl.style.opacity = String(Math.min(1, barkT / 0.3)); if (barkT <= 0) barkEl.hidden = true; } }
