import json, os
from collections import defaultdict
d = json.load(open(os.path.join(os.path.dirname(__file__), 'stmts.json'), encoding='utf-8'))
S = d['stmts']
decl = defaultdict(list)
for s in S:
    for n in s['names']:
        decl[n].append((s['kind'], s['l0']))
dups = {n: v for n, v in decl.items() if len(v) > 1}
print('DUPLICADOS:', dups)
print('VAR:', [(n, v) for n, v in decl.items() if any(k == 'var' for k, _ in v)])
lower_on = [n for n in decl if n.startswith('on') and n == n.lower()]
print('on* minúsculas:', lower_on)
# sentencias largas no-funcion (posible error de segmentacion)
big = [(s['l0'], s['l1'], s['kind'], s['head']) for s in S if s['l1'] - s['l0'] > 60]
print('SENTENCIAS LARGAS:')
for b in big:
    print('  ', b)
# sentencias de nivel superior que no son declaraciones
print('nombres declarados:', len(decl))
json.dump(sorted(decl), open(os.path.join(os.path.dirname(__file__), 'names.json'), 'w'))
