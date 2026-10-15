"""Empaqueta las texturas de assets/texturas en js/generado/texturas.js.

Hace falta porque, cuando el juego se abre con doble clic (file://), el navegador no deja que WebGL
use imágenes sueltas; metidas dentro de un .js sí funcionan.

Hay dos clases de PNG en assets/texturas:
- Hojas: un PNG con un .json al lado del mismo nombre (jefes.png + jefes.json). El .json dice qué texturas
  hay dentro y dónde: { "jefes/gato-cara": [x, y, ancho, alto], ... }. Lo que queda fuera de los recortes
  (el fondo verde) no lo usa el juego.
- Sueltos: un PNG sin .json es una textura entera, y su nombre es su ruta sin «.png» (mundo/playa/arena).

No hace falta lanzarlo a mano antes de subir: GitHub lo ejecuta en cada push que toque las texturas
(.github/workflows/texturas.yml). Solo sirve para ver en local un PNG editado antes de subirlo:
  py -3 herramientas/texturas.py            empaqueta una vez
  py -3 herramientas/texturas.py --vigilar  se queda abierto y reempaqueta cada vez que guardas un PNG o un .json
"""
import base64, json, os, struct, sys, time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'assets', 'texturas')
DESTINO = os.path.join(RAIZ, 'js', 'generado', 'texturas.js')

def ficheros(*ext):
    for carpeta, _, fs in os.walk(ORIGEN):
        yield from (os.path.join(carpeta, f) for f in fs if f.lower().endswith(ext))

def relativa(ruta): return os.path.relpath(ruta, ORIGEN).replace(os.sep, '/')

def leer_png(ruta):
    with open(ruta, 'rb') as fh: datos = fh.read()
    if datos[:8] != b'\x89PNG\r\n\x1a\n' or datos[12:16] != b'IHDR': raise ValueError(f'{relativa(ruta)} no es un PNG válido')
    return datos, struct.unpack('>II', datos[16:24])

def sin_repetidos(pares):
    d = {}
    for k, v in pares:
        if k in d: raise ValueError(f'«{k}» aparece dos veces')
        d[k] = v
    return d

def recortes(ruta, ancho, alto):
    """Lee el .json de una hoja y comprueba que cada recorte cabe en ella y no pisa a otro."""
    nombre = relativa(ruta)
    try:
        with open(ruta, encoding='utf-8') as fh: r = json.load(fh, object_pairs_hook=sin_repetidos)
    except json.JSONDecodeError as e: raise ValueError(f'{nombre}: no es un JSON válido (línea {e.lineno}: {e.msg})')
    except ValueError as e: raise ValueError(f'{nombre}: {e}')
    if not isinstance(r, dict): raise ValueError(f'{nombre}: tiene que ser {{ "nombre": [x, y, ancho, alto], ... }}')
    errores, vistos = [], []
    for n, v in r.items():
        if not (isinstance(v, list) and len(v) == 4 and all(type(k) is int and k >= 0 for k in v) and v[2] and v[3]):
            errores.append(f'{nombre}: «{n}» tiene que ser [x, y, ancho, alto] con números enteros'); continue
        x, y, w, h = v
        if x + w > ancho or y + h > alto: errores.append(f'{nombre}: «{n}» se sale de la hoja ({ancho}x{alto})')
        errores += [f'{nombre}: «{n}» pisa a «{m}»' for m, (a, b, c, d) in vistos if x < a + c and a < x + w and y < b + d and b < y + h]
        vistos.append((n, v))
    if errores: raise ValueError('\n'.join(errores))
    return r

def generar():
    """Contenido de texturas.js y un resumen. Lanza ValueError con todo lo que no vale."""
    texturas, imagenes, errores, origen = {}, {}, [], {}
    jsons = {os.path.splitext(j)[0] for j in ficheros('.json')}
    for base in sorted(jsons - {os.path.splitext(p)[0] for p in ficheros('.png')}):
        errores.append(f'{relativa(base)}.json no tiene al lado su hoja {os.path.basename(base)}.png')
    for ruta in ficheros('.png'):
        base, clave = os.path.splitext(ruta)[0], relativa(ruta)[:-4]
        try:
            datos, (ancho, alto) = leer_png(ruta)
            if base in jsons: dentro = {n: (w, h, clave, x, y) for n, (x, y, w, h) in recortes(base + '.json', ancho, alto).items()}
            else: dentro = {clave: (ancho, alto, clave, 0, 0)}
        except ValueError as e:
            errores.append(str(e)); continue
        imagenes[clave] = base64.b64encode(datos).decode('ascii')
        for n, t in dentro.items():
            if n in texturas: errores.append(f'La textura «{n}» está a la vez en {origen[n]} y en {relativa(ruta)}')
            texturas[n], origen[n] = t, relativa(ruta)
    if errores: raise ValueError('\n'.join(errores))
    lineas = ['// GENERADO por herramientas/texturas.py: no lo edites a mano.',
              '// Edita los PNG de assets/texturas; al subirlos a GitHub este fichero se regenera solo.',
              "'use strict';",
              '// Cada textura: [ancho, alto, imagen, x, y]. La imagen es una hoja (PNG con su .json) o un PNG suelto.',
              'const TEXTURAS = {']
    lineas += [f"  '{n}': [{w}, {h}, '{c}', {x}, {y}]," for n, (w, h, c, x, y) in sorted(texturas.items())]
    lineas += ['};', 'const TEXTURAS_PNG = {']
    lineas += [f"  '{c}': 'data:image/png;base64,{b}'," for c, b in sorted(imagenes.items())]
    lineas += ['};', '']
    total = sum(len(b) for b in imagenes.values()) * 3 // 4
    return '\n'.join(lineas), f'{len(texturas)} texturas en {len(imagenes)} PNG ({total // 1024} KB)'

def empaquetar():
    """Reescribe texturas.js solo si ha cambiado algo. Devuelve False si algo no vale."""
    try: contenido, resumen = generar()
    except ValueError as e:
        print(e)
        return False
    destino = os.path.relpath(DESTINO, RAIZ)
    try:
        with open(DESTINO, encoding='utf-8') as fh: anterior = fh.read().replace('\r\n', '\n')
    except FileNotFoundError: anterior = None
    if anterior == contenido:
        print(f'{resumen}: {destino} ya estaba al día')
        return True
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    with open(DESTINO, 'w', encoding='utf-8', newline='\n') as fh: fh.write(contenido)
    print(f'{resumen} -> {destino}')
    return True

def huella():
    """Ruta, tamaño y fecha de cada PNG y .json: cambia al guardar, añadir, borrar o renombrar cualquiera."""
    h = []
    for ruta in ficheros('.png', '.json'):
        try: s = os.stat(ruta)
        except FileNotFoundError: continue
        h.append((ruta, s.st_size, s.st_mtime_ns))
    return sorted(h)

def vigilar():
    print('Vigilando assets/texturas: al guardar un PNG o un .json se reempaqueta solo; recarga el juego con F5. Ctrl+C para salir.')
    empaquetar()
    vista = huella()
    while True:
        time.sleep(0.5)
        ahora = huella()
        if ahora == vista: continue
        # Espera a que el editor termine de escribir antes de leer los ficheros.
        while True:
            time.sleep(0.3)
            otra = huella()
            if otra == ahora: break
            ahora = otra
        print(time.strftime('%H:%M:%S'), end=' ')
        empaquetar()
        vista = ahora

if __name__ == '__main__':
    if '--vigilar' in sys.argv[1:]:
        try: vigilar()
        except KeyboardInterrupt: pass
    elif not empaquetar(): sys.exit(1)
