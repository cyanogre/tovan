import os, sys, io, contextlib
sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import deps as Dp
A = Dp.A
toks, stmts = Dp.toks, Dp.stmts
SCHED = {'setTimeout', 'setInterval', 'requestAnimationFrame', 'Promise', 'queueMicrotask', 'then', 'onload', 'oncanplay',
         'fonts', 'decode', 'play', 'load'}
# nombres de funciones async declaradas
async_fns = set()
for s, idx in zip(A.out, stmts):
    if s['kind'] == 'function' and toks[idx[0]].val == 'async':
        async_fns.add(s['names'][0])


def raw_direct(lo, hi):
    """tokens id (tambien propiedades) fuera de closures diferidas"""
    cl = sorted((a, b) for a, b, d in Dp.closures(lo, hi) if d)
    out = []
    i, si = lo, 0
    while i < hi:
        while si < len(cl) and cl[si][1] <= i:
            si += 1
        if si < len(cl) and cl[si][0] <= i < cl[si][1]:
            i = cl[si][1]
            continue
        t = toks[i]
        if t.kind == 'id':
            out.append((t.val, i))
        elif t.kind == 'str' and t.val[1:-1] in ('load', 'canplay', 'canplaythrough', 'loadeddata', 'loadedmetadata'):
            out.append(('EVT:' + t.val, i))
        i += 1
    return out


fn_raw = {n: raw_direct(a, b) for n, (a, b, p) in Dp.fn_tok.items()}
for s, idx in zip(A.out, stmts):
    if s['kind'] == 'function':
        continue
    hits = set()
    seen = set()
    stack = [('<stmt>', raw_direct(idx[0], idx[-1] + 1))]
    while stack:
        where_, lst = stack.pop()
        for name, i in lst:
            if name in SCHED or name.startswith('EVT:'):
                hits.add(f'{name} (en {where_})')
            if name in async_fns:
                hits.add(f'async {name}() (en {where_})')
            nx = toks[i + 1] if i + 1 < len(toks) else None
            if name in Dp.fn_tok and name not in seen and nx is not None and nx.val == '(' and toks[i - 1].val not in ('.', '?.'):
                seen.add(name)
                stack.append((name, fn_raw[name]))
    if hits:
        print(f"{s['l0']:>6} {s['head'][:60]!r}: {sorted(hits)}")
