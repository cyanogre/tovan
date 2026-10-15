"""Referencias hacia delante en tiempo de carga.
Para cada sentencia ejecutable de nivel superior (no declaracion de funcion), calcula
los nombres que puede tocar (cierre transitivo a traves de funciones declaradas) y
avisa de los que se declaran (function/var) MAS ABAJO en el fichero original."""
import json, os, sys
from collections import defaultdict
d = json.load(open(os.path.join(os.path.dirname(__file__), 'stmts.json'), encoding='utf-8'))
S = d['stmts']
where = {}
kind = {}
fnrefs = {}
for s in S:
    for n in s['names']:
        where[n] = s['l0']
        kind[n] = s['kind']
        if s['kind'] == 'function':
            fnrefs[n] = s['refs']

trans = int(sys.argv[1]) if len(sys.argv) > 1 else 0


def closure(refs):
    seen = set()
    stack = [r for r in refs if r in where]
    while stack:
        r = stack.pop()
        if r in seen:
            continue
        seen.add(r)
        if trans and kind.get(r) == 'function':
            stack.extend(x for x in fnrefs[r] if x in where and x not in seen)
    return seen


res = defaultdict(list)
for s in S:
    if s['kind'] == 'function':
        continue
    names = closure(s['refs'])
    for n in names:
        if kind[n] in ('function', 'var') and where[n] > s['l1']:
            res[s['l0']].append((n, kind[n], where[n]))
tot = 0
for l0, v in sorted(res.items()):
    s = next(x for x in S if x['l0'] == l0)
    tot += len(v)
    print(f"{l0:>6} [{s['head'][:50]}] -> " + ', '.join(f'{n}@{w}' for n, k, w in sorted(v, key=lambda x: x[2])))
print('total', tot, 'sentencias', len(res))
