import sys, os, re
d = sys.argv[1]
src = open(os.path.join(d, 'index.test.html'), encoding='utf-8').read()
a = src.index('  var seq = [')
b = src.index('  seq.forEach')
LONG = r'''  var seq = [[600, function(){ snap('inicio'); }], [700, function(){ click('startBtn'); }], [3000, function(){ tap('Escape'); }],
    [3300, function(){ if (vis('dlg')) tap('Escape'); }],
    [3600, function(){ play = setInterval(function(){
        n++;
        if (vis('overScr')) { R.deaths = (R.deaths || 0) + 1; click('retryBtn'); return; }
        if (vis('pauseScr')) { click('resumeBtn'); return; }
        if (vis('upScr')) { R.picks = (R.picks || 0) + 1; tap(['Digit1', 'Digit2', 'Digit3'][n % 3]); return; }
        if (vis('dlg')) { tap('Enter'); return; }
        var ks = ['KeyJ', 'KeyJ', 'KeyK', 'Space', 'KeyL', 'KeyJ', 'KeyJ', 'KeyJ'];
        if (n % 40 === 0) { key('KeyJ'); setTimeout(function(){ key('KeyJ', 'keyup'); }, 900); } else tap(ks[n % ks.length]);
        var mv = ['KeyW', 'KeyD', 'KeyS', 'KeyA'][Math.floor(n / 12) % 4];
        ['KeyW', 'KeyD', 'KeyS', 'KeyA'].forEach(function(k){ key(k, k === mv ? 'keydown' : 'keyup'); });
      }, 120); }]];
  for (var t = 10000; t <= 90000; t += 10000) (function(t){ seq.push([t, function(){ snap('t' + t / 1000); }]); })(t);
'''
src = src[:a] + LONG + src[b:]
open(os.path.join(d, 'index.long.html'), 'w', encoding='utf-8', newline='\n').write(src)
