"""Hoja de contacto de las texturas registradas (captura con Chrome headless)."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
name = sys.argv[1] if len(sys.argv) > 1 else 'orig_tex'
lo, hi = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (0, 9999)
d = json.load(open(os.path.join(HERE, name + '.json'), encoding='utf-8'))
cells = []
for r in d['recs']:
    if not (lo <= r['i'] <= hi) or not r.get('data'):
        continue
    st = [s for s in r['st'] if 'motor/renderer.js' not in s][:1]
    lab = (st[0] if st else '').split(' [')[0].replace('enemigos/regiones/', 'reg/').replace('jefes/rediseno-pixelart', 'jefes/redis')
    w, h = r.get('w') or 96, r.get('h') or 96
    k = max(1, min(8, 128 // max(w, h))) if max(w, h) <= 128 else 128 / max(w, h)
    cells.append(f'<div class="c"><img src="{r["data"]}" style="width:{w*k:.0f}px;height:{h*k:.0f}px"><b>{r["i"]}</b><span>{w}x{h} {lab}</span></div>')
page = '''<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#556;font:11px monospace;color:#fff;display:flex;flex-wrap:wrap;gap:4px;padding:4px;width:1580px}
.c{width:150px;height:170px;background:repeating-conic-gradient(#888 0 25%,#aaa 0 50%) 0 0/16px 16px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative}
img{image-rendering:pixelated;margin:auto} b{position:absolute;top:2px;left:4px;background:#000;padding:0 3px} span{background:#000;width:100%;text-align:center;overflow:hidden;white-space:nowrap}</style>''' + ''.join(cells)
p = os.path.join(HERE, f'sheet_{lo}.html')
open(p, 'w', encoding='utf-8').write(page)
rows = (len(cells) + 9) // 10
out = os.path.join(HERE, f'sheet_{lo}.png')
subprocess.run([r'C:\Program Files\Google\Chrome\Application\chrome.exe', '--headless=new', '--disable-gpu', f'--user-data-dir={os.path.join(HERE, "prof-sheet")}',
                f'--window-size=1590,{rows * 174 + 10}', f'--screenshot={out}', 'file:///' + p.replace('\\', '/')], capture_output=True, timeout=120)
print(out)
