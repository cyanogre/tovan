// Graba el tráiler del juego (js/cinematicas/trailer.js) a vídeo.
// Uso:  node trailer_video.js <proyecto> <salida.mp4> [fps=30] [ancho=1280] [alto=720]
// Necesita Playwright con Chromium y ffmpeg. Dos pasadas:
//   1) Imagen: el bucle del juego avanza a mano, fotograma a fotograma (dt = 1/fps exacto),
//      y las animaciones y transiciones CSS se ponen en su sitio con el reloj virtual antes de cada captura.
//   2) Sonido: el mismo guion en tiempo real, sin dibujar (va ligero), grabando la salida de WebAudio.
// Al final ffmpeg junta las capturas y el sonido.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [DIR, OUT, FPS_ = '30', W_ = '1280', H_ = '720'] = process.argv.slice(2);
const FPS = +FPS_, W = +W_, H = +H_, DT = 1000 / FPS;
const TMP = fs.mkdtempSync(path.join(path.dirname(path.resolve(OUT)), 'trailer-'));
const wait = ms => new Promise(r => setTimeout(r, ms));
const INIT = (modo) => {
  localStorage.setItem('tovan-fs', '0'); localStorage.setItem('tovan-tuto', '1');
  localStorage.setItem('tovan-meta', JSON.stringify({ frag: 0, lv: {}, runs: 3, kills: 0, best: 3, intro2: true, introSeen: true }));
  // el bucle (requestAnimationFrame) queda en nuestras manos
  window.__raf = []; window.__t = 0; window.requestAnimationFrame = cb => { window.__raf.push(cb); return 1; };
  window.__step = () => { const cbs = window.__raf; window.__raf = []; window.__t += 1000 / window.__fps; for (const cb of cbs) cb(window.__t); };
  if (modo === 'audio'){   // toda la salida de WebAudio va también a una grabadora
    const AC = window.AudioContext;
    window.AudioContext = function(){ const c = new AC(); const d = c.createMediaStreamDestination(); c.__rec = d;
      const rec = new MediaRecorder(d.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 }); window.__chunks = []; rec.ondataavailable = e => window.__chunks.push(e.data); rec.start(); window.__rec = rec; return c; };
    window.AudioContext.prototype = AC.prototype;
    const con = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(dst, ...r){ const out = con.call(this, dst, ...r); if (dst && this.context && dst === this.context.destination && this.context.__rec) con.call(this, this.context.__rec); return out; };
  }
};
async function abre(b, modo){
  const c = await b.newContext({ viewport: { width: W, height: H } }), p = await c.newPage();
  p.on('pageerror', e => console.log('ERROR', String(e).slice(0, 300)));
  await p.addInitScript(INIT, modo);
  await p.goto('file://' + path.resolve(DIR) + '/index.html');
  await p.waitForFunction(() => typeof gameState !== 'undefined' && window.__raf.length > 0, null, { timeout: 60000 });
  await p.evaluate(fps => { window.__fps = fps; window.__t = performance.now(); resIdx = 1; resize(); document.body.classList.add('grabando'); }, FPS);
  for (let i = 0; i < 20; i++) await p.evaluate(() => window.__step());   // que se asiente la pantalla de título
  return p;
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  // ── 1) Imagen ──
  let p = await abre(b, 'video');
  await p.evaluate(() => { runTrailer(); window.__v0 = window.__t; window.__anim = new Map(); });
  let n = 0;
  for (;;){
    const fin = await p.evaluate(() => {
      window.__step();
      const v = window.__t - window.__v0;   // reloj virtual (ms desde el inicio del tráiler)
      for (const a of document.getAnimations()){ if (!window.__anim.has(a)) window.__anim.set(a, v); a.pause(); a.currentTime = v - window.__anim.get(a); }
      return !cs.active && gameState === 'title';
    });
    await p.screenshot({ path: path.join(TMP, `f${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    n++; if (n % 150 === 0) console.log('fotogramas', n, '(' + (n / FPS).toFixed(1) + ' s)');
    if (fin || n > FPS * 150) break;
  }
  console.log('imagen lista:', n, 'fotogramas');
  await p.context().close();
  // ── 2) Sonido ──
  p = await abre(b, 'audio');
  const ms = Math.ceil(n * DT);
  await p.evaluate(() => { renderer.render = () => {}; });   // sin dibujar: así el bucle aguanta el tiempo real
  await p.evaluate(() => { runTrailer(); window.__iv = setInterval(() => window.__step(), 1000 / window.__fps); });
  await wait(ms + 600);
  const b64 = await p.evaluate(async () => { clearInterval(window.__iv); window.__rec.stop(); await new Promise(r => setTimeout(r, 400));
    const blob = new Blob(window.__chunks, { type: 'audio/webm' }), buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); return btoa(s); });
  fs.writeFileSync(path.join(TMP, 'audio.webm'), Buffer.from(b64, 'base64'));
  await b.close();
  // ── 3) Montaje ──
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(TMP, 'f%05d.jpg'), '-i', path.join(TMP, 'audio.webm'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', '-shortest', OUT], { stdio: 'inherit' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('listo:', OUT, (fs.statSync(OUT).size / 1048576).toFixed(1), 'MB');
})();
