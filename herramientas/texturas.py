"""Empaqueta los PNG de assets/texturas en js/generado/texturas.js.

Hace falta porque, cuando el juego se abre con doble clic (file://), el navegador no deja que WebGL
use imágenes sueltas; metidas dentro de un .js sí funcionan.

No hace falta lanzarlo a mano antes de subir: GitHub lo ejecuta en cada push que toque los PNG
(.github/workflows/texturas.yml). Solo sirve para ver en local un PNG editado antes de subirlo:
  py -3 herramientas/texturas.py            empaqueta una vez
  py -3 herramientas/texturas.py --vigilar  se queda abierto y reempaqueta cada vez que guardas un PNG
"""
import base64, os, struct, sys, time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'assets', 'texturas')
DESTINO = os.path.join(RAIZ, 'js', 'generado', 'texturas.js')

def pngs():
    for carpeta, _, ficheros in os.walk(ORIGEN):
        yield from (os.path.join(carpeta, f) for f in ficheros if f.lower().endswith('.png'))

def generar():
    """Contenido de texturas.js y un resumen. Lanza ValueError si algún PNG no vale."""
    entradas, errores = [], []
    for ruta in pngs():
        nombre = os.path.relpath(ruta, ORIGEN)[:-4].replace(os.sep, '/')
        with open(ruta, 'rb') as fh: datos = fh.read()
        if datos[:8] != b'\x89PNG\r\n\x1a\n' or datos[12:16] != b'IHDR':
            errores.append(f'{nombre}.png no es un PNG válido')
            continue
        w, h = struct.unpack('>II', datos[16:24])
        entradas.append((nombre, w, h, base64.b64encode(datos).decode('ascii')))
    if errores: raise ValueError('\n'.join(errores))
    entradas.sort()
    lineas = ['// GENERADO por herramientas/texturas.py: no lo edites a mano.',
              '// Edita los PNG de assets/texturas; al subirlos a GitHub este fichero se regenera solo.',
              "'use strict';", 'const TEXTURAS = {']
    lineas += [f"  '{n}': [{w}, {h}, 'data:image/png;base64,{b}']," for n, w, h, b in entradas]
    lineas += ['};', '']
    total = sum(len(b) for *_, b in entradas) * 3 // 4
    return '\n'.join(lineas), f'{len(entradas)} texturas ({total // 1024} KB)'

def empaquetar():
    """Reescribe texturas.js solo si ha cambiado algo. Devuelve False si algún PNG no vale."""
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
    """Ruta, tamaño y fecha de cada PNG: cambia al guardar, añadir, borrar o renombrar cualquiera."""
    h = []
    for ruta in pngs():
        try: s = os.stat(ruta)
        except FileNotFoundError: continue
        h.append((ruta, s.st_size, s.st_mtime_ns))
    return sorted(h)

def vigilar():
    print('Vigilando assets/texturas: al guardar un PNG se reempaqueta solo; recarga el juego con F5. Ctrl+C para salir.')
    empaquetar()
    vista = huella()
    while True:
        time.sleep(0.5)
        ahora = huella()
        if ahora == vista: continue
        # Espera a que el editor termine de escribir antes de leer los PNG.
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
