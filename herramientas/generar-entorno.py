"""Genera las texturas de entorno de los mapas grandes: assets/texturas/entorno.png + entorno.json.

Son texturas de 64-128 px pintadas por procedimiento (ruido y Voronoi periódicos, para que se repitan
sin costuras), con relieve por luz rasante y reducidas a una paleta corta con trama ordenada, como las
texturas indexadas de los últimos juegos de PS1. Una vez generadas, la hoja se edita a mano como
cualquier otra: este script solo sirve para volver a crearlas desde cero (y las sobrescribe).

Necesita numpy y Pillow:  py -3 -m pip install numpy pillow
Uso:  py -3 herramientas/generar-entorno.py   (después, py -3 herramientas/texturas.py)
"""
import json, math, os
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOJA = os.path.join(RAIZ, 'assets', 'texturas', 'entorno')
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 - 0.5

# ---------- herramientas ----------
def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
def rampa(v, stops):
    """Color a partir de un valor 0-1 recorriendo una lista de colores."""
    cs = np.array([hexrgb(s) for s in stops]); v = np.clip(v, 0, 1) * (len(cs) - 1)
    i = np.clip(np.floor(v).astype(int), 0, len(cs) - 2); f = (v - i)[..., None]
    return cs[i] * (1 - f) + cs[i + 1] * f
def ruido(w, h, cx, cy, rng):
    """Ruido de valor periódico (se repite en w x h)."""
    g = rng.random((cy, cx)); x = np.arange(w) / w * cx; y = np.arange(h) / h * cy
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = x - x0; fy = y - y0
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); x1 = (x0 + 1) % cx; y1 = (y0 + 1) % cy
    a = g[np.ix_(y0, x0)]; b = g[np.ix_(y0, x1)]; c = g[np.ix_(y1, x0)]; d = g[np.ix_(y1, x1)]
    top = a * (1 - fx) + b * fx; bot = c * (1 - fx) + d * fx
    return top * (1 - fy[:, None]) + bot * fy[:, None]
def fbm(w, h, rng, base=4, octavas=4, gan=0.5, basey=None):
    s, amp, tot, cx, cy = 0, 1, 0, base, basey or base * h // w
    for _ in range(octavas): s = s + ruido(w, h, max(1, cx), max(1, cy), rng) * amp; tot += amp; amp *= gan; cx *= 2; cy *= 2
    return s / tot
def voronoi(w, h, pts, ey=1.0):
    """Distancia al punto más cercano y al segundo, y de qué punto es cada píxel (en un toro; ey estira en vertical)."""
    yy, xx = np.mgrid[0:h, 0:w].astype(float); d1 = np.full((h, w), 1e9); d2 = d1.copy(); idx = np.zeros((h, w), int)
    for i, (px, py) in enumerate(pts):
        dx = np.abs(xx - px); dx = np.minimum(dx, w - dx); dy = np.abs(yy - py); dy = np.minimum(dy, h - dy); d = np.hypot(dx, dy / ey)
        m = d < d1; d2 = np.where(m, d1, np.minimum(d2, d)); idx = np.where(m, i, idx); d1 = np.where(m, d, d1)
    return d1, d2, idx
def relajados(w, h, n, rng, pasos=2):
    """Puntos repartidos con Lloyd (losas de tamaños parecidos)."""
    pts = rng.random((n, 2)) * [w, h]; yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(pasos):
        _, _, idx = voronoi(w, h, pts)
        for i in range(n):
            m = idx == i
            if m.any():
                pts[i] = [np.angle(np.exp(2j * np.pi * xx[m] / w).mean()) / (2 * np.pi) * w % w, np.angle(np.exp(2j * np.pi * yy[m] / h).mean()) / (2 * np.pi) * h % h]
    return pts
def sombrea(alt, fuerza=2.0, luz=(-0.6, -0.75)):
    """Luz rasante a partir de un mapa de alturas (de arriba a la izquierda, como en los juegos de la época)."""
    gx = (np.roll(alt, -1, 1) - np.roll(alt, 1, 1)) / 2; gy = (np.roll(alt, -1, 0) - np.roll(alt, 1, 0)) / 2
    return np.clip(1 + (gx * luz[0] + gy * luz[1]) * fuerza, 0.5, 1.5)[..., None]
def trazo(col, x, y, ang, largo, c, alfa=None, ancho=1, mul=None):
    """Línea corta que da la vuelta por los bordes (hierba, agujas, grietas…)."""
    h, w = col.shape[:2]
    for k in range(max(1, int(largo * 2))):
        t = k / 2; px = int(round(x + math.cos(ang) * t)); py = int(round(y + math.sin(ang) * t))
        for a in range(ancho):
            yy, xx = py % h, (px + a) % w
            if mul is not None: col[yy, xx] *= mul
            else: col[yy, xx] = c
            if alfa is not None: alfa[yy, xx] = 255
def mancha(col, x, y, r, c, alfa=None, ry=None):
    h, w = col.shape[:2]; ry = ry or r
    for dy in range(-int(ry) - 1, int(ry) + 2):
        for dx in range(-int(r) - 1, int(r) + 2):
            if (dx / r) ** 2 + (dy / ry) ** 2 <= 1:
                col[(y + dy) % h, (x + dx) % w] = c
                if alfa is not None: alfa[(y + dy) % h, (x + dx) % w] = 255
def grietas(col, rng, n, largo, fuerza=0.6, mascara=None):
    h, w = col.shape[:2]
    for _ in range(n):
        x, y, a = rng.random() * w, rng.random() * h, rng.random() * 6.28
        for _ in range(int(largo)):
            a += rng.normal(0, 0.45); x += math.cos(a); y += math.sin(a); xi, yi = int(x) % w, int(y) % h
            if mascara is None or mascara[yi, xi]: col[yi, xi] *= fuerza
def cuantiza(rgb, colores=32, alfa=None):
    """Paleta corta (como una CLUT de PS1) con trama ordenada, que no rompe la repetición."""
    h, w = rgb.shape[:2]; t = np.tile(BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w][..., None]
    img = Image.fromarray(np.clip(rgb + t * 9, 0, 255).astype(np.uint8), 'RGB')
    q = img.quantize(colors=colores, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
    if alfa is not None: q.putalpha(Image.fromarray(np.where(alfa > 127, 255, 0).astype(np.uint8), 'L'))
    return q

# ---------- texturas ----------
def losas(rng, piedra, junta, musgo, n=128, k=20, var=0.12, petalos=0):
    pts = relajados(n, n, k, rng); d1, d2, idx = voronoi(n, n, pts); e = (d2 - d1) / 2
    det = fbm(n, n, rng, 8, 4); tono = rng.uniform(-var, var, k)[idx]
    alt = np.clip(e / 3.2, 0, 1) ** 0.6 + (det - 0.5) * 0.25
    col = rampa(0.58 + tono + (det - 0.5) * 0.4, piedra) * sombrea(alt * 2.6, 1.7)
    grietas(col, rng, 7, 22, 0.66, e > 2)
    jm = e < 1.4; mus = fbm(n, n, rng, 4, 3)
    col[jm] = rampa(det, junta)[jm]
    verde = (e < 2.4) & (mus > 0.64); col[verde] = col[verde] * 0.35 + rampa(mus * 1.6 - 0.6, musgo)[verde] * 0.65
    for _ in range(petalos):
        x, y = rng.integers(0, n, 2); mancha(col, x, y, 1.6, rampa(rng.random(), ['#e88ab0', '#ffc8dc']), ry=1.0)
    return cuantiza(col, 40)
def tierra(rng, base, piedrita, n=128, piedras=55, hierba=None, petalos=0):
    det = fbm(n, n, rng, 4, 5); col = rampa(det, base)
    pts = rng.random((piedras, 2)) * n; d1, _, idx = voronoi(n, n, pts); rad = rng.uniform(1.2, 3.2, piedras)[idx]
    pm = d1 < rad; alt = np.where(pm, np.clip(1 - d1 / rad, 0, 1) ** 0.5, 0)
    col[pm] = rampa(rng.uniform(0.2, 0.8, piedras)[idx][pm], piedrita) * sombrea(alt * 3, 2.2)[pm]
    col *= (0.86 + 0.28 * fbm(n, n, rng, 16, 2))[..., None]
    if hierba:
        for _ in range(140):
            x, y = rng.random() * n, rng.random() * n
            for _ in range(3): trazo(col, x + rng.normal(0, 1.5), y, -math.pi / 2 + rng.normal(0, 0.4), rng.uniform(2, 4.5), rampa(rng.random(), hierba))
    for _ in range(petalos):
        x, y = rng.integers(0, n, 2); mancha(col, x, y, 1.5, rampa(rng.random(), ['#e88ab0', '#ffc8dc']), ry=1.0)
    return cuantiza(col, 36)
def hierba(rng, base, briznas, n=128, flores=None, petalos=0):
    det = fbm(n, n, rng, 4, 4); col = rampa(det * 0.9 + 0.05, base) * (0.85 + 0.3 * fbm(n, n, rng, 2, 2))[..., None]
    for _ in range(1500):
        x, y = rng.random() * n, rng.random() * n; v = det[int(y), int(x)]
        trazo(col, x, y, -math.pi / 2 + rng.normal(0, 0.45), rng.uniform(2.5, 6.5), rampa(np.clip(v + rng.normal(0, 0.25), 0, 1), briznas))
    if flores:
        for _ in range(26): x, y = rng.integers(0, n, 2); mancha(col, x, y, 1.0, hexrgb(flores[rng.integers(len(flores))]))
    for _ in range(petalos):
        x, y = rng.integers(0, n, 2); mancha(col, x, y, 1.6, rampa(rng.random(), ['#e88ab0', '#ffc8dc']), ry=1.0)
    return cuantiza(col, 40)
def sillares(rng, piedra, junta, musgo, n=128, filas=6):
    h = n // filas; col = np.zeros((n, n, 3)); alt = np.zeros((n, n)); det = fbm(n, n, rng, 8, 4); mus = fbm(n, n, rng, 4, 3); borde = (fbm(n, n, rng, 16, 2) - 0.5) * 3.2
    for f in range(filas):
        x = rng.integers(0, n); restante = n
        while restante > 0:
            ancho = min(restante, int(rng.integers(22, 40))); restante -= ancho; tono = rng.uniform(-0.13, 0.13)
            for yy in range(f * h, f * h + h):
                for xx in range(x, x + ancho):
                    X = xx % n; ey = min(yy - f * h, f * h + h - 1 - yy); ex = min(xx - x, x + ancho - 1 - xx); e = min(ex, ey) + borde[yy, X]
                    alt[yy, X] = min(1, max(0, e) / 3.5) ** 0.7; col[yy, X] = rampa(0.52 + tono + (det[yy, X] - 0.5) * 0.6, piedra)
                    if e < 1: col[yy, X] = rampa(det[yy, X], junta)
            x += ancho
    for _ in range(30):   # esquinas desconchadas
        cx, cy = rng.integers(0, n, 2); mancha(col, cx, cy, rng.uniform(1, 2.5), rampa(0.25, piedra))
    col = col * sombrea(alt * 2.0, 1.1) * (0.8 + 0.35 * fbm(n, n, rng, 3, 3))[..., None]; grietas(col, rng, 9, 18, 0.7)
    verde = (mus > 0.68) & (alt < 0.8); col[verde] = col[verde] * 0.4 + rampa(mus * 2 - 1.2, musgo)[verde] * 0.6
    return cuantiza(col, 40)
def fuste(rng, piedra, n=128, estrias=12):
    xx = np.arange(n); fl = 0.5 + 0.5 * np.cos(xx / n * estrias * 2 * math.pi); det = fbm(n, n, rng, 6, 4, basey=12)
    alt = np.tile(fl, (n, 1)) * 0.8 + det * 0.3
    col = rampa(0.5 + (det - 0.5) * 0.7 + np.tile(fl, (n, 1)) * 0.07, piedra) * sombrea(alt * 1.2, 0.9, (-1, 0))
    grietas(col, rng, 6, 30, 0.62); col *= (0.85 + 0.3 * fbm(n, n, rng, 2, 2))[..., None]
    return cuantiza(col, 32)
def corteza(rng, base, n=64, alto=128, lenticelas=True, placas=False):
    det = fbm(n, alto, rng, 4, 4, basey=12); col = rampa(det, base)
    if placas:
        pts = rng.random((26, 2)) * [n, alto]; d1, d2, _ = voronoi(n, alto, pts, ey=2.6); e = (d2 - d1) / 2
        col = col * sombrea(np.clip(e / 2.5, 0, 1) * 2, 1.6); col[e < 0.9] *= 0.45
    for _ in range(18):   # fisuras verticales
        x = rng.random() * n; trazo(col, x, rng.random() * alto, math.pi / 2 + rng.normal(0, 0.12), rng.uniform(10, 30), None, mul=0.62)
    if lenticelas:
        for _ in range(55):
            x, y = rng.integers(0, n), rng.integers(0, alto); trazo(col, x, y, rng.normal(0, 0.1), rng.uniform(2, 5), rampa(0.95, base))
    return cuantiza(col, 28)
def flores(rng, n=128, alfa=True):
    col = np.zeros((n, n, 3)); a = np.zeros((n, n))
    if not alfa: col[:] = rampa(fbm(n, n, rng, 4, 3) * 0.6, ['#7a3a5a', '#a64a72', '#c45a86']); a[:] = 255
    rosas = ['#b8507c', '#d8709a', '#f0a0c2', '#ffc8dc', '#fff0f6']
    for _ in range(300 if alfa else 380):
        x, y = rng.integers(0, n, 2); r = rng.uniform(1.6, 3.2); base = rng.uniform(0.25, 0.9)
        for p in range(5):   # cinco pétalos
            ang = p / 5 * 2 * math.pi + rng.random(); px, py = int(x + math.cos(ang) * r * 0.8), int(y + math.sin(ang) * r * 0.8)
            mancha(col, px, py, r * 0.62, rampa(np.clip(base + rng.normal(0, 0.08) + (0.1 if math.sin(ang) < 0 else -0.08), 0, 1), rosas), a)
        mancha(col, x, y, 0.8, hexrgb('#e8c040'), a)
    if alfa:
        for _ in range(40):   # alguna hojita
            x, y = rng.integers(0, n, 2); mancha(col, x, y, 1.8, rampa(rng.random(), ['#4a6a2a', '#6a8a3a']), a, ry=1.0)
    return cuantiza(col, 32, a if alfa else None)
def laca(rng, n=64):
    det = fbm(n, n, rng, 2, 3, basey=10); col = rampa(0.35 + det * 0.55, ['#5a1210', '#8a2420', '#b0362a', '#cc5038'])
    for _ in range(30): x, y = rng.integers(0, n, 2); trazo(col, x, y, math.pi / 2, rng.uniform(4, 12), None, mul=0.86)
    gasto = fbm(n, n, rng, 8, 3) > 0.7; col[gasto] = col[gasto] * 0.55 + hexrgb('#3a2018') * 0.45
    return cuantiza(col, 24)
def tejas(rng, n=128, filas=8, cols=8):
    yy, xx = np.mgrid[0:n, 0:n]; fy = (yy % (n // filas)) / (n // filas); fx = (xx % (n // cols)) / (n // cols)
    curva = np.sin(fx * math.pi); det = fbm(n, n, rng, 8, 3)
    v = 0.25 + curva * 0.55 + (det - 0.5) * 0.2 - fy * 0.25
    col = rampa(v, ['#1c2130', '#2e3548', '#465068', '#68748e', '#8a96ac'])
    col[(fy < 0.12)] *= 0.55; col[(fx < 0.06) | (fx > 0.94)] *= 0.7
    return cuantiza(col, 28)
def nieve(rng, n=128):
    det = fbm(n, n, rng, 4, 5); ond = 0.5 + 0.5 * np.sin((np.mgrid[0:n, 0:n][1] + np.mgrid[0:n, 0:n][0] * 0.5) / n * 2 * math.pi * 3 + det * 4)
    alt = det * 0.8 + ond * 0.25; col = rampa(0.55 + (det - 0.5) * 0.5, ['#8ea2c4', '#b4c4de', '#d6e2f2', '#f2f6fc']) * sombrea(alt * 2, 1.5)
    for _ in range(90): x, y = rng.integers(0, n, 2); col[y, x] = hexrgb('#ffffff') if rng.random() < 0.7 else hexrgb('#bff4ff')
    return cuantiza(col, 28)
def roca(rng, base, liquen, n=128, k=14):
    pts = rng.random((k, 2)) * n; d1, d2, idx = voronoi(n, n, pts); e = (d2 - d1) / 2; det = fbm(n, n, rng, 6, 5)
    alt = np.clip(e / 6, 0, 1) ** 0.5 + det * 0.6; tono = rng.uniform(-0.1, 0.1, k)[idx]
    col = rampa(0.5 + tono + (det - 0.5) * 0.6, base) * sombrea(alt * 2.4, 1.6); col[e < 1.1] *= 0.5
    li = fbm(n, n, rng, 8, 3) > 0.66; col[li] = col[li] * 0.4 + rampa(det, liquen)[li] * 0.6
    for _ in range(400): x, y = rng.integers(0, n, 2); col[y, x] *= rng.uniform(0.7, 1.25)
    return cuantiza(col, 36)
def hielo(rng, n=128):
    det = fbm(n, n, rng, 3, 5); col = rampa(0.35 + det * 0.55, ['#3f6f9c', '#5f8fb8', '#86b4d6', '#b0d6ec', '#dff2fb'])
    for _ in range(14):
        x, y, a = rng.random() * n, rng.random() * n, rng.random() * 6.28
        for _ in range(rng.integers(12, 40)):
            a += rng.normal(0, 0.5); x += math.cos(a); y += math.sin(a); col[int(y) % n, int(x) % n] = hexrgb('#f0fbff')
    for _ in range(40): x, y = rng.integers(0, n, 2); mancha(col, x, y, rng.uniform(0.6, 1.4), hexrgb('#d8f2ff'))
    return cuantiza(col, 28)
def agujas(rng, n=128):
    col = rampa(fbm(n, n, rng, 4, 3) * 0.5, ['#0e1c16', '#16281f', '#1f3a2a'])
    for _ in range(2200):
        x, y = rng.random() * n, rng.random() * n; lado = -1 if rng.random() < 0.5 else 1
        trazo(col, x, y, math.pi / 2 + lado * rng.uniform(0.35, 0.8), rng.uniform(3, 6), rampa(rng.random(), ['#1f3a2a', '#2c5236', '#3f6b43', '#557f4e']))
    nv = fbm(n, n, rng, 12, 3) > 0.7
    col[nv] = rampa(fbm(n, n, rng, 8, 2)[nv], ['#b4c4de', '#e6eef8'])
    return cuantiza(col, 32)

def hoja(rng0=2026):
    rng = np.random.default_rng(rng0)
    T = [
        ('ruinas-losas', losas(rng, ['#3b3449', '#5a5168', '#7a7088', '#9a8fa6'], ['#17131e', '#2a2333'], ['#28362e', '#34463a', '#435644'])),
        ('ruinas-tierra', tierra(rng, ['#2a2026', '#463638', '#624c46', '#7c6456'], ['#4a4250', '#7a7080', '#a49aaa'], hierba=['#2f4f36', '#45703f'])),
        ('ruinas-hierba', hierba(rng, ['#1a2c24', '#26422e', '#35593a', '#4a7342'], ['#26422e', '#3d6640', '#55844a', '#78a45a'], flores=['#c8a8e8', '#e8d8ff'])),
        ('ruinas-muro', sillares(rng, ['#463f5a', '#665e7c', '#887e9c', '#aaa0ba'], ['#16121c', '#241e2c'], ['#28362e', '#34463a', '#435644'])),
        ('ruinas-fuste', fuste(rng, ['#4a4458', '#6e6680', '#958ca6', '#b8b0c6'])),
        ('sakura-losas', losas(rng, ['#5e5a64', '#7c7882', '#9c98a2', '#bab6be'], ['#2a262e', '#3a3640'], ['#3a5a34', '#4f7a40'], k=14, var=0.08, petalos=40)),
        ('sakura-hierba', hierba(rng, ['#1e3a26', '#2c5430', '#3f7238', '#5a9044'], ['#2c5430', '#44803e', '#62a04c', '#88bc5e'], flores=['#ffffff', '#ffe0f0'], petalos=45)),
        ('sakura-tierra', tierra(rng, ['#5a4438', '#76594a', '#937260', '#ad8c76'], ['#7a7078', '#a49aa2', '#c8c0c6'], petalos=60)),
        ('sakura-corteza', corteza(rng, ['#2a1a1c', '#44292a', '#5e3c3a', '#7c5450'])),
        ('sakura-copa', flores(rng, alfa=False)),
        ('sakura-flores', flores(rng)),
        ('madera-laca', laca(rng)),
        ('tejas', tejas(rng)),
        ('nieve', nieve(rng)),
        ('roca', roca(rng, ['#404856', '#5e6878', '#808a9a', '#a6aebc'], ['#6a7a4a', '#8a9a5a'])),
        ('hielo', hielo(rng)),
        ('pino-corteza', corteza(rng, ['#281e18', '#3c2c22', '#544030', '#6e5640'], lenticelas=False, placas=True)),
        ('pino-agujas', agujas(rng)),
        ('cumbre-grava', tierra(rng, ['#4e5666', '#6a7282', '#8890a0', '#a8b0be'], ['#3a404c', '#7a8292', '#c8d0dc'], piedras=90)),
    ]
    HUECO, FONDO, ANCHO = 2, (0, 180, 90, 255), 5
    filas = [T[i:i + ANCHO] for i in range(0, len(T), ANCHO)]
    W = max(sum(im.width + HUECO for _, im in f) for f in filas) + HUECO
    H = sum(max(im.height for _, im in f) + HUECO for f in filas) + HUECO
    lienzo, rect, y = Image.new('RGBA', (W, H), FONDO), {}, HUECO
    for f in filas:
        x = HUECO
        for nom, im in f: lienzo.paste(im, (x, y)); rect['entorno/' + nom] = [x, y, im.width, im.height]; x += im.width + HUECO
        y += max(im.height for _, im in f) + HUECO
    lienzo.save(HOJA + '.png')
    with open(HOJA + '.json', 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('{\n' + ',\n'.join(f'  "{n}": {json.dumps(r)}' for n, r in rect.items()) + '\n}\n')
    print(f'{len(T)} texturas -> {os.path.relpath(HOJA, RAIZ)}.png ({W}x{H})')

if __name__ == '__main__':
    hoja()
