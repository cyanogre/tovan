"""Empaqueta los modelos de assets/modelos (GLB) en js/generado/modelos.js.

Los GLB salen de kiln (la skill de .claude/skills/kiln-3d-assets): se escriben en assets/fuentes/modelos/*.kx.js,
se construyen con «node .claude/skills/kiln-3d-assets/bin/kiln.js build …» y el GLB que interesa se copia a
assets/modelos/. Igual que con las texturas, con file:// el navegador no deja cargar ficheros sueltos, así
que van dentro de un .js.

Cada nodo raíz de un GLB es un modelo (en un «pack» de kiln hay uno por modelo; en un GLB suelto, el suyo).
De cada uno se guardan los triángulos agrupados por material, con las transformaciones de los nodos ya
aplicadas: color (sRGB), color emisivo si lo tiene, posiciones (Float32) y normales (Int8), en base64.
Las texturas de loom que traiga un material no se usan (el juego pinta con su shader PS1 y colores planos)
ni las animaciones: se avisa y se siguen empaquetando el resto.

  py -3 herramientas/modelos.py            empaqueta una vez
  py -3 herramientas/modelos.py --vigilar  reempaqueta cada vez que cambia un .glb

En el juego: modeloAsset('nombre') devuelve un THREE.Group (js/motor/modelos.js).
GitHub lo ejecuta en cada push que toque assets/modelos (.github/workflows/modelos.yml).
"""
import base64, json, math, os, struct, sys, time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'assets', 'modelos')
DESTINO = os.path.join(RAIZ, 'js', 'generado', 'modelos.js')
TIPOS = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
COMPS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def leer_glb(ruta):
    with open(ruta, 'rb') as fh: d = fh.read()
    if d[:4] != b'glTF': raise ValueError('no es un GLB (falta la cabecera «glTF»)')
    _, ver, total = struct.unpack('<4sII', d[:12])
    if ver != 2: raise ValueError(f'versión de glTF {ver} (solo la 2)')
    pos, js, binario = 12, None, b''
    while pos < min(total, len(d)):
        largo, tipo = struct.unpack('<II', d[pos:pos + 8]); trozo = d[pos + 8:pos + 8 + largo]
        if tipo == 0x4E4F534A: js = json.loads(trozo.decode('utf-8'))
        elif tipo == 0x004E4942: binario = trozo
        pos += 8 + largo
    if js is None: raise ValueError('el GLB no trae JSON')
    return js, binario

def accesor(js, binario, i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]
    fmt, tam = TIPOS[a['componentType']]; n = COMPS[a['type']]
    paso = bv.get('byteStride') or tam * n; base = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    out = []
    for k in range(a['count']):
        out.append(struct.unpack_from('<' + fmt * n, binario, base + k * paso))
    if a.get('normalized') and fmt != 'f':
        m = {'b': 127, 'B': 255, 'h': 32767, 'H': 65535}[fmt]; out = [tuple(max(-1, v / m) for v in t) for t in out]
    return out

# matrices 4x4 por columnas, como glTF
def mat_mul(a, b): return [sum(a[r + 4 * k] * b[k + 4 * c] for k in range(4)) for c in range(4) for r in range(4)]
def mat_nodo(n):
    if 'matrix' in n: return list(n['matrix'])
    tx, ty, tz = n.get('translation', (0, 0, 0)); x, y, z, w = n.get('rotation', (0, 0, 0, 1)); sx, sy, sz = n.get('scale', (1, 1, 1))
    r = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)]
    return [r[0] * sx, r[1] * sx, r[2] * sx, 0, r[3] * sy, r[4] * sy, r[5] * sy, 0, r[6] * sz, r[7] * sz, r[8] * sz, 0, tx, ty, tz, 1]
def punto(m, p): x, y, z = p; return (m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14])
def vector(m, v):
    x, y, z = v; r = (m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z)
    l = math.sqrt(sum(c * c for c in r)) or 1; return tuple(c / l for c in r)

def a_srgb(c): return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
def hexa(rgb): return '#' + ''.join(f'{round(max(0, min(1, a_srgb(c))) * 255):02x}' for c in rgb[:3])

def modelos_de(ruta, avisos):
    js, binario = leer_glb(ruta); mats = js.get('materials', []); nodos = js.get('nodes', [])
    if js.get('animations'): avisos.append(f'{os.path.basename(ruta)}: las animaciones no se empaquetan')
    raices = js['scenes'][js.get('scene', 0)]['nodes']
    def material(i):
        m = mats[i] if i is not None and i < len(mats) else {}
        pbr = m.get('pbrMetallicRoughness', {}); col = hexa(pbr.get('baseColorFactor', (1, 1, 1, 1)))
        if 'baseColorTexture' in pbr: avisos.append(f'{os.path.basename(ruta)}: «{m.get("name", i)}» trae textura; se usa solo su color')
        em = m.get('emissiveFactor'); return col, (hexa(em) if em and max(em) > 0.004 else None), m.get('name', str(i))
    salida = {}
    for r in raices:
        nombre = nodos[r].get('name') or os.path.splitext(os.path.basename(ruta))[0]
        if nombre in salida: raise ValueError(f'dos modelos se llaman «{nombre}»')
        grupos = {}
        def recorre(i, padre):
            n = nodos[i]; m = mat_mul(padre, mat_nodo(n))
            if 'mesh' in n:
                for p in js['meshes'][n['mesh']]['primitives']:
                    if p.get('mode', 4) != 4: avisos.append(f'{nombre}: una primitiva no es de triángulos; se salta'); continue
                    pos = accesor(js, binario, p['attributes']['POSITION'])
                    nor = accesor(js, binario, p['attributes']['NORMAL']) if 'NORMAL' in p['attributes'] else None
                    idx = [t[0] for t in accesor(js, binario, p['indices'])] if 'indices' in p else list(range(len(pos)))
                    clave = material(p.get('material')); g = grupos.setdefault(clave, ([], []))
                    for t in range(0, len(idx) - 2, 3):
                        tri = [punto(m, pos[idx[t + k]]) for k in range(3)]
                        if nor: ns = [vector(m, nor[idx[t + k]]) for k in range(3)]
                        else:
                            a, b, c = tri; u = [b[q] - a[q] for q in range(3)]; v = [c[q] - a[q] for q in range(3)]
                            ns = [vector([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]))] * 3
                        for q in range(3): g[0].extend(tri[q]); g[1].extend(round(c * 127) for c in ns[q])
            for h in n.get('children', []): recorre(h, m)
        recorre(r, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
        if not grupos: avisos.append(f'{nombre}: no tiene mallas; se salta'); continue
        salida[nombre] = [[col, em, base64.b64encode(struct.pack(f'<{len(p)}f', *p)).decode(), base64.b64encode(struct.pack(f'<{len(n_)}b', *n_)).decode()]
                          for (col, em, _), (p, n_) in grupos.items()]
    return salida

def empaqueta():
    todos, avisos, errores = {}, [], []
    glbs = sorted(os.path.join(c, f) for c, _, fs in os.walk(ORIGEN) for f in fs if f.lower().endswith('.glb')) if os.path.isdir(ORIGEN) else []
    for ruta in glbs:
        try:
            for k, v in modelos_de(ruta, avisos).items():
                if k in todos: raise ValueError(f'«{k}» ya está en otro GLB')
                todos[k] = v
        except (ValueError, KeyError, IndexError, struct.error) as e: errores.append(f'{os.path.relpath(ruta, RAIZ)}: {e}')
    for a in avisos: print('aviso:', a)
    if errores:
        for e in errores: print('ERROR:', e)
        return False
    cuerpo = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v, separators=(",", ":"))}' for k, v in sorted(todos.items()))
    texto = ("'use strict';\n// Generado por herramientas/modelos.py a partir de assets/modelos/*.glb: no editar a mano.\n"
             "// MODELOS[nombre] = [[color, emisivo|null, posiciones Float32 base64, normales Int8 base64], …] (un grupo por material)\n"
             f"const MODELOS = {{\n{cuerpo}\n}};\n")
    viejo = open(DESTINO, encoding='utf-8').read() if os.path.exists(DESTINO) else None
    if viejo != texto:
        os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
        with open(DESTINO, 'w', encoding='utf-8', newline='\n') as fh: fh.write(texto)
        print(f'modelos.js: {len(todos)} modelos ({len(texto) // 1024} KB)')
    else: print('modelos.js ya estaba al día')
    return True

if __name__ == '__main__':
    if '--vigilar' in sys.argv:
        visto = None
        while True:
            firma = sorted((os.path.join(c, f), os.path.getmtime(os.path.join(c, f))) for c, _, fs in os.walk(ORIGEN) for f in fs) if os.path.isdir(ORIGEN) else []
            if firma != visto: visto = firma; empaqueta()
            time.sleep(1)
    sys.exit(0 if empaqueta() else 1)
