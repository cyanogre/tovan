"""Analiza el <script> principal de index.html: sentencias de nivel superior,
declaraciones, referencias y parches (reasignaciones de funciones)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from jstok import tokenize

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index-original.html')
lines = open(SRC, encoding='utf-8').read().split('\n')

# localizar el <script> inline (el segundo)
s0 = next(i for i, l in enumerate(lines) if l.strip() == '<script>')
s1 = max(i for i, l in enumerate(lines) if l.strip() == '</script>')
body = '\n'.join(lines[s0 + 1:s1])
LINE0 = s0 + 2  # numero de linea (1-based) de la primera linea del cuerpo
toks = tokenize(body, LINE0)

OPEN, CLOSE = {'{': 1, '(': 1, '[': 1}, {'}': 1, ')': 1, ']': 1}
depth = 0
for t in toks:
    if t.kind == 'punct' and t.val in CLOSE:
        depth -= 1
    t.depth = depth
    if t.kind == 'punct' and t.val in OPEN:
        depth += 1
    if t.kind == 'tmpl':
        # '${' abre, '}' cierra: los trozos de plantilla no cambian depth (el tokenizador ya lo gestiona)
        pass

# profundidad del cuerpo del IIFE: la de la sentencia 'use strict'
D = next(t.depth for t in toks if t.kind == 'str' and 'use strict' in t.val)
print('depth top-level =', D, file=sys.stderr)

CONT = {'.', '?.', ',', ')', ']', '}', '=', '+', '-', '*', '/', '%', '&&', '||', '??', '?', ':', '=>', '==', '===', '!=', '!==',
        '<', '>', '<=', '>=', '|', '&', '^', '+=', '-=', '*=', '/=', '||=', '&&=', '??=', 'instanceof', 'in', 'of'}
BLOCK_CONT = {'else', 'catch', 'finally', 'while'}

stmts = []
cur = []
toplevel = [t for t in toks if t.depth >= D]
# quitar el cierre del IIFE
k = 0
i = 0
N = len(toks)
start_idx = next(j for j, t in enumerate(toks) if t.kind == 'str' and 'use strict' in t.val)
end_idx = max(j for j, t in enumerate(toks) if t.depth == D - 1 and t.kind == 'punct' and t.val == '}')  # cierre del cuerpo
j = start_idx
while j < end_idx:
    t = toks[j]
    cur.append(j)
    end = False
    if t.depth == D:
        if t.kind == 'punct' and t.val == ';':
            end = True
        nxt = toks[j + 1] if j + 1 < end_idx else None
        if nxt is None:
            end = True
        elif not end and nxt.nl_before and nxt.depth == D:
            # posible ASI
            if t.kind == 'punct' and t.val == '}':
                if not (nxt.kind == 'punct' and nxt.val in CONT) and not (nxt.kind == 'id' and nxt.val in BLOCK_CONT | {'instanceof', 'in', 'of'}) and nxt.kind != 'tmpl':
                    end = True
            elif (t.kind in ('id', 'num', 'str', 'tmpl', 'regex') or (t.kind == 'punct' and t.val in (')', ']', '++', '--'))):
                if nxt.kind == 'id' and nxt.val in ('const', 'let', 'var', 'function', 'class', 'if', 'for', 'while', 'return', 'try', 'do', 'switch', 'async'):
                    end = True
                elif t.kind == 'punct' and t.val == ')' and nxt.kind == 'id' and nxt.val not in ('instanceof', 'in', 'of'):
                    end = True
                elif t.kind in ('id', 'num', 'str') and nxt.kind == 'id' and nxt.val not in ('instanceof', 'in', 'of') and t.val not in ('return', 'else', 'typeof', 'new', 'const', 'let', 'var', 'async', 'await', 'function', 'class', 'extends', 'do', 'in', 'of', 'case', 'throw', 'void', 'delete'):
                    end = True
    else:
        # cuerpo de un if sin llaves, etc.: se termina en el ';' de nivel D+? -> no, lo tratamos al llegar a ';' de profundidad D
        pass
    if end:
        stmts.append(cur)
        cur = []
    j += 1
if cur:
    stmts.append(cur)


def decl_names(idx_list):
    """Devuelve (tipo, [nombres]) si la sentencia es una declaracion."""
    ts = [toks[i] for i in idx_list]
    if not ts:
        return None, []
    a = ts[0]
    if a.kind == 'id' and a.val == 'async' and len(ts) > 1 and ts[1].val == 'function':
        ts = ts[1:]; a = ts[0]
    if a.kind == 'id' and a.val == 'function':
        k = 1
        if ts[k].val == '*':
            k += 1
        return 'function', [ts[k].val]
    if a.kind == 'id' and a.val == 'class':
        return 'class', [ts[1].val]
    if a.kind == 'id' and a.val in ('const', 'let', 'var'):
        names = []
        k = 1
        while k < len(ts):
            t = ts[k]
            if t.kind == 'id':
                names.append(t.val)
                k += 1
            elif t.val in ('{', '['):
                # patron de desestructuracion
                d0 = t.depth
                k += 1
                while k < len(ts) and not (ts[k].depth == d0 and ts[k].val in ('}', ']')):
                    tt = ts[k]
                    if tt.kind == 'id' and tt.depth == d0 + 1:
                        nx = ts[k + 1]
                        pv = ts[k - 1]
                        if nx.val != ':' and pv.val != '=':
                            names.append(tt.val)
                    k += 1
                k += 1
            else:
                k += 1
                continue
            # saltar inicializador
            while k < len(ts) and not (ts[k].depth == D and ts[k].val in (',', ';')):
                k += 1
            if k < len(ts) and ts[k].val == ',':
                k += 1
                continue
            break
        return a.val, names
    return None, []


out = []
for s in stmts:
    ts = [toks[i] for i in s]
    kind, names = decl_names(s)
    refs = []
    for q, i in enumerate(s):
        t = toks[i]
        if t.kind != 'id':
            continue
        p = toks[i - 1]
        if p.kind == 'punct' and p.val in ('.', '?.'):
            continue
        refs.append(t.val)
    # parche: NOMBRE = function/arrow  (asignacion de nivel superior)
    patch = None
    if len(ts) > 2 and ts[0].kind == 'id' and ts[1].val == '=' and kind is None:
        patch = ts[0].val
    first_line = ts[0].line
    last_line = ts[-1].line
    out.append({'l0': first_line, 'l1': last_line, 'kind': kind, 'names': names, 'patch': patch,
                'refs': sorted(set(refs)), 'head': ' '.join(t.val for t in ts[:6])[:90]})

json.dump({'stmts': out, 'script_start': s0 + 1, 'script_end': s1 + 1}, open(os.path.join(os.path.dirname(__file__), 'stmts.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('sentencias:', len(out))
from collections import Counter
print(Counter(o['kind'] for o in out))
