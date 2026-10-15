import json, os, base64, struct, zlib
os.chdir(os.path.dirname(os.path.abspath(__file__)))
a = json.load(open('antes.json', encoding='utf-8'))
b = json.load(open('despues.json', encoding='utf-8'))
print('rnd al cargar:', a['rndLoad'], b['rndLoad'], ' errores:', a['errs'], b['errs'])
print('registros:', len(a['recs']), len(b['recs']))
KEYS = ['kind', 'w', 'h', 'wrap', 'filt', 'mip', 'enc', 'aniso', 'rep']
dif_px, dif_props = [], []
for ra, rb in zip(a['recs'], b['recs']):
    props = {k: (ra.get(k), rb.get(k)) for k in KEYS if ra.get(k) != rb.get(k)}
    if props:
        dif_props.append((ra['i'], props, ra['st'][:1]))
    if ra.get('hash') != rb.get('hash') or (ra.get('kind') == 'css' and ra.get('data') != rb.get('data')):
        dif_px.append((ra['i'], ra.get('kind'), ra.get('w'), ra.get('h'), ra['st'][:1]))
print('\nPROPIEDADES DISTINTAS:', len(dif_props))
for x in dif_props: print('  ', x)
print('\nPÍXELES DISTINTOS:', len(dif_px))
for x in dif_px: print('  ', x)
