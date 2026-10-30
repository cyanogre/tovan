"""Hace js/generado/voces.js con las frases dobladas de Lumen (assets/audio/lumen/<id>.mp3) y lo que dura cada una.

<id> es el FNV-1a de 32 bits del texto tal como sale en pantalla (sobre las unidades UTF-16, como charCodeAt),
y js/audio/voz-lumen.js lo calcula igual al enseñar un diálogo o un comentario. Lo que no tiene mp3 sigue con
el «bla bla» de siempre.

assets/fuentes/voces/lumen.json guarda de cada frase el texto y el prompt con el que se generó (etiquetas de
emoción de eleven_v4 como [sarcastic] o [laughs], y las teclas y números escritos como se dicen), para poder
regenerarla. Si se cambia un texto en el código, cambia su id: hay que volver a generar esa frase.

  py -3 herramientas/voces.py            reescribe js/generado/voces.js
  py -3 herramientas/voces.py "texto"    dice el id de un texto

Sin dependencias: la duración sale de contar las tramas del mp3.
GitHub lo ejecuta en cada push que toque assets/audio/lumen (.github/workflows/voces.yml).
"""
import json, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'assets', 'audio', 'lumen')
TEXTOS = os.path.join(RAIZ, 'assets', 'fuentes', 'voces', 'lumen.json')
DESTINO = os.path.join(RAIZ, 'js', 'generado', 'voces.js')
KBPS = {1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]}
HZ = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}

def fnv(t):
    h = 0x811c9dc5
    for c in t:
        o = ord(c)
        for u in ([o] if o < 0x10000 else [0xd800 + ((o - 0x10000) >> 10), 0xdc00 + ((o - 0x10000) & 0x3ff)]):
            h = ((h ^ u) * 0x01000193) & 0xffffffff
    return '%08x' % h

def duracion(ruta):
    with open(ruta, 'rb') as fh: d = fh.read()
    i = 0
    if d[:3] == b'ID3': i = 10 + ((d[6] & 0x7f) << 21 | (d[7] & 0x7f) << 14 | (d[8] & 0x7f) << 7 | (d[9] & 0x7f))
    s = 0.0
    while i + 4 <= len(d):
        if d[i] != 0xff or (d[i + 1] & 0xe0) != 0xe0: i += 1; continue
        ver, capa, br, sr, pad = (d[i + 1] >> 3) & 3, (d[i + 1] >> 1) & 3, d[i + 2] >> 4, (d[i + 2] >> 2) & 3, (d[i + 2] >> 1) & 1
        if ver == 1 or capa != 1 or br in (0, 15) or sr == 3: i += 1; continue   # solo MPEG capa III
        hz = HZ[ver][sr]; kb = KBPS[1 if ver == 3 else 2][br]
        largo = (144 if ver == 3 else 72) * kb * 1000 // hz + pad
        s += (1152 if ver == 3 else 576) / hz; i += largo
    return s

def main():
    if len(sys.argv) > 1: print(fnv(sys.argv[1])); return
    ids = sorted(f[:-4] for f in os.listdir(ORIGEN) if f.endswith('.mp3')) if os.path.isdir(ORIGEN) else []
    voces = {i: round(duracion(os.path.join(ORIGEN, i + '.mp3')), 2) for i in ids}
    if os.path.exists(TEXTOS):
        with open(TEXTOS, encoding='utf-8') as fh: textos = json.load(fh)
        conocidos = {fnv(x['texto']) for x in textos}
        sobran = [i for i in ids if i not in conocidos]; faltan = [x['texto'] for x in textos if fnv(x['texto']) not in voces]
        if sobran: print('mp3 sin texto en lumen.json:', ', '.join(sobran))
        if faltan: print(f'{len(faltan)} frases sin mp3 (las prepara «py -3 herramientas/partir-voces.py lotes <carpeta>»)')
    js = ("'use strict';\n// Generado por herramientas/voces.py a partir de assets/audio/lumen: no editar a mano.\n"
          "// id (FNV-1a del texto) → segundos\nconst VOCES = {\n" + ''.join(f"  '{i}': {v},\n" for i, v in voces.items()) + '};\n')
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    viejo = open(DESTINO, encoding='utf-8').read() if os.path.exists(DESTINO) else None
    if viejo != js:
        with open(DESTINO, 'w', encoding='utf-8', newline='\n') as fh: fh.write(js)
    print(f'{len(voces)} voces, {sum(voces.values()):.0f} s' + ('' if viejo != js else ' (sin cambios)'))

if __name__ == '__main__': main()
