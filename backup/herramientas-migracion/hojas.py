"""Junta los PNG sueltos de assets/texturas en hojas (spritesheets) con su .json de recortes.

Se usó una vez (2026-10-15) para pasar de 146 PNG sueltos a 9 hojas + los 12 grandes de mundo/playa.
Necesita Pillow (py -3 -m pip install pillow). Uso: py -3 hojas.py <proyecto>
Cada hoja va por filas (una por familia: un jefe, un tipo de enemigo...), con 2 px de hueco y fondo verde (#00B45A),
que no se parece a ningún color de las texturas: solo marca los bordes. Copia los píxeles tal cual (también el RGB de los
transparentes) y comprueba cada recorte contra su PNG antes de borrarlo.
"""
import json, os, sys
from PIL import Image

HUECO, FONDO = 2, (0, 180, 90, 255)
HOJAS = {
  'canal-x': [
    ['canal-x/marcianitos/' + n for n in ('imp-1', 'imp-2', 'ojo-1', 'ojo-2', 'oni-1', 'oni-2', 'nave', 'ovni', 'aviso', 'mister-1', 'mister-2', 'mister-3')],
    ['canal-x/' + n for n in ('plato-suelo', 'suelo-anime', 'suelo-manga', 'suelo-papel', 'suelo-vector', 'estatica')],
    ['canal-x/vineta-' + n for n in ('bam', 'don', 'go', 'zas')],
    ['canal-x/vineta-vacia-' + n for n in '1234']],
  'cinematica': [
    ['cinematica/' + n for n in ('acera', 'asfalto', 'ventanas-a', 'ventanas-b', 'ventanas-c')],
    ['cinematica/' + n for n in ('caja', 'paquete', 'uniforme', 'cartel-antiguedades')]],
  'efectos': [
    ['efectos/' + n for n in ('circulo-alquimia', 'circulo-estrella', 'circulo-reloj', 'circulo-runas', 'runas-linterna')],
    ['efectos/' + n for n in ('sello-firmado', 'sombra')]],
  'enemigos': [
    ['enemigos/' + n for n in ('chochin', 'chochin-cara', 'chochin-cara-parpadeo', 'kasa', 'kasa-cara', 'kasa-cara-parpadeo')],
    ['enemigos/' + n for n in ('fan-cara', 'fan-camiseta', 'fan-cartel', 'ninja-cara', 'pinguino-barriga')],
    ['enemigos/oni/' + n for n in ('cara-azul', 'azul-abierto', 'azul-entornado', 'azul-parpadeo', 'azul-enfadado', 'azul-izquierda', 'azul-derecha')],
    ['enemigos/oni/' + n for n in ('cara-roja', 'rojo-abierto', 'rojo-entornado', 'rojo-parpadeo', 'rojo-enfadado', 'rojo-izquierda', 'rojo-derecha')],
    ['enemigos/oni/piel-tigre', 'enemigos/ventana-emergente']],
  'jefes': [
    ['jefes/error-404-' + n for n in ('cartel', 'pantallazo-azul', 'textura-perdida')],
    ['jefes/gashadokuro-' + n for n in ('craneo', 'hueso')],
    ['jefes/gato-' + n for n in ('cara', 'cara-parpadeo', 'cara-furia', 'pelaje', 'brazo', 'pecho', 'cinturon')],
    ['jefes/guardian-' + n for n in ('cara', 'cara-enfadada', 'cara-apagada', 'piedra', 'runas', 'puno')],
    ['jefes/mister-confianza-' + n for n in ('cara', 'cara-guino', 'v3-cara', 'v3-cara-guino', 'numero-uno')],
    ['jefes/mister-confianza-' + n for n in ('pecho', 'traje', 'capa', 'foto', 'pelo', 'guante', 'bota')],
    ['jefes/ryujin-escamas'],
    ['jefes/seis-ojos-' + n for n in ('cara', 'cara-parpadeo', 'cara-furia', 'kimono', 'hakama', 'piel', 'pelo', 'hoja', 'empunadura')]],
  'jugador': [
    ['jugador/tovan-' + n for n in ('cara', 'cara-parpadeo', 'cara-feliz', 'cabeza-lado')],
    ['jugador/tovan-' + n for n in ('pelo', 'pelo-dorado', 'abrigo')]],
  'mundo': [
    ['mundo/' + n for n in ('hierba', 'santuario-suelo', 'cumbre-suelo', 'azotea-tejado', 'anticuario-suelo', 'anticuario-pared')],
    ['mundo/' + n for n in ('ruinas-suelo', 'ruinas-ladrillo', 'castillo-tatami', 'castillo-shoji', 'castillo-fusuma')]],
  'objetos': [['objetos/billete', 'objetos/carta', 'armas/abanico']],
  'retratos': [['retratos/' + n for n in ('lumen', 'gato', 'mister-confianza', 'telefono')]],
}

def main(proyecto):
    origen = os.path.join(proyecto, 'assets', 'texturas')
    ruta = lambda n: os.path.join(origen, *n.split('/')) + '.png'
    for hoja, filas in HOJAS.items():
        imgs = {n: Image.open(ruta(n)) for fila in filas for n in fila}
        assert all(i.mode == 'RGBA' for i in imgs.values()), hoja
        recortes, y, ancho = {}, HUECO, 0
        for fila in filas:
            x = HUECO
            for n in fila:
                w, h = imgs[n].size
                recortes[n] = [x, y, w, h]
                x += w + HUECO
            ancho = max(ancho, x)
            y += max(imgs[n].size[1] for n in fila) + HUECO
        alto = y
        lienzo = Image.new('RGBA', (ancho, alto), FONDO)
        for n, (x, y, w, h) in recortes.items(): lienzo.paste(imgs[n], (x, y))   # sin máscara: copia RGBA tal cual
        destino = os.path.join(origen, hoja + '.png')
        lienzo.save(destino)
        guardada = Image.open(destino)
        for n, (x, y, w, h) in recortes.items():
            assert guardada.crop((x, y, x + w, y + h)).tobytes() == imgs[n].tobytes(), n
        with open(os.path.join(origen, hoja + '.json'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write('{\n' + ',\n'.join(f'  "{n}": {json.dumps(r)}' for n, r in recortes.items()) + '\n}\n')
        for n in recortes: os.remove(ruta(n))
        print(f'{hoja}.png  {ancho}x{alto}  {len(recortes)} texturas')
    for carpeta, _, _ in os.walk(origen, topdown=False):
        if carpeta != origen and not os.listdir(carpeta): os.rmdir(carpeta)

if __name__ == '__main__':
    main(sys.argv[1])
