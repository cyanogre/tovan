import json, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open((sys.argv[1] if len(sys.argv) > 1 else 'orig_tex') + '.json', encoding='utf-8'))
for r in d['recs']:
    st = [s for s in r['st'] if 'motor/renderer.js' not in s][:2]
    print(r['i'], r['kind'], f"{r.get('w')}x{r.get('h')}", 'rnd=%d' % r['rnd'], r.get('hash'), ' | '.join(st))
