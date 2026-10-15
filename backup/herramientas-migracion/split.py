"""Parte index.html (monolito) en un proyecto con css/, js/ y assets/.
Uso: py -3 split.py <carpeta_salida>"""
import os, sys, json, re, base64, io, contextlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index-original.html')
OUT = sys.argv[1]
L = open(SRC, encoding='utf-8').read().split('\n')
line = lambda n: L[n - 1]

# ---------------------------------------------------------------- CSS
CSS = [
    ('base.css', 'Variables, página, lienzo y ventanas', [(11, 36)]),
    ('hud.css', 'HUD y menú de configuración', [(37, 68)]),
    ('pantallas.css', 'Pantallas: título, mejoras, pausa, fin de partida y santuario', [(70, 127)]),
    ('interfaz-v2.css', 'Interfaz v2 (retrato, chips, combo, cartas) y móvil compacto', [(128, 233)]),
    ('historia.css', 'Diálogos, capítulos y cinemática', [(234, 284)]),
    ('logros-vestidor.css', 'Logros, avisos y vestidor', [(285, 327)]),
    ('expansion.css', 'Expansión: modo realista, glitch, cuelgue falso, isekai', [(328, 359)]),
    ('canal-x.css', 'Canal X', [(360, 398)]),
    ('finales.css', 'Cortes legendarios, jefe final y finales', [(399, 430)]),
    ('canal-x-2.css', 'Canal X 2.0', [(431, 442)]),
    ('numeros.css', 'Números de daño flotantes', [(443, 450)]),
    ('tactil.css', 'Controles táctiles', [(452, 463)]),
    ('menus-v3.css', 'v3: menú de título, vestidor, pausa y presentación de jefes', [(464, 529)]),
]
# CSS que el JS inyectaba con <style> en tiempo de ejecución (se cargan después, en este orden)
CSS_FROM_JS = [
    # (fichero, descripción, línea inicio, línea fin del bloque JS, origen)
    ('pantalla-poderes.css', 'Poderes v5: cartas menores, pantalla de poderes', 8573, 8583),
    ('efectos-v7.css', 'Estética v7: números, ventana emergente y franjas', 10557, 10570),
    ('show.css', 'v9: el show de Míster Confianza', 11311, 11318),
    ('cartas-v10.css', 'v10: cartas acumulables y bonus de familia', 12442, 12451),
    ('impacto-v12.css', 'v12: números con impacto', 12804, 12808),
    ('tragaperras-v13.css', 'v13: tragaperras y cartas de sinergia', 13245, 13257),
    ('marcianitos-v13.css', 'v13.1: HUD durante los marcianitos', 13636, 13640),
    ('iconos-pixel.css', 'v13.2: iconos en pixel art', 13873, 13877),
    ('menus-movil.css', 'v13.4: menús para móvil', 13899, 14044),
]
CSS_SUBST = {
    'iconos-pixel.css': [('url(${PX13_SHEET})', 'url(../assets/img/iconos-16px.png)')],
    'menus-movil.css': [('@media ${MOB13}{', '@media (max-width: 720px), (max-height: 520px){')],
}

# ---------------------------------------------------------------- JS
# (ruta, [rangos de líneas originales], cabecera opcional)
G = []  # grupos: (título, [ficheros])


def grp(title, *files):
    G.append((title, list(files)))


R = lambda a, b: (a, b)
grp('Motor 3D (look PS1)',
    ('motor/renderer.js', [R(699, 721)]),
    ('motor/shader-ps1.js', [R(722, 722), R(697, 697), R(723, 851)]),
    ('motor/texturas.js', [R(852, 970)]))
grp('Juego base',
    ('jugador/modelo-tovan.js', [R(971, 1125)]),
    ('mundo/ruinas.js', [R(1126, 1217)]),
    ('nucleo/matematicas.js', [R(1218, 1228)]),
    ('nucleo/estado.js', [R(1229, 1244), R(14122, 14122)]),
    ('nucleo/dom.js', [R(14126, 14129)], '/* ---------- Referencias al DOM del HUD y de las pantallas principales ---------- */'),
    ('audio/sonido.js', [R(1245, 1346)]),
    ('audio/musica.js', [R(1347, 1388)]),
    ('progreso/fragmentos.js', [R(1389, 1408)]),
    ('entrada/mando.js', [R(1409, 1436)]),
    ('efectos/basicos.js', [R(1437, 1505)]),
    ('jugador/movimientos.js', [R(1506, 1558)]),
    ('jugador/acciones.js', [R(1559, 1709)]),
    ('enemigos/enemigos.js', [R(1710, 2047)]),
    ('partida/oleadas.js', [R(2048, 2079)]),
    ('partida/mejoras.js', [R(2080, 2152)]),
    ('partida/ciclo.js', [R(14130, 14190)],
     '/* ---------- Ciclo de la partida: empezar, limpiar, pausar, perder y volver al título ----------\n'
     '   Varias capas posteriores amplían estas funciones envolviéndolas\n'
     '   (busca «const _startRun», «const _clearWorld», «const _showOver»…). */'))
grp('Sinergias: estados elementales, reacciones, cadenas y combo',
    ('sinergias/elementos.js', [R(2153, 2204)]),
    ('sinergias/rayos.js', [R(2205, 2272)]),
    ('sinergias/reacciones.js', [R(2273, 2358)]),
    ('combate/combo.js', [R(2359, 2384)]),
    ('sinergias/mejoras-familias.js', [R(2385, 2413)]),
    ('sinergias/ganchos-combate.js', [R(2414, 2505)]),
    ('interfaz/chips-sinergias.js', [R(2506, 2535)]))
grp('Mundo: escenarios, ambiente, oni y dragón',
    ('mundo/escenarios.js', [R(2536, 2669)]),
    ('mundo/ambiente.js', [R(2670, 2693)]),
    ('audio/musica-escenarios.js', [R(2694, 2713)]),
    ('enemigos/oni.js', [R(2714, 2774)]),
    ('jefes/ryujin.js', [R(2775, 2987)]))
grp('Historia: diálogos, Lumen, viajes y capítulos',
    ('historia/textos.js', [R(2988, 3056)]),
    ('historia/dialogos.js', [R(3057, 3136)]),
    ('historia/viajes.js', [R(3137, 3170)]))
grp('Cinemática de introducción',
    ('cinematicas/decorado-intro.js', [R(3171, 3341)]),
    ('cinematicas/motor-guion.js', [R(3342, 3377)]),
    ('cinematicas/intro.js', [R(3378, 3531)]))
grp('Logros y estéticos',
    ('progreso/logros.js', [R(3532, 3572)]),
    ('progreso/esteticos.js', [R(3573, 3664)]),
    ('progreso/desbloqueos.js', [R(3665, 3709)]),
    ('interfaz/logros-vestidor.js', [R(3710, 3759)]))
grp('Familia Otaku',
    ('poderes/otaku-tecnicas.js', [R(3760, 3911)]),
    ('poderes/otaku-pasivas.js', [R(3912, 4084)]))
grp('Expansión: capítulos 4 y 5, Castillo Infinito',
    ('mundo/playa.js', [R(4085, 4332)]),
    ('mundo/ruinas-corruptas-castillo.js', [R(4333, 4399)]),
    ('mundo/capitulos.js', [R(4400, 4447)]))
grp('Expansión: enemigos nuevos y jefes',
    ('enemigos/realistas.js', [R(4448, 4503)]),
    ('jefes/gashadokuro.js', [R(4504, 4590)]),
    ('jefes/tetera-utah.js', [R(4591, 4663)]),
    ('jefes/error-404.js', [R(4664, 4708)]),
    ('jefes/seis-ojos.js', [R(4709, 4747)]))
grp('Expansión: isekai, castillo, historia y extras',
    ('historia/expansion.js', [R(4748, 4788)]),
    ('historia/isekai.js', [R(4789, 4892)]))
grp('Canal X',
    ('canal-x/plato.js', [R(4893, 5026)]),
    ('jefes/mister-confianza.js', [R(5027, 5113)]),
    ('canal-x/extras.js', [R(5114, 5140)]))
grp('Jefes rediseñados',
    ('jefes/rediseno-pixelart.js', [R(5141, 5380)]))
grp('Sinergias emergentes',
    ('sinergias/emergentes.js', [R(5381, 5529)]))
grp('Especiales legendarios',
    ('efectos/cortes-legendarios.js', [R(5530, 5606)]))
grp('Final: la azotea del anticuario, el Gato y los finales',
    ('audio/canciones-jefes.js', [R(5611, 5657)]),
    ('jefes/gato-final.js', [R(5607, 5610), R(5658, 5862)]),
    ('historia/finales.js', [R(5863, 6014)]),
    ('progreso/completado.js', [R(6015, 6055)]))
grp('Canal X 2.0',
    ('canal-x/estilos.js', [R(6056, 6180)]),
    ('canal-x/marcianitos.js', [R(6181, 6282)]))
grp('Mejoras v2: formas de atacar, cargados, poderes del vestidor, billetes',
    ('progreso/poderes-esteticos.js', [R(6283, 6419)]),
    ('combate/billetes.js', [R(6420, 6462)]),
    ('jugador/movimientos-v2.js', [R(6463, 6531)]),
    ('jugador/ataque-cargado.js', [R(6532, 6736)]),
    ('partida/extras-v2.js', [R(6737, 6874)]))
grp('Modelos v3: enemigos esculpidos',
    ('modelos/esculpido.js', [R(6875, 6934)]),
    ('modelos/enemigos-v3.js', [R(6935, 7280)]))
grp('v3: limpieza, estilos de arma, entradas de jefe y menús',
    ('combate/limpieza.js', [R(7281, 7323)]),
    ('armas/estilos.js', [R(7324, 7447)]),
    ('jefes/entradas.js', [R(7448, 7557)]),
    ('interfaz/vestidor.js', [R(7558, 7605)]),
    ('interfaz/pausa.js', [R(7606, 7662)]),
    ('interfaz/menu-titulo.js', [R(7663, 7702)]))
grp('Banda sonora v3',
    ('audio/banda-sonora/instrumentos.js', [R(7703, 7806)]),
    ('audio/banda-sonora/composicion.js', [R(7807, 7887)]),
    ('audio/banda-sonora/temas.js', [R(7888, 7986)]))
grp('Poderes v5',
    ('poderes/v5/catalogo.js', [R(7987, 8064)]),
    ('poderes/v5/reparto.js', [R(8065, 8202)]),
    ('poderes/v5/ganchos.js', [R(8203, 8340)]),
    ('poderes/v5/bucle.js', [R(8341, 8508)]),
    ('interfaz/pantalla-poderes.js', [R(8509, 8585)]))
grp('Armas v5',
    ('armas/modelos.js', [R(8586, 8694)]),
    ('armas/combos-cargados.js', [R(8695, 8876)]),
    ('armas/poderes.js', [R(8877, 9055)]))
grp('Enemigos v5: bichos propios de cada nivel',
    ('enemigos/regiones/comun.js', [R(9056, 9078)]),
    ('enemigos/regiones/ruinas.js', [R(9079, 9118)]),
    ('enemigos/regiones/santuario.js', [R(9119, 9188)]),
    ('enemigos/regiones/cumbre.js', [R(9189, 9257)]),
    ('enemigos/regiones/canal-x.js', [R(9258, 9335)]),
    ('enemigos/regiones/playa.js', [R(9336, 9375)]),
    ('enemigos/regiones/corruptas.js', [R(9376, 9430)]),
    ('enemigos/regiones/castillo.js', [R(9431, 9467)]),
    ('enemigos/regiones/registro.js', [R(9468, 9553)]))
grp('Jefes v5: ataques nuevos y segunda fase',
    ('jefes/ataques-v5.js', [R(9554, 9790)]),
    ('jefes/mister-marcianitos.js', [R(9791, 9862)]))
grp('Anime v6',
    ('poderes/anime/catalogo.js', [R(9863, 9953)]),
    ('poderes/anime/mecanicas.js', [R(9954, 10187)]))
grp('Estética v7: que todos los poderes se vean',
    ('efectos/v7/sistemas.js', [R(10188, 10343)]),
    ('efectos/v7/recursos.js', [R(10344, 10407)]),
    ('efectos/v7/accesorios.js', [R(10408, 10572)]),
    ('efectos/v7/accesorios-anim.js', [R(10573, 10712)]),
    ('efectos/v7/auras.js', [R(10713, 10799)]),
    ('efectos/v7/particulas-poderes.js', [R(10800, 10939)]),
    ('efectos/v7/golpes.js', [R(10940, 11217)]))
grp('Ajustes v8',
    ('ajustes/v8.js', [R(11218, 11298)]))
grp('v9: el show de Míster Confianza, Súper Repartidor y crías de dragón',
    ('show/plato.js', [R(11299, 11520)]),
    ('show/pelea.js', [R(11521, 11655)]),
    ('show/carrera.js', [R(11656, 11755)]),
    ('show/marcianitos.js', [R(11756, 11764)]),
    ('show/fantasia-final.js', [R(11765, 11926)]),
    ('show/director.js', [R(11927, 12033)]),
    ('poderes/super-repartidor.js', [R(12034, 12114)]),
    ('jefes/ryujin-crias.js', [R(12115, 12186)]))
grp('Ajustes v10',
    ('ajustes/v10-jefes.js', [R(12187, 12332)]),
    ('poderes/ramas.js', [R(12333, 12484)]),
    ('historia/comedia-v10.js', [R(12485, 12539)]))
grp('v11: Míster Confianza fase 2 y movimiento con inercia',
    ('jefes/mister-fase2.js', [R(12540, 12720)]),
    ('jugador/inercia.js', [R(12721, 12795)]))
grp('v12: impacto, acrobacias, vestidor y títulos',
    ('combate/impacto.js', [R(12796, 12898)]),
    ('jugador/acrobacias.js', [R(12899, 12950)]),
    ('progreso/titulos.js', [R(12951, 13056)]))
grp('v13: familias, poderes, sinergias, comedia, iconos y móvil',
    ('poderes/v13/catalogo.js', [R(13057, 13242)]),
    ('poderes/v13/tragaperras-fortaleza.js', [R(13243, 13318)]),
    ('poderes/v13/ganchos.js', [R(13319, 13538)]),
    ('poderes/v13/poses-bucle.js', [R(13539, 13640)]),
    ('historia/comedia-v13.js', [R(13641, 13864)]),
    ('interfaz/iconos-pixel.js', [R(13865, 13892)]),
    ('interfaz/menus-movil.js', [R(13893, 14121)]))
grp('Arranque (siempre al final)',
    ('interfaz/santuario.js', [R(14191, 14211)], '/* ---------- Santuario ---------- */'),
    ('interfaz/titulo.js', [R(14123, 14123), R(14212, 14224)],
     '/* ---------- Pantalla de título y fin de partida: botones y arranque ---------- */'),
    ('entrada/controles.js', [R(14226, 14294)]),
    ('motor/resolucion.js', [R(14296, 14308)]),
    ('interfaz/menu-opciones.js', [R(14310, 14338)]),
    ('main.js', [R(14340, 14724)]))

# líneas que se quitan del JS (y qué se deja en su lugar)
REMOVE = {}
for f, d, a, b in CSS_FROM_JS:
    REMOVE[(a, b)] = f'/* (estilos de esta parte: css/{f}) */'
REMOVE[(8572, 8572)] = None           # cabecera «Estilos» del bloque quitado
REMOVE[(14125, 14125)] = None         # «Partida»: dom.js y ciclo.js llevan su propia cabecera
REMOVE[(14191, 14191)] = None         # «Santuario»: santuario.js lleva su propia cabecera
REMOVE[(13870, 13870)] = '/* (la hoja de iconos está en assets/img/iconos-16px.png) */'
# sustituciones puntuales de texto en el JS
EDITS = {
    5611: ('archivos mp3 junto al juego, o cargados desde Opciones', 'mp3 en assets/audio/, o cargados desde Opciones'),
    5617: ("a.src = name + '.mp3'", "a.src = AUDIO_DIR + name + '.mp3'"),
}
INSERT_AFTER = {5611: "const AUDIO_DIR = 'assets/audio/';"}

# ---------------------------------------------------------------- validación
with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
    import deps as Dp
A = Dp.A
stm = A.out  # sentencias: l0, l1, kind, names
body0, body1 = 697, 14724
assigned = {}
files = [f for _, fs in G for f in fs]
for fi, f in enumerate(files):
    for a, b in f[1]:
        for n in range(a, b + 1):
            if n in assigned:
                raise SystemExit(f'línea {n} asignada dos veces ({assigned[n]} y {f[0]})')
            assigned[n] = fi
removed = set()
for (a, b) in REMOVE:
    removed.update(range(a, b + 1))
for n in range(body0, body1 + 1):
    if n not in assigned and n not in removed and line(n).strip():
        raise SystemExit(f'línea {n} sin asignar: {line(n)[:80]!r}')
# ninguna sentencia partida entre ficheros / rangos
rng_of = {}
for fi, f in enumerate(files):
    for ri, (a, b) in enumerate(f[1]):
        for n in range(a, b + 1):
            rng_of[n] = (fi, ri)
for s in stm:
    ids = {rng_of.get(n) for n in range(s['l0'], s['l1'] + 1)}
    if len(ids) != 1:
        raise SystemExit(f"sentencia partida {s['l0']}-{s['l1']}: {s['head']}")
    # una sentencia quitada debe quitarse entera
    inr = [n in removed for n in range(s['l0'], s['l1'] + 1)]
    if any(inr) and not all(inr):
        raise SystemExit(f"sentencia quitada a medias {s['l0']}-{s['l1']}")
# orden de carga: posición nueva de cada sentencia
pos = {}
for fi, f in enumerate(files):
    k = 0
    for a, b in f[1]:
        for n in range(a, b + 1):
            pos[n] = (fi, k); k += 1
decl_line = Dp.where
kind = Dp.kind
problems = []
for (l0, l1, names), s in zip(Dp.load, [x for x in stm if x['kind'] != 'function']):
    if l0 in removed or l0 not in pos:
        continue
    p = pos[l0]
    for nm in names:
        dl = decl_line[nm]
        q = pos.get(dl)
        if q is None:
            problems.append((l0, nm, 'declaración quitada'))
            continue
        k = kind[nm]
        if k in ('function', 'var'):
            ok_new = q[0] < p[0] or q[0] == p[0]
        else:
            ok_new = q < p
        ok_old = (k in ('function', 'var')) or dl < l0
        if not ok_new and ok_old:
            problems.append((l0, nm, f'{k} declarado en {files[q[0]][0]} (después de {files[p[0]][0]})'))
if problems:
    for pr in problems:
        print('ORDEN:', pr)
    raise SystemExit('problemas de orden de carga')
print('validación OK:', len(files), 'ficheros JS')

# ---------------------------------------------------------------- escritura
def w(path, text):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def js_lines(ranges):
    out = []
    for a, b in ranges:
        n = a
        while n <= b:
            hit = next(((ra, rb) for (ra, rb) in REMOVE if ra == n), None)
            if hit:
                rep = REMOVE[hit]
                if rep:
                    out.append(rep)
                n = hit[1] + 1
                continue
            t = line(n)
            if n in EDITS:
                old, new = EDITS[n]
                assert old in t, (n, old)
                t = t.replace(old, new)
            out.append(t)
            if n in INSERT_AFTER:
                out.append(INSERT_AFTER[n])
            n += 1
    # quitar líneas en blanco al principio y al final, y dobles en blanco seguidas
    while out and not out[0].strip():
        out.pop(0)
    while out and not out[-1].strip():
        out.pop()
    res = []
    for t in out:
        if not t.strip() and res and not res[-1].strip():
            continue
        res.append(t)
    return res


for title, fs in G:
    for f in fs:
        path, ranges = f[0], f[1]
        hdr = f[2] if len(f) > 2 else None
        body = js_lines(ranges)
        text = "'use strict';\n" + (hdr + '\n' if hdr else '') + '\n'.join(body) + '\n'
        w('js/' + path, text)

# CSS
for name, desc, ranges in CSS:
    body = []
    for a, b in ranges:
        body += L[a - 1:b]
    while body and not body[0].strip():
        body.pop(0)
    while body and not body[-1].strip():
        body.pop()
    w('css/' + name, f'/* {desc} */\n' + '\n'.join(body) + '\n')
for name, desc, a, b in CSS_FROM_JS:
    blk = '\n'.join(L[a - 1:b])
    m = re.search(r'textContent = `\n?(.*?)`;', blk, re.S)
    css = m.group(1)
    assert '\\' not in css
    for old, new in CSS_SUBST.get(name, []):
        assert old in css, (name, old)
        css = css.replace(old, new)
    assert '${' not in css, name
    w('css/' + name, f'/* {desc} */\n' + css.strip('\n') + '\n')

# hoja de iconos
m = re.search(r"const PX13_SHEET = 'data:image/png;base64,([A-Za-z0-9+/=]+)';", line(13870))
os.makedirs(os.path.join(OUT, 'assets', 'img'), exist_ok=True)
with open(os.path.join(OUT, 'assets', 'img', 'iconos-16px.png'), 'wb') as fh:
    fh.write(base64.b64decode(m.group(1)))

# index.html
head = L[0:9]  # <!DOCTYPE> … fuentes
markup = L[531:692]  # <body> … </div> del pad (líneas 532-692)
assert L[531] == '<body>' and L[692].startswith('<script src="https://cdnjs'), (L[531], L[692])
links = ['<link rel="stylesheet" href="css/' + n + '">' for n, _, _ in CSS]
links += ['<link rel="stylesheet" href="css/' + n + '">' for n, _, _, _ in CSS_FROM_JS]
scripts = ['', '<!-- Three.js r128 -->', L[692], '',
           '<!-- Juego. EL ORDEN IMPORTA: cada bloque amplía o modifica los anteriores (ver README.md) -->']
for title, fs in G:
    if title.startswith('Arranque'):
        scripts.append('')
        scripts.append('<!-- Tus añadidos: pon aquí los ficheros nuevos (antes del arranque) -->')
        scripts.append('')
    scripts.append(f'<!-- {title} -->')
    for f in fs:
        scripts.append(f'<script src="js/{f[0]}"></script>')
html = '\n'.join(head) + '\n' + '\n'.join(links) + '\n</head>\n' + '\n'.join(markup) + '\n' + '\n'.join(scripts) + '\n</body>\n</html>\n'
w('index.html', html)
json.dump({'groups': [(t, [f[0] for f in fs]) for t, fs in G], 'css': [c[0] for c in CSS] + [c[0] for c in CSS_FROM_JS]},
          open(os.path.join(OUT, '_manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('escrito en', OUT)
