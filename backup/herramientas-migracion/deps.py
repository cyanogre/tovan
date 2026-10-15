"""Referencias que se ejecutan en tiempo de carga (no dentro de closures diferidas),
con cierre transitivo a traves de las funciones declaradas."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    import analyze as A
toks, stmts, D = A.toks, A.stmts, A.D

DEFERRED_CALLEES = {'addEventListener', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'then', 'catch', 'finally',
                    'onload', 'Promise', 'set', 'push', 'unshift'}
# push: arrays de callbacks (p.ej. TELES.push(() => ...)) se ejecutan despues
OPENERS = {'{': '}', '(': ')', '[': ']'}

# emparejar parentesis/llaves/corchetes
match = {}
st = []
for i, t in enumerate(toks):
    if t.kind == 'punct' and t.val in OPENERS:
        st.append(i)
    elif t.kind == 'punct' and t.val in ('}', ')', ']'):
        j = st.pop()
        match[j] = i
        match[i] = j


def body_end_expr(i, lo_depth):
    """fin (exclusivo) de un cuerpo de arrow sin llaves que empieza en i"""
    d0 = toks[i].depth
    j = i
    while j < len(toks):
        t = toks[j]
        if t.depth < d0:
            return j
        if t.depth == d0 and t.kind == 'punct' and t.val in (',', ';'):
            return j
        j += 1
    return j


KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'function', 'with', 'return', 'typeof', 'new', 'await', 'yield',
            'in', 'of', 'else', 'do'}


def arg_callee(i):
    """Si el token i es argumento de una llamada, nombre de la funcion llamada."""
    j = i - 1
    while j >= 0 and not (toks[j].kind == 'punct' and toks[j].val in ('(', '[', '{') and match.get(j, 0) > i):
        j -= 1
    if j < 1 or toks[j].val != '(':
        return None
    return toks[j - 1].val


def closures(lo, hi):
    """Lista de (inicio_cuerpo, fin_cuerpo, diferida) para funciones/arrows anidadas en [lo, hi)."""
    out = []
    i = lo
    while i < hi:
        t = toks[i]
        # metodo abreviado de objeto: nombre(...) { ... }  -> se ejecuta mas tarde
        if (t.kind == 'id' and t.val not in KEYWORDS and i + 1 < hi and toks[i + 1].val == '('
                and toks[i - 1].val in ('{', ',', 'get', 'set', 'async', '*')
                and match[i + 1] + 1 < len(toks) and toks[match[i + 1] + 1].val == '{'):
            b = match[i + 1] + 1
            out.append((b, match[b] + 1, True))
            i += 1
            continue
        if t.kind == 'punct' and t.val == '=>':
            # parametros
            p = i - 1
            if toks[p].val == ')':
                ps = match[p]
            else:
                ps = p
            if ps > 0 and toks[ps - 1].val == 'async':
                ps -= 1
            ctx = toks[ps - 1] if ps > 0 else None
            b = i + 1
            if toks[b].val == '{':
                be = match[b] + 1
            else:
                be = body_end_expr(b, toks[i].depth)
            out.append((b, be, deferred_ctx(ps)))
            i += 1
            continue
        if t.kind == 'id' and t.val == 'function' and i != lo:
            # expresion de funcion
            k = i + 1
            if toks[k].val == '*':
                k += 1
            if toks[k].kind == 'id':
                k += 1
            # k -> '('
            pe = match[k]
            b = pe + 1
            be = match[b] + 1
            ps = i - 1 if toks[i - 1].val == 'async' else i
            out.append((b, be, deferred_ctx(ps)))
        i += 1
    return out


def deferred_ctx(ps):
    """La closure que empieza en ps, ¿se ejecuta mas tarde?"""
    c = toks[ps - 1]
    if c.kind == 'punct' and c.val in ('(', ','):
        # argumento de llamada o elemento de array/agrupacion
        # buscar el parentesis que abre
        j = ps - 1
        while not (toks[j].kind == 'punct' and toks[j].val in ('(', '[', '{') and match.get(j, 0) > ps):
            j -= 1
        if toks[j].val != '(':
            return True  # elemento de array u objeto -> almacenada
        callee = toks[j - 1]
        if callee.kind == 'id' and callee.val in DEFERRED_CALLEES:
            return True
        if callee.kind == 'id' and callee.val in ('if', 'while', 'for', 'switch'):
            return True
        if callee.kind == 'punct' and callee.val in (')', ']') or callee.kind == 'id':
            return False  # callback de una llamada: puede ejecutarse ya (forEach, traverse...)
        # ( () => {} )()  IIFE
        end = match[j]
        if end + 1 < len(toks) and toks[end + 1].val == '(':
            return False
        return True
    return True  # = , :, return, [, etc. -> almacenada


def local_names(lo, hi):
    loc = set()
    for i in range(lo, hi):
        t = toks[i]
        if t.kind == 'id' and t.val in ('let', 'const', 'var', 'function', 'catch') and i + 1 < hi:
            j = i + 1
            if toks[j].val == '(' or toks[j].val in ('{', '['):
                # catch (e) / destructuring: tomar ids hasta cerrar
                e = match.get(j, j)
                for k in range(j + 1, e):
                    if toks[k].kind == 'id' and toks[k + 1].val != ':' and toks[k - 1].val not in ('.', '='):
                        loc.add(toks[k].val)
            elif toks[j].kind == 'id':
                loc.add(toks[j].val)
            if t.val in ('let', 'const', 'var'):
                # resto de declaradores: let a = 1, b = 2
                d = t.depth
                k = i + 1
                while k < hi and toks[k].depth >= d:
                    tk = toks[k]
                    if tk.depth == d and (tk.val == ';' or (tk.kind == 'id' and tk.val in ('const', 'let', 'var', 'function', 'return', 'if', 'for', 'while'))):
                        break
                    if tk.depth == d and tk.val == ',' and toks[k + 1].kind == 'id':
                        loc.add(toks[k + 1].val)
                    k += 1
        if t.kind == 'punct' and t.val == '=>':
            p = i - 1
            if toks[p].val == ')':
                for k in range(match[p] + 1, p):
                    if toks[k].kind == 'id' and toks[k - 1].val not in ('=', '.', ':'):
                        loc.add(toks[k].val)
            elif toks[p].kind == 'id':
                loc.add(toks[p].val)
        if t.kind == 'id' and t.val == 'function':
            k = i + 1
            while k < hi and toks[k].val != '(':
                k += 1
            if k < hi:
                for q in range(k + 1, match[k]):
                    if toks[q].kind == 'id' and toks[q - 1].val not in ('=', '.', ':'):
                        loc.add(toks[q].val)
        if t.kind == 'id' and t.val == 'for' and toks[i + 1].val == '(':
            pass
    return loc


def direct_refs(lo, hi, params_from=None):
    cl = [c for c in closures(lo, hi) if c[2]]
    loc = local_names(lo if params_from is None else params_from, hi)
    # excluir rangos de closures diferidas (y su contenido entero)
    skip = sorted((a, b) for a, b, _ in cl)
    refs = set()
    i = lo
    si = 0
    while i < hi:
        while si < len(skip) and skip[si][1] <= i:
            si += 1
        if si < len(skip) and skip[si][0] <= i < skip[si][1]:
            i = skip[si][1]
            continue
        t = toks[i]
        if t.kind == 'id' and t.val not in loc:
            p = toks[i - 1]
            nx = toks[i + 1] if i + 1 < len(toks) else None
            if not (p.kind == 'punct' and p.val in ('.', '?.')):
                # clave de objeto { k: v }
                if nx is not None and nx.val == ':' and p.val in ('{', ','):
                    pass
                else:
                    inv = (nx is not None and nx.val == '(') or (p.kind == 'punct' and p.val in ('(', ',') and arg_callee(i) not in DEFERRED_CALLEES)
                    refs.add((t.val, inv))
        i += 1
    return refs


S = A.out
where, kind, fn_tok = {}, {}, {}
for s, idx in zip(S, stmts):
    for n in s['names']:
        where[n] = s['l0']
        kind[n] = s['kind']
    if s['kind'] == 'function':
        # cuerpo: desde la primera '{' de profundidad D
        b = next(i for i in idx if toks[i].val == '{' and toks[i].depth == D)
        fn_tok[s['names'][0]] = (b + 1, match[b], idx[0])

fn_direct = {n: direct_refs(a, b, p) for n, (a, b, p) in fn_tok.items()}

load = []  # (linea sentencia, set de nombres alcanzados)
for s, idx in zip(S, stmts):
    if s['kind'] == 'function':
        continue
    refs = {r for r in direct_refs(idx[0], idx[-1] + 1) if r[0] in where}
    seen = set()
    expanded = set()
    stack = list(refs)
    while stack:
        r, inv = stack.pop()
        if r not in where:
            continue
        seen.add(r)
        if inv and kind[r] == 'function' and r not in expanded:
            expanded.add(r)
            stack.extend(x for x in fn_direct[r] if x[0] in where)
    load.append((s['l0'], s['l1'], sorted(seen)))

json.dump({'load': load, 'where': where, 'kind': kind}, open(os.path.join(os.path.dirname(__file__), 'load.json'), 'w', encoding='utf-8'), ensure_ascii=False)

if __name__ == '__main__':
    tot = 0
    for l0, l1, names in load:
        fw = [n for n in names if where[n] > l1 and kind[n] in ('function', 'var', 'let', 'const', 'class')]
        if fw:
            tot += 1
            print(f'{l0:>6}-{l1:<6} -> ' + ', '.join(f'{n}({kind[n][0]})@{where[n]}' for n in sorted(fw, key=lambda x: where[x])))
    print('sentencias con refs hacia delante en carga:', tot)
