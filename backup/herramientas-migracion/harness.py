"""Crea <dir>/index.test.html: el index.html con un capturador de errores, Math.random
con semilla y una sesión de juego scripteada que deja un informe en el DOM."""
import sys, os
d = sys.argv[1]
src = open(os.path.join(d, 'index.html'), encoding='utf-8').read()
HEAD = r'''<script>
(function(){
  var s = 12345; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.requestAnimationFrame = function(cb){ return setTimeout(function(){ cb(performance.now()); }, 16); };
  window.__errs = [];
  addEventListener('error', function(e){
    var tg = e.target;
    if (tg && tg !== window && (tg.src || tg.href)) __errs.push('RECURSO: ' + (tg.src || tg.href).split('/').slice(-3).join('/'));
    else __errs.push('ERROR: ' + e.message + ' @ ' + String(e.filename || '').split('/').slice(-2).join('/') + ':' + e.lineno);
  }, true);
  addEventListener('unhandledrejection', function(e){ __errs.push('PROMESA: ' + e.reason); });
  var ce = console.error; console.error = function(){ __errs.push('console.error: ' + [].map.call(arguments, String).join(' ')); return ce.apply(console, arguments); };
})();
</script>
'''
TAIL = r'''<pre id="__report"></pre>
<script>
(function(){
  var R = { steps: [] }, $ = function(id){ return document.getElementById(id); };
  function vis(id){ var e = $(id); return !!(e && !e.hidden); }
  function snap(label){
    R.steps.push({ label: label, focus: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '', title: vis('titleScr'), hud: vis('hud'), over: vis('overScr'), pause: vis('pauseScr'), up: vis('upScr'),
      dlg: vis('dlg'), wave: ($('waveTxt') || {}).textContent, hp: ($('hpTxt') || {}).textContent, mp: ($('mpTxt') || {}).textContent,
      body: document.body.className, banner: vis('banner') ? $('banner').textContent : '', cards: document.querySelectorAll('#cards .card').length,
      combo: vis('comboBox') ? $('comboNum').textContent : '', nums: document.querySelectorAll('#dmg .dmg').length, chips: document.querySelectorAll('#tags .chip').length, boss: vis('bossBox'), ach: vis('achScr'), ward: vis('wardScr'), shrine: vis('shrineScr'), ends: vis('endScr'), menu: !$('menu').classList.contains('closed') });
    out();
  }
  function digest(){ var D = {}; var all = document.body.querySelectorAll('*'); for (var i = 0; i < all.length; i++){ var el = all[i]; if (el.id === '__report' || el.tagName === 'SCRIPT') continue; var cs = getComputedStyle(el), v = []; for (var k = 0; k < cs.length; k++){ var p = cs[k]; v.push(p + ':' + cs.getPropertyValue(p)); } var path = el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''); var key = path; var c = 1; while (D[key]) key = path + '~' + (++c); D[key] = v.join(';'); } return D; }
  function out(){ R.errs = window.__errs; R.audio = [].map.call(document.querySelectorAll('audio'), function(a){ return a.src.split('/').slice(-3).join('/') + ' rs=' + a.readyState + (a.error ? ' ERR' + a.error.code : ''); });
    try { R.tracks = Object.keys(tracks).map(function(k){ var a = tracks[k].a; return k + ' rs=' + a.readyState + ' ok=' + tracks[k].ok + (a.error ? ' ERR' + a.error.code : '') + ' ' + a.src.split('/').slice(-3).join('/'); }); } catch (e) {}
    $('__report').textContent = JSON.stringify(R); }
  function key(code, type){ window.dispatchEvent(new KeyboardEvent(type || 'keydown', { code: code, key: code, bubbles: true })); }
  function tap(code){ key(code); setTimeout(function(){ key(code, 'keyup'); }, 60); }
  function click(id){ var e = $(id); if (e) e.click(); }
  var play = null, n = 0;
  var seq = [
    [800, function(){ snap('inicio'); R.css = digest(); }],
    [900, function(){ click('achBtn'); }], [1300, function(){ snap('logros'); }], [1400, function(){ tap('Escape'); }],
    [1600, function(){ click('wardBtn'); }], [2000, function(){ snap('vestidor'); }], [2100, function(){ tap('Escape'); }],
    [2300, function(){ click('shrineBtn'); }], [2700, function(){ snap('santuario'); }], [2800, function(){ tap('Escape'); }],
    [3000, function(){ click('endBtn'); }], [3400, function(){ snap('finales'); }], [3500, function(){ click('endScrBack'); }],
    [3700, function(){ click('optBtn'); }], [4000, function(){ snap('opciones'); }], [4100, function(){ click('menuHead'); }],
    [4500, function(){ click('startBtn'); }], [7000, function(){ snap('intro'); }],
    [7100, function(){ tap('Escape'); }], [7400, function(){ if (vis('dlg')) tap('Escape'); }], [9500, function(){ if (vis('pauseScr')) click('resumeBtn'); snap('tras-intro'); }],
    [9600, function(){ play = setInterval(function(){
        n++;
        if (vis('pauseScr')) { click('resumeBtn'); return; }
        if (vis('upScr')) { tap('Digit1'); return; }
        if (vis('dlg')) { tap('Enter'); return; }
        var ks = ['KeyJ', 'KeyJ', 'KeyK', 'Space', 'KeyL', 'KeyJ', 'KeyJ'];
        tap(ks[n % ks.length]);
        var mv = ['KeyW', 'KeyD', 'KeyS', 'KeyA'][Math.floor(n / 12) % 4];
        ['KeyW', 'KeyD', 'KeyS', 'KeyA'].forEach(function(k){ key(k, k === mv ? 'keydown' : 'keyup'); });
      }, 120); }],
    [16000, function(){ snap('jugando-6s'); }], [20000, function(){ snap('jugando-10s'); }],
    [24000, function(){ snap('jugando-14s'); }],
    [24100, function(){ clearInterval(play); tap('Escape'); }], [24600, function(){ snap('pausa'); }],
    [24700, function(){ click('resumeBtn'); }], [25200, function(){ snap('reanudar'); }],
    [25300, function(){ tap('Escape'); }], [25600, function(){ click('quitBtn'); }], [28000, function(){ snap('rendirse'); }],
    [28200, function(){ click('menuBtn'); }], [29000, function(){ snap('titulo'); }]
  ];
  seq.forEach(function(s){ setTimeout(s[1], s[0]); });
  out();
})();
</script>
'''
assert '<meta charset="utf-8">\n' in src
src = src.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + HEAD, 1)
i = src.rindex('</body>')
src = src[:i] + TAIL + src[i:]
open(os.path.join(d, 'index.test.html'), 'w', encoding='utf-8', newline='\n').write(src)
print('ok', d)
