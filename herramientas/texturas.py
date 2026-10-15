"""Empaqueta los PNG de assets/texturas en js/generado/texturas.js.

Hace falta porque, cuando el juego se abre con doble clic (file://), el navegador no deja que WebGL
use imágenes sueltas; metidas dentro de un .js sí funcionan.

Uso: doble clic en actualizar-texturas.bat  (o: py -3 herramientas/texturas.py)
"""
import base64, os, struct, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'assets', 'texturas')
DESTINO = os.path.join(RAIZ, 'js', 'generado', 'texturas.js')

entradas, errores = [], []
for carpeta, _, ficheros in os.walk(ORIGEN):
    for f in ficheros:
        if not f.lower().endswith('.png'):
            continue
        ruta = os.path.join(carpeta, f)
        nombre = os.path.relpath(ruta, ORIGEN)[:-4].replace(os.sep, '/')
        datos = open(ruta, 'rb').read()
        if datos[:8] != b'\x89PNG\r\n\x1a\n' or datos[12:16] != b'IHDR':
            errores.append(f'{nombre}.png no es un PNG válido')
            continue
        w, h = struct.unpack('>II', datos[16:24])
        entradas.append((nombre, w, h, base64.b64encode(datos).decode('ascii')))
entradas.sort()

if errores:
    print('\n'.join(errores))
    sys.exit(1)

lineas = ['// GENERADO por herramientas/texturas.py: no lo edites a mano.',
          '// Edita los PNG de assets/texturas y ejecuta actualizar-texturas.bat.',
          "'use strict';", 'const TEXTURAS = {']
lineas += [f"  '{n}': [{w}, {h}, 'data:image/png;base64,{b}']," for n, w, h, b in entradas]
lineas += ['};', '']
os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
with open(DESTINO, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('\n'.join(lineas))
total = sum(len(b) for *_, b in entradas) * 3 // 4
print(f'{len(entradas)} texturas ({total // 1024} KB) -> {os.path.relpath(DESTINO, RAIZ)}')
