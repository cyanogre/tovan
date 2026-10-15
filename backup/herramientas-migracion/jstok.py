"""Tokenizador JS minimo (suficiente para analizar declaraciones y referencias)."""
import re

KW_BEFORE_REGEX = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void',
                   'throw', 'instanceof', 'yield', 'await'}
PUNCT = sorted('''>>>= ... === !== **= <<= >>= >>> ?.  ?? ??= ||= &&= => == != <= >= && || ++ -- += -= *= /= %= &= |= ^= ** << >>
{ } ( ) [ ] ; , < > + - * / % & | ^ ! ~ ? : = . @ #'''.split(), key=len, reverse=True)


def is_id_start(c):
    return c.isalpha() or c in '_$'


def is_id_part(c):
    return c.isalnum() or c in '_$‌‍'


class Tok:
    __slots__ = ('kind', 'val', 'pos', 'line', 'nl_before', 'depth')

    def __init__(self, kind, val, pos, line, nl_before):
        self.kind, self.val, self.pos, self.line, self.nl_before = kind, val, pos, line, nl_before

    def __repr__(self):
        return f'{self.kind}:{self.val!r}@{self.line}'


def tokenize(src, line0=1):
    toks = []
    i, n = 0, len(src)
    line = line0
    nl = False
    tmpl_stack = []  # brace depth at which a template ${ was opened
    brace = 0

    def prev_sig():
        return toks[-1] if toks else None

    def regex_allowed():
        p = prev_sig()
        if p is None:
            return True
        if p.kind in ('num', 'str', 'tmpl', 'regex'):
            return False
        if p.kind == 'id':
            return p.val in KW_BEFORE_REGEX
        if p.kind == 'punct':
            return p.val not in (')', ']', '}')
        return True

    def read_template(i, line):
        # i apunta justo despues de ` o de } que cierra ${...}
        start = i
        while i < n:
            c = src[i]
            if c == '\\':
                i += 2
                continue
            if c == '`':
                return i + 1, line, False
            if c == '$' and i + 1 < n and src[i + 1] == '{':
                return i + 2, line, True
            if c == '\n':
                line += 1
            i += 1
        raise ValueError('template sin cerrar')

    while i < n:
        c = src[i]
        if c == '\n':
            line += 1
            nl = True
            i += 1
            continue
        if c in ' \t\r﻿ ':
            i += 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            if j < 0:
                raise ValueError('comentario sin cerrar')
            line += src.count('\n', i, j)
            if '\n' in src[i:j]:
                nl = True
            i = j + 2
            continue
        start, sline = i, line
        if is_id_start(c) or c == '\\':
            j = i + 1
            while j < n and is_id_part(src[j]):
                j += 1
            toks.append(Tok('id', src[i:j], start, sline, nl)); nl = False
            i = j
            continue
        if c.isdigit() or (c == '.' and i + 1 < n and src[i + 1].isdigit()):
            m = re.compile(r'0[xX][0-9a-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?').match(src, i)
            j = m.end()
            toks.append(Tok('num', src[i:j], start, sline, nl)); nl = False
            i = j
            continue
        if c in '\'"':
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\':
                    j += 1
                elif src[j] == '\n':
                    raise ValueError(f'string con salto de linea en {line}')
                j += 1
            toks.append(Tok('str', src[i:j + 1], start, sline, nl)); nl = False
            i = j + 1
            continue
        if c == '`':
            j, line, opened = read_template(i + 1, line)
            toks.append(Tok('tmpl', src[i:j], start, sline, nl)); nl = False
            if opened:
                tmpl_stack.append(brace)
            i = j
            continue
        if c == '}' and tmpl_stack and tmpl_stack[-1] == brace:
            tmpl_stack.pop()
            j, line, opened = read_template(i + 1, line)
            toks.append(Tok('tmpl', src[i:j], start, sline, nl)); nl = False
            if opened:
                tmpl_stack.append(brace)
            i = j
            continue
        if c == '/' and regex_allowed():
            j = i + 1
            in_cls = False
            while j < n:
                d = src[j]
                if d == '\\':
                    j += 2
                    continue
                if d == '\n':
                    raise ValueError(f'regex con salto de linea en {line}')
                if in_cls:
                    if d == ']':
                        in_cls = False
                elif d == '[':
                    in_cls = True
                elif d == '/':
                    break
                j += 1
            j += 1
            while j < n and is_id_part(src[j]):
                j += 1
            toks.append(Tok('regex', src[i:j], start, sline, nl)); nl = False
            i = j
            continue
        for p in PUNCT:
            if src.startswith(p, i):
                if p == '{':
                    brace += 1
                elif p == '}':
                    brace -= 1
                toks.append(Tok('punct', p, start, sline, nl)); nl = False
                i += len(p)
                break
        else:
            raise ValueError(f'caracter inesperado {c!r} en linea {line}')
    return toks
