"""Copia un proyecto, lo instrumenta para registrar cada textura creada (lienzo, pila de llamadas,
consumo de rnd) y lo ejecuta en Chrome headless. Deja <nombre>.json con todos los registros.
Uso: py -3 tex_record.py <proyecto> <nombre> [extra]   (extra=1 -> además cubemap, retratos, show)"""
import os, sys, shutil, subprocess, json, re, html
HERE = os.path.dirname(os.path.abspath(__file__))
src, name = sys.argv[1], sys.argv[2]
extra = len(sys.argv) > 3 and sys.argv[3] == '1'
dst = os.path.join(HERE, 'rec_' + name)
if os.path.exists(dst):
    shutil.rmtree(dst)
def _ign(d, names):
    base = os.path.relpath(d, src).replace('\\', '/')
    return [n for n in names if (base == '.' and n in ('backup',)) or (base == 'assets' and n == 'audio') or n.endswith('.md')]
shutil.copytree(src, dst, ignore=_ign)

# renderer.js: contar llamadas a rnd y el consumo de cada canvasTex
rp = os.path.join(dst, 'js', 'motor', 'renderer.js')
r = open(rp, encoding='utf-8').read()
r = r.replace('const rnd = mulberry32(1997);', 'const rnd = (() => { const f = mulberry32(1997); return () => { window.__rndN++; return f(); }; })();')
assert '__rndN++' in r
if 'function canvasTex(w, h, draw){' in r:
    r = r.replace("const g = c.getContext('2d'); draw(g, w, h);", "const g = c.getContext('2d'); const r0 = window.__rndN; draw(g, w, h); window.__lastTexRnd = window.__rndN - r0;")
    assert '__lastTexRnd' in r
open(rp, 'w', encoding='utf-8', newline='\n').write(r)

HEAD = r'''<script>
window.__rndN = 0; window.__rec = []; window.__lastTexRnd = 0;
(function(){ var s = 777; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
window.__errs = []; addEventListener('error', function(e){ __errs.push(String(e.message) + ' @ ' + e.filename + ':' + e.lineno); }, true);
</script>'''
REC = r'''<script>
(function(){
  function stack(){ return (new Error().stack || '').split('\n').slice(3, 9).map(function(s){ s = s.trim().replace(/^at /, ''); var m = s.match(/js\/(.*?):(\d+):(\d+)/); var fn = s.split(' (')[0]; return (m ? m[1] + ':' + m[2] + ':' + m[3] : s) + (fn && fn.indexOf('file:') < 0 ? ' [' + fn + ']' : ''); }); }
  var O = THREE.CanvasTexture;
  function W(c, a, b, d, e, f, g, h, i){ var t = new O(c, a, b, d, e, f, g, h, i); __rec.push({ kind: 'tex', c: c, t: t, st: stack(), rnd: window.__lastTexRnd || 0 }); window.__lastTexRnd = 0; return t; }
  W.prototype = O.prototype; THREE.CanvasTexture = W;
  var OC = THREE.CubeTexture;
  function WC(imgs, a, b, d, e, f, g, h, i){ var t = new OC(imgs, a, b, d, e, f, g, h, i); (imgs || []).forEach(function(c, k){ __rec.push({ kind: 'cube' + k, c: c, t: t, st: stack(), rnd: 0 }); }); return t; }
  WC.prototype = OC.prototype; THREE.CubeTexture = WC;
})();
</script>'''
TAIL = r'''<pre id="__out"></pre>
<script>
window.__rndLoad = window.__rndN;
setTimeout(function(){
  var EXTRA = %s;
  if (EXTRA){
    try { buildEnv(); } catch (e) { __errs.push('buildEnv: ' + e); }
    try { var s9 = starFace9(); __rec.push({ kind: 'show', c: s9, st: ['show/starFace9'], rnd: 0 }); } catch (e) { __errs.push('starFace9: ' + e); }
    ['drawCat', 'drawStar', 'drawPhone', 'drawLumen'].forEach(function(fn){ try { var c = document.createElement('canvas'); c.width = c.height = 32; window[fn](c); __rec.push({ kind: 'retrato', c: c, st: [fn], rnd: 0 }); } catch (e) { __errs.push(fn + ': ' + e); } });
    try { var bg = getComputedStyle(document.getElementById('tvStatic')).backgroundImage; __rec.push({ kind: 'css', url: bg.slice(5, -2), st: ['tvStatic'], rnd: 0 }); } catch (e) { __errs.push('tvStatic: ' + e); }
  }
  var out = __rec.map(function(r, i){
    var o = { i: i, kind: r.kind, st: r.st, rnd: r.rnd };
    if (r.url){ o.data = r.url; return o; }
    var c = r.c; o.w = c.width; o.h = c.height; o.tag = c.tagName;
    try { o.data = c.toDataURL('image/png'); } catch (e) { o.err = String(e); }
    if (r.t){ o.wrap = [r.t.wrapS, r.t.wrapT]; o.filt = [r.t.magFilter, r.t.minFilter]; o.mip = r.t.generateMipmaps; o.enc = r.t.encoding; o.aniso = r.t.anisotropy; o.rep = [r.t.repeat.x, r.t.repeat.y]; }
    try { var g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, hsh = 2166136261; for (var k = 0; k < d.length; k++){ hsh ^= d[k]; hsh = Math.imul(hsh, 16777619); } o.hash = (hsh >>> 0).toString(16); } catch (e) { o.hash = 'ERR ' + e; }
    return o; });
  document.getElementById('__out').textContent = JSON.stringify({ recs: out, rndLoad: window.__rndLoad, errs: window.__errs });
}, 1500);
</script>
''' % ('true' if extra else 'false')

ip = os.path.join(dst, 'index.html')
h = open(ip, encoding='utf-8').read()
h = h.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + HEAD + '\n', 1)
three = re.search(r'<script src="https://cdnjs[^"]+three\.min\.js"></script>\n', h).group(0)
h = h.replace(three, three + REC + '\n', 1)
i = h.rindex('</body>')
h = h[:i] + TAIL + h[i:]
open(ip, 'w', encoding='utf-8', newline='\n').write(h)

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
prof = os.path.join(HERE, 'prof-rec-' + name)
if os.path.exists(prof):
    shutil.rmtree(prof, ignore_errors=True)
url = 'file:///' + ip.replace('\\', '/')
res = subprocess.run([chrome, '--headless=new', '--no-first-run', f'--user-data-dir={prof}', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                      '--window-size=1280,720', '--virtual-time-budget=4000', '--dump-dom', url], capture_output=True, timeout=300)
dom = res.stdout.decode('utf-8', 'replace')
m = re.search(r'<pre id="__out">(.*?)</pre>', dom, re.S)
data = json.loads(html.unescape(m.group(1)))
json.dump(data, open(os.path.join(HERE, name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('registros:', len(data['recs']), ' rnd al cargar:', data['rndLoad'], ' errores:', data['errs'])
