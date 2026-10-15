import json, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
a = json.load(open(f'report-{sys.argv[1]}.json', encoding='utf-8'))['css']
b = json.load(open(f'report-{sys.argv[2]}.json', encoding='utf-8'))['css']
print('elementos:', len(a), len(b))
print('solo en', sys.argv[1], ':', sorted(set(a) - set(b))[:20])
print('solo en', sys.argv[2], ':', sorted(set(b) - set(a))[:20])
nd = 0
for k in a:
    if k in b and a[k] != b[k]:
        pa = dict(x.split(':', 1) for x in a[k].split(';') if ':' in x)
        pb = dict(x.split(':', 1) for x in b[k].split(';') if ':' in x)
        diffs = {p: (pa.get(p), pb.get(p)) for p in set(pa) | set(pb) if pa.get(p) != pb.get(p)}
        if not diffs: continue
        nd += 1
        if nd <= 25:
            print('DIF', k, list(diffs.items())[:6])
print('elementos con estilo distinto:', nd)
