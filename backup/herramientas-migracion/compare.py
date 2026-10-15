import json, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
a = json.load(open('report-orig.json', encoding='utf-8'))
b = json.load(open('report-new.json', encoding='utf-8'))
print('errores original:', a['errs'])
print('errores nuevo   :', b['errs'])
same = True
for sa, sb in zip(a['steps'], b['steps']):
    diff = {k: (sa.get(k), sb.get(k)) for k in set(sa) | set(sb) if sa.get(k) != sb.get(k)}
    flag = 'IGUAL ' if not diff else 'DISTINTO'
    same &= not diff
    print(f"{flag} {sa['label']:<12} hud={sa['hud']} wave={sa['wave']!r} hp={sa['hp']} mp={sa['mp']} up={sa['up']} pause={sa['pause']} {diff if diff else ''}")
if len(a['steps']) != len(b['steps']):
    print('nº de pasos distinto', len(a['steps']), len(b['steps'])); same = False
print('extra nuevo:', {k: v for k, v in b.items() if k not in ('steps', 'errs', 'audio')})
print('RESULTADO:', 'IDÉNTICO' if same and a['errs'] == b['errs'] else 'HAY DIFERENCIAS')
