"""Equivalencia a nivel de tokens entre el <script> original y los ficheros js/ nuevos."""
import os, sys, re, json, io, contextlib
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from jstok import tokenize
with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
    import analyze as A
OUT = sys.argv[1]

# sentencias originales como cadenas de tokens
orig = []
for s, idx in zip(A.out, A.stmts):
    txt = ' '.join(A.toks[i].val for i in idx)
    orig.append((s['l0'], s['kind'], txt))
orig = [o for o in orig if o[2] != "'use strict' ;"]

# sentencias nuevas: tokenizar cada fichero en orden y segmentar igual (nivel 0)
html = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
files = re.findall(r'<script src="(js/[^"]+)"></script>', html)
new = []
for f in files:
    src = open(os.path.join(OUT, f), encoding='utf-8').read()
    toks = tokenize(src)
    depth = 0
    cur = []
    for k, t in enumerate(toks):
        if t.kind == 'punct' and t.val in ('}', ')', ']'):
            depth -= 1
        t.depth = depth
        if t.kind == 'punct' and t.val in ('{', '(', '['):
            depth += 1
    # misma segmentacion que analyze.py pero a profundidad 0
    stm, cur = [], []
    CONT = A.CONT; BLOCK_CONT = A.BLOCK_CONT
    for j, t in enumerate(toks):
        cur.append(t)
        end = False
        if t.depth == 0:
            if t.kind == 'punct' and t.val == ';':
                end = True
            nxt = toks[j + 1] if j + 1 < len(toks) else None
            if nxt is None:
                end = True
            elif not end and nxt.nl_before and nxt.depth == 0:
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
        if end:
            stm.append(' '.join(x.val for x in cur)); cur = []
    if cur:
        stm.append(' '.join(x.val for x in cur))
    assert stm[0] == "'use strict' ;", (f, stm[0][:60])
    for s in stm[1:]:
        new.append((f, s))

co = Counter(t for _, _, t in orig)
cn = Counter(t for _, t in new)
only_o = co - cn
only_n = cn - co
print('sentencias originales:', sum(co.values()), ' nuevas:', sum(cn.values()))
print('\n--- SOLO EN EL ORIGINAL ---')
for t, c in only_o.items():
    print(c, 'x', t[:160])
print('\n--- SOLO EN LO NUEVO ---')
for t, c in only_n.items():
    print(c, 'x', t[:160])

# orden: sentencias que no son declaraciones de funcion
seq_o = [t for _, k, t in orig if k != 'function' and t in cn]
seq_n = [t for _, t in new if not (t.startswith('function ') or t.startswith('async function ')) and t in co]
import difflib
sm = difflib.SequenceMatcher(a=seq_o, b=seq_n, autojunk=False)
print('\n--- CAMBIOS DE ORDEN (sentencias ejecutables) ---')
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == 'equal':
        continue
    print(op)
    for t in seq_o[a1:a2]:
        print('   orig:', t[:140])
    for t in seq_n[b1:b2]:
        print('   nuevo:', t[:140])
