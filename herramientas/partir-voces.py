"""Para doblar las frases de Lumen que aún no tienen voz (las de assets/fuentes/voces/lumen.json sin mp3).

ElevenLabs cobra un crédito por carácter del prompt y va mejor generando lotes de ~1300 caracteres que frase a
frase, así que se generan lotes con las frases separadas por «[pause]» y luego se parte el audio:

  py -3 herramientas/partir-voces.py lotes <carpeta>
      escribe <carpeta>/lote-01.txt… con las frases pendientes; la primera línea («# ids: …») dice cuáles son
      y el resto es el prompt para ElevenLabs (voz «Sara Martin 3», modelo eleven_v4).
  py -3 herramientas/partir-voces.py partir <carpeta>/lote-01.txt <audio del lote>.mp3
      parte el audio en assets/audio/lumen/<id>.mp3 y rehace js/generado/voces.js.

Para partir se buscan los silencios con ffmpeg, se transcribe cada trozo con Whisper y se reparten los trozos
entre las frases minimizando la distancia de edición con el texto (los silencios dentro de una frase duran lo
mismo que los «[pause]», así que contarlos no basta). Hace falta ffmpeg, «pip install sherpa-onnx numpy» y el
modelo sherpa-onnx-whisper-base de las releases de k2-fsa/sherpa-onnx en GitHub (asr-models), descomprimido en
herramientas/.whisper/ o donde diga la variable WHISPER_DIR. Mira la columna «err» del informe: por encima de 0,35
conviene escuchar esa frase.
"""
import json, os, re, subprocess, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
voces = __import__('voces')
LOTE = 1300

def pendientes():
    with open(voces.TEXTOS, encoding='utf-8') as fh: textos = json.load(fh)
    hay = {f[:-4] for f in os.listdir(voces.ORIGEN)} if os.path.isdir(voces.ORIGEN) else set()
    return [x for x in textos if voces.fnv(x['texto']) not in hay]

def lotes(carpeta):
    pend = sorted(pendientes(), key=lambda x: x['origen'].split('.')[0]); os.makedirs(carpeta, exist_ok=True)
    grupos, cur, n = [], [], 0
    for x in pend:
        if cur and n + len(x['prompt']) + 11 > LOTE: grupos.append(cur); cur, n = [], 0
        cur.append(x); n += len(x['prompt']) + 11
    if cur: grupos.append(cur)
    total = 0
    for k, g in enumerate(grupos, 1):
        prompt = '\n\n[pause]\n\n'.join(x['prompt'] for x in g); total += len(prompt)
        with open(os.path.join(carpeta, f'lote-{k:02}.txt'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write('# ids: ' + ','.join(voces.fnv(x['texto']) for x in g) + '\n' + prompt + '\n')
    print(f'{len(pend)} frases sin voz en {len(grupos)} lotes ({total} caracteres ≈ créditos)')

def norm(t):
    t = unicodedata.normalize('NFD', re.sub(r'\[[^\]]*\]', '', t).lower())
    return ' '.join(re.sub(r'[^a-zñ ]', '', unicodedata.normalize('NFC', ''.join(c for c in t if unicodedata.category(c) != 'Mn' or c == '̃'))).split())

def lev(x, y):
    if not x or not y: return len(x) + len(y)
    pr = list(range(len(y) + 1))
    for i, cx in enumerate(x, 1):
        cu = [i]
        for j, cy in enumerate(y, 1): cu.append(min(pr[j] + 1, cu[j - 1] + 1, pr[j - 1] + (cx != cy)))
        pr = cu
    return pr[-1]

def partir(lote, audio):
    import numpy as np, sherpa_onnx
    with open(lote, encoding='utf-8') as fh: cab, prompt = fh.read().split('\n', 1)
    ids = cab.replace('# ids:', '').strip().split(',')
    partes = [p.strip() for p in prompt.split('[pause]\n') if p.strip()]
    # un «[pause]» dentro de una frase no separa: se vuelve a juntar hasta tener una parte por id
    while len(partes) > len(ids): i = min(range(len(partes) - 1), key=lambda i: len(partes[i])); partes[i:i + 2] = [partes[i] + ' ' + partes[i + 1]]
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    A = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; SR = 16000; T = len(A) / SR
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', audio, '-af', 'silencedetect=noise=-38dB:d=0.16', '-f', 'null', '-'], capture_output=True, text=True).stderr
    S, s0 = [], None
    for l in err.splitlines():
        m = re.search(r'silence_start: ([\d.]+)', l)
        if m: s0 = max(0.0, float(m.group(1)))
        m = re.search(r'silence_end: ([\d.]+)', l)
        if m and s0 is not None: S.append((s0, float(m.group(1)))); s0 = None
    if s0 is not None: S.append((s0, T))
    if not S or S[0][0] > 0.02: S.insert(0, (0.0, 0.0))
    if S[-1][1] < T - 0.02: S.append((T, T))
    C = [(S[j][1], S[j + 1][0]) for j in range(len(S) - 1)]   # trozos de voz entre silencios
    M = os.environ.get('WHISPER_DIR') or os.path.join(RAIZ, 'herramientas', '.whisper', 'sherpa-onnx-whisper-base')
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=os.path.join(M, 'base-encoder.int8.onnx'), decoder=os.path.join(M, 'base-decoder.int8.onnx'),
                                                    tokens=os.path.join(M, 'base-tokens.txt'), language='es', task='transcribe', num_threads=4)
    W = []
    for a, b in C:
        if b - a < 0.22: W.append(''); continue
        s = rec.create_stream(); seg = A[int(max(0, a - 0.05) * SR):int(min(T, b + 0.05) * SR)]
        s.accept_waveform(SR, np.concatenate([np.zeros(1600, np.float32), seg, np.zeros(3200, np.float32)])); rec.decode_stream(s)
        W.append(norm(s.result.text))
    R = [norm(p) for p in partes]; n, m = len(R), len(C)
    if m < n: sys.exit(f'solo hay {m} trozos de voz para {n} frases')
    une = lambda a, b: ' '.join(w for w in W[a:b] if w)
    INF = float('inf'); dp = [[INF] * (m + 1) for _ in range(n + 1)]; bk = [[0] * (m + 1) for _ in range(n + 1)]; dp[0][0] = 0
    for j in range(1, n + 1):
        for b in range(j, m + 1):
            for a in range(j - 1, b):
                if dp[j - 1][a] == INF: continue
                v = dp[j - 1][a] + lev(une(a, b), R[j - 1])
                if v < dp[j][b]: dp[j][b], bk[j][b] = v, a
    cortes = [m]
    for j in range(n, 0, -1): cortes.append(bk[j][cortes[-1]])
    cortes.reverse(); os.makedirs(voces.ORIGEN, exist_ok=True)
    for j, i in enumerate(ids):
        a, b = cortes[j], cortes[j + 1]; t0 = max(0, C[a][0] - 0.06); t1 = min(T, C[b - 1][1] + 0.14); d = t1 - t0
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t0:.3f}', '-to', f'{t1:.3f}', '-i', audio,
                        '-af', f'afade=t=in:d=0.02,afade=t=out:st={max(0, d - 0.06):.3f}:d=0.06', '-ac', '1', '-ar', '44100', '-b:a', '48k',
                        os.path.join(voces.ORIGEN, i + '.mp3')], check=True)
        e = lev(une(a, b), R[j]) / max(1, len(R[j]))
        print(f"{'!!' if e > 0.35 else '  '} {i} {d:5.2f} s  err {e:.2f}  {une(a, b)[:60]}")
    sys.argv = sys.argv[:1]; voces.main()

if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == 'lotes': lotes(sys.argv[2])
    elif len(sys.argv) == 4 and sys.argv[1] == 'partir': partir(sys.argv[2], sys.argv[3])
    else: print(__doc__)
