'use strict';
/* ======================================================================
   GUITARRA ELÉCTRICA DE VERDAD (prefijo rock; sobre las armas v5)
   · Suena a guitarra: cada nota es una cuerda pulsada (Karplus-Strong)
     que pasa por un ampli (filtro de pasa-altos, saturación tanh con
     sobremuestreo, ecualización de pantalla 4×12, un poco de eco y la
     reverb del juego). Acordes de quinta (raíz, quinta, octava), notas
     apagadas con la palma, octavador y solos con vibrato.
   · Los golpes normales siguen siendo con la guitarra en la mano, como
     arma: cada golpe que acierta suena a un acorde corto y el remate, a
     uno grande que se deja sonar.
   · Solo el ataque cargado (Solo de guitarra) la toca: Tovan se la cruza
     delante del cuerpo (ROCK.porta, hija de P.spine), con la mano
     izquierda (P.armR) en el mástil y la derecha (P.armL) rasgueando a
     cada nota, y toca entero un riff famoso o un solo (uno distinto cada
     vez, barajados), al tempo del riff. Sigue tocando hasta acabarlo
     aunque el movimiento termine; atacar, rodar o caer lo corta. Cargando,
     ya la tiene lista (trémolo). De la guitarra salen ondas de sonido de
     colores. Nada de texto.
   Las notas son MIDI (60 = Do central); duraciones en tiempos.
   Tipos: p = acorde de quinta, m = apagada con la palma, o = con octava
   abajo, n = nota sola, l = nota de solo (vibrato si es larga).
   ====================================================================== */
const ROCK_RIFFS = [
  { bpm: 112, n: [[43, 1, 'p'], [46, 1, 'p'], [48, 1.5, 'p'], [43, 1, 'p'], [46, 1, 'p'], [49, 0.5, 'p'], [48, 2, 'p'], [43, 1, 'p'], [46, 1, 'p'], [48, 1.5, 'p'], [46, 1, 'p'], [43, 2, 'p']] },   // humo sobre el agua
  { bpm: 124, n: [[52, 1.5, 'o'], [52, 0.5, 'o'], [55, 0.75, 'o'], [52, 0.75, 'o'], [50, 0.5, 'o'], [48, 2, 'o'], [47, 2, 'o']] },   // ejército de siete naciones
  { bpm: 84, n: [[47, 1, 'p'], [50, 1, 'p'], [50, 0.5, 'p'], [52, 0.5, 'p'], [52, 1, 'p'], [55, 1 / 3, 'p'], [54, 1 / 3, 'p'], [55, 1 / 3, 'p'], [54, 1 / 3, 'p'], [55, 1 / 3, 'p'], [54, 1 / 3, 'p'], [50, 0.5, 'p'], [50, 0.5, 'p'], [52, 0.5, 'p'], [52, 1.5, 'p']] },   // hombre de hierro
  { bpm: 116, n: [[41, 0.75, 'p'], [41, 0.25, 'm'], [41, 0.5, 'p'], [46, 0.5, 'p'], [46, 1, 'p'], [44, 0.75, 'p'], [44, 0.25, 'm'], [44, 0.5, 'p'], [49, 0.5, 'p'], [49, 1, 'p']] },   // espíritu adolescente
  { bpm: 94, n: [[40, 1.5, 'p'], [40, 0.25, 'm'], [50, 0.25, 'p'], [45, 2, 'p'], [40, 1.5, 'p'], [40, 0.25, 'm'], [50, 0.25, 'p'], [45, 2, 'p']] },   // de vuelta en negro
  { bpm: 138, n: [[42, 0.5, 'm'], [42, 0.5, 'm'], [49, 0.5, 'n'], [42, 0.5, 'm'], [50, 0.5, 'n'], [42, 0.5, 'm'], [49, 0.5, 'n'], [42, 0.5, 'm'], [47, 0.5, 'n'], [45, 0.5, 'n'], [44, 0.5, 'n'], [45, 0.5, 'n'], [47, 0.5, 'n'], [45, 0.5, 'n'], [44, 0.5, 'n'], [40, 1, 'p']] },   // tren loco
  { bpm: 150, n: [[47, 0.5, 'o'], [49, 0.5, 'o'], [50, 0.5, 'o'], [52, 0.5, 'o'], [54, 0.5, 'o'], [50, 0.5, 'o'], [54, 1, 'p'], [53, 0.5, 'o'], [49, 0.5, 'o'], [53, 1, 'p'], [52, 0.5, 'o'], [48, 0.5, 'o'], [52, 1.5, 'p']] },   // en la gruta del rey de la montaña (Grieg), en metal
  { bpm: 200, n: [[40, 1, 'p'], [40, 0.5, 'm'], [40, 0.5, 'm'], [50, 1, 'p'], [49, 1, 'p'], [48, 1.5, 'p'], [40, 0.5, 'm'], [40, 0.5, 'm'], [40, 0.5, 'm'], [40, 0.5, 'm'], [40, 0.5, 'm'], [40, 0.5, 'm'], [40, 1.5, 'p']] }   // maestro de marionetas (la bajada de la entrada)
];
const ROCK_SOLOS = [
  { bpm: 140, n: [[61, 0.5, 'l'], [73, 0.5, 'l'], [68, 0.5, 'l'], [66, 0.5, 'l'], [78, 0.5, 'l'], [68, 0.5, 'l'], [77, 0.5, 'l'], [68, 0.5, 'l'], [61, 0.5, 'l'], [73, 0.5, 'l'], [68, 0.5, 'l'], [66, 0.5, 'l'], [78, 0.5, 'l'], [68, 0.5, 'l'], [77, 1.5, 'l']] },   // dulce niña mía (medio tono abajo)
  { bpm: 133, n: [[59, 0.25, 'l'], [63, 0.25, 'l'], [59, 0.25, 'l'], [66, 0.25, 'l'], [59, 0.25, 'l'], [63, 0.25, 'l'], [59, 0.25, 'l'], [66, 0.25, 'l'], [59, 0.25, 'l'], [64, 0.25, 'l'], [59, 0.25, 'l'], [67, 0.25, 'l'], [59, 0.25, 'l'], [64, 0.25, 'l'], [59, 0.25, 'l'], [67, 0.25, 'l'], [59, 0.25, 'l'], [63, 0.25, 'l'], [59, 0.25, 'l'], [66, 0.25, 'l'], [59, 0.25, 'l'], [63, 0.25, 'l'], [59, 0.25, 'l'], [66, 1, 'l']] },   // atronador (la cuerda de si al aire con el 4-7 y el 5-8)
  { bpm: 120, n: [[69, 0.25, 'l'], [67, 0.25, 'l'], [69, 1.5, 'l'], [67, 0.25, 'l'], [65, 0.25, 'l'], [64, 0.25, 'l'], [62, 0.25, 'l'], [61, 0.5, 'l'], [62, 2, 'l']] },   // tocata y fuga en re menor (Bach)
  { bpm: 165, n: [[76, 0.25, 'l'], [75, 0.25, 'l'], [74, 0.25, 'l'], [73, 0.25, 'l'], [74, 0.25, 'l'], [73, 0.25, 'l'], [72, 0.25, 'l'], [71, 0.25, 'l'], [72, 0.25, 'l'], [71, 0.25, 'l'], [70, 0.25, 'l'], [69, 0.25, 'l'], [70, 0.25, 'l'], [69, 0.25, 'l'], [68, 0.25, 'l'], [67, 0.25, 'l'], [64, 1.5, 'l']] },   // el vuelo del moscardón (Rimski-Kórsakov)
  { bpm: 170, n: [[71, 0.5, 'l'], [73, 0.5, 'l'], [74, 0.5, 'l'], [76, 0.5, 'l'], [78, 0.5, 'l'], [74, 0.5, 'l'], [78, 1, 'l'], [77, 0.5, 'l'], [73, 0.5, 'l'], [77, 1, 'l'], [76, 0.5, 'l'], [72, 0.5, 'l'], [76, 1, 'l'], [83, 2, 'l']] },   // el rey de la montaña, rápido y una octava arriba
  { bpm: 150, n: [[76, 0.25, 'l'], [71, 0.25, 'l'], [67, 0.25, 'l'], [71, 0.25, 'l'], [76, 0.25, 'l'], [71, 0.25, 'l'], [67, 0.25, 'l'], [71, 0.25, 'l'], [77, 0.25, 'l'], [72, 0.25, 'l'], [69, 0.25, 'l'], [72, 0.25, 'l'], [79, 0.25, 'l'], [74, 0.25, 'l'], [71, 0.25, 'l'], [74, 0.25, 'l'], [88, 2, 'l']] }   // tapping en mi menor (propio)
];
const ROCK_COLS = [0xff4a8a, 0x4ad8ff, 0xffe04a, 0x7dff8a, 0xc88aff];
const ROCK = { amp: null, cuerdas: {}, sonando: [], riff: null, pos: 0, ult: -9, bolsa: [], bolsaS: [], col: 0, w: 0, t0: 0, ras: 0, rasObj: 1, solo: false, porta: null, notas: [], gen: 0, hasta: 0 };

/* ---------- El sonido ---------- */
// el ampli: pasa-altos → ganancia → saturación → pantalla → salida (y un poco de eco y reverb)
function rockAmp(){
  if (ROCK.amp && ROCK.amp.ctx === actx) return ROCK.amp;
  const c = actx, A = { ctx: c, in: c.createGain() };
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
  const drive = c.createGain(); drive.gain.value = 4;
  const sat = c.createWaveShaper(), N = 2048, curva = new Float32Array(N); for (let i = 0; i < N; i++){ const x = i / (N - 1) * 2 - 1; curva[i] = Math.tanh(3.2 * x) / Math.tanh(3.2) * (x < 0 ? 0.94 : 1); }
  sat.curve = curva; sat.oversample = '4x';
  const medios = c.createBiquadFilter(); medios.type = 'peaking'; medios.frequency.value = 420; medios.Q.value = 0.8; medios.gain.value = 4;   // cuerpo
  const presencia = c.createBiquadFilter(); presencia.type = 'peaking'; presencia.frequency.value = 2000; presencia.Q.value = 1; presencia.gain.value = 1.5;
  const pantalla = c.createBiquadFilter(); pantalla.type = 'lowpass'; pantalla.frequency.value = 3600; pantalla.Q.value = 0.8;
  const pantalla2 = c.createBiquadFilter(); pantalla2.type = 'lowpass'; pantalla2.frequency.value = 4200; pantalla2.Q.value = 0.6;   // (dos: el altavoz cae en picado por arriba)
  const out = c.createGain(); out.gain.value = 0.2;
  const eco = c.createDelay(1), ecoR = c.createGain(), ecoS = c.createGain(); eco.delayTime.value = 0.29; ecoR.gain.value = 0.28; ecoS.gain.value = 0.16;
  A.in.connect(hp); hp.connect(drive); drive.connect(sat); sat.connect(medios); medios.connect(presencia); presencia.connect(pantalla); pantalla.connect(pantalla2); pantalla2.connect(out); out.connect(sfxBus);
  out.connect(ecoS); ecoS.connect(eco); eco.connect(ecoR); ecoR.connect(eco); eco.connect(sfxBus);
  const rv = c.createGain(); rv.gain.value = 0.22; out.connect(rv); if (reverb) rv.connect(reverb);
  return (ROCK.amp = A);
}
// la cuerda: un buffer de ruido que da vueltas por una línea de retardo y se va suavizando (Karplus-Strong)
function rockCuerda(midi, corta){
  const k = midi + (corta ? 'm' : ''), c = ROCK.cuerdas[k]; if (c && c.sampleRate === actx.sampleRate) return c;
  const sr = actx.sampleRate, f = NOTE(midi), L = sr / f, N = Math.max(2, Math.floor(L)), fr = L - N, len = Math.floor(sr * (corta ? 0.3 : 2.2));
  const buf = actx.createBuffer(1, len, sr), d = buf.getChannelData(0), linea = new Float32Array(N + 1);
  let p = 0; for (let i = 0; i <= N; i++){ const w = Math.random() * 2 - 1; p += (corta ? 0.3 : 0.45) * (w - p); linea[i] = p; }   // púa: ruido más o menos brillante
  const caida = corta ? 0.94 : 0.9965 - Math.max(0, midi - 60) * 0.00008; let j = 0, ant = 0;
  for (let i = 0; i < len; i++){ const a = linea[j], b = linea[(j + 1) % (N + 1)], v = a + (b - a) * fr; d[i] = v;   // (retardo fraccional: afinada también arriba)
    const nv = caida * 0.5 * (v + ant); ant = v; linea[j] = nv; j = (j + 1) % (N + 1); }
  let mx = 0; for (let i = 0; i < Math.min(len, 4000); i++) mx = Math.max(mx, Math.abs(d[i])); if (mx > 0) for (let i = 0; i < len; i++) d[i] /= mx;
  return (ROCK.cuerdas[k] = buf);
}
// una cuerda que suena en t0 y se apaga en t1 (con vibrato si es nota de solo larga)
function rockPulsa(midi, t0, t1, vol, corta, vib){
  const c = actx, src = c.createBufferSource(), g = c.createGain(); src.buffer = rockCuerda(midi, corta);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004);
  if (t1){ g.gain.setValueAtTime(vol, Math.max(t0 + 0.005, t1 - 0.03)); g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.04); }
  if (vib){ const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(0.012, t0 + 0.25);
    lfo.connect(lg); lg.connect(src.playbackRate); lfo.start(t0); lfo.stop((t1 || t0 + 2.2) + 0.1); }
  src.connect(g); g.connect(rockAmp().in); src.start(t0); src.stop((t1 || t0 + 2.2) + 0.1);
  ROCK.sonando.push({ src, g, t0 }); return src;
}
// una nota del riff según su tipo
function rockNota(nt, t0, t1){
  const [m, , tipo] = nt;
  for (const s of ROCK.sonando) if (s.t0 < t0){ try { s.g.gain.cancelScheduledValues(t0); s.g.gain.setTargetAtTime(0.0001, t0, 0.015); } catch (e) {} }   // la mano apaga lo que sonaba
  ROCK.sonando = ROCK.sonando.filter(s => s.t0 >= t0 - 0.001);
  if (tipo === 'p') return [[0, 0.5], [7, 0.4], [12, 0.3]].map(([iv, v], i) => rockPulsa(m + iv, t0 + i * 0.008, t1, v, false, false));
  if (tipo === 'm') return [rockPulsa(m, t0, t1, 0.5, true, false), rockPulsa(m + 7, t0 + 0.006, t1, 0.35, true, false)];
  if (tipo === 'o') return [rockPulsa(m, t0, t1, 0.5, false, false), rockPulsa(m - 12, t0 + 0.004, t1, 0.4, false, false)];
  return [rockPulsa(m, t0, t1, tipo === 'l' ? 0.45 : 0.5, false, tipo === 'l' && t1 && t1 - t0 > 0.3)];
}
// baraja y saca el siguiente (sin repetir hasta acabar la bolsa)
function rockSaca(lista, bolsa){ if (!bolsa.length){ const o = lista.map((_, i) => i); for (let i = o.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } bolsa.push(...o); } return lista[bolsa.pop()]; }
// toca desde ROCK.pos lo que cabe en «ventana» segundos (al menos una nota); con ventana = 0, hasta el final
function rockTrozo(ventana, R){
  if (!actx) return; const riff = R || ROCK.riff; if (!riff) return;
  const now = actx.currentTime + 0.01, beat = 60 / riff.bpm, lista = riff.n;
  for (const q of ROCK.notas) if (q.t > now){ try { q.src.stop(); } catch (e) {} }   // lo que quedaba del trozo anterior, fuera
  ROCK.notas = []; const gen = ++ROCK.gen;
  let t = 0, i = R ? 0 : ROCK.pos, b0 = 0; for (let j = 0; j < i; j++) b0 += lista[j][1];
  const notas = [];
  while (i < lista.length){ const nt = lista[i], d = nt[1] * beat, ult = i === lista.length - 1;
    if (ventana && t > 0 && t + 0.02 >= ventana) break;
    const fin = ult || (ventana && t + d >= ventana + 0.25) ? 0 : now + t + d;   // la última nota del trozo se deja sonar
    for (const src of rockNota(nt, now + t, fin)) ROCK.notas.push({ t: now + t, src });
    const k = ROCK.col++; later(t, () => { if (ROCK.gen === gen) rockOnda(nt, k); }); notas.push([nt, t, d]);
    t += d; i++; if (!ventana && t > 3.2) break; }
  if (lvl('clones') && notas.length) try { rockBanda(now, beat, b0, t, notas, gen, !!R); } catch (err) { console.error(err); }
  if (!R){ ROCK.pos = i; if (i >= lista.length) ROCK.riff = null; }
  ROCK.ult = time; return t;
}
// corta el riff (lo que no ha sonado, fuera; lo que suena, apagado) y suelta la guitarra
function rockCorta(){
  if (!ROCK.hasta) return; ROCK.hasta = 0; ROCK.gen++; if (!actx) return; const now = actx.currentTime;
  for (const q of ROCK.notas) if (q.t > now){ try { q.src.stop(); } catch (e) {} } ROCK.notas = [];
  for (const s_ of ROCK.sonando){ try { s_.g.gain.cancelScheduledValues(now); s_.g.gain.setTargetAtTime(0.0001, now, 0.03); } catch (e) {} } ROCK.sonando = [];
}
// a cada nota: onda de sonido delante de la guitarra y un rasgueo de la mano derecha
function rockOnda(nt, k){
  if (curW() !== 'guitar' || gameState !== 'play') return;
  const g = WEAPONS.guitar, col = ROCK_COLS[k % ROCK_COLS.length], p = rockV.set(0, 0.62, 0.08); g.localToWorld(p);
  const grande = nt[2] === 'p' || nt[2] === 'o', f = hero.rotation.y;
  gring(p.x + Math.sin(f) * 0.3, p.y, p.z + Math.cos(f) * 0.3, col, 0.15, grande ? 1.5 : 1.0, grande ? 0.4 : 0.3, f, 0.85);
  if (rnd() < 0.6) pa(p.x, p.y + 0.2, p.z, Math.sin(f) * 2 + (rnd() - 0.5), 1.2 + rnd(), Math.cos(f) * 2 + (rnd() - 0.5), col, 0.12, 0.5, -1, 1, 0, SH7.star);
  ROCK.rasObj = -ROCK.rasObj; ROCK.ras = ROCK.rasObj;
}
const rockV = new V3();

/* ---------- La banda: con los clones de sombra, uno toca la batería y otro el bajo ---------- */
function rockBajo(){
  if (ROCK.bajo && ROCK.bajo.ctx === actx) return ROCK.bajo;
  const c = actx, B = { ctx: c, in: c.createGain() }, lp = c.createBiquadFilter(), sat = c.createWaveShaper(), out = c.createGain(), N = 1024, cv = new Float32Array(N);
  for (let i = 0; i < N; i++){ const x = i / (N - 1) * 2 - 1; cv[i] = Math.tanh(1.6 * x); }   // (un poco de gruñido, sin la distorsión de la guitarra)
  lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.9; sat.curve = cv; out.gain.value = 0.42;
  B.in.connect(sat); sat.connect(lp); lp.connect(out); out.connect(sfxBus); return (ROCK.bajo = B);
}
function rockBombo(t){ const w = t - actx.currentTime; tone({ type: 'sine', f0: 130, f1: 42, dur: 0.22, vol: 0.4, when: w, rv: 0.05 }); noise({ dur: 0.02, vol: 0.12, f0: 3000, type: 'highpass', when: w, rv: 0 }); }
function rockCaja(t){ const w = t - actx.currentTime; noise({ dur: 0.16, vol: 0.32, f0: 1900, q: 0.7, when: w, rv: 0.25 }); tone({ type: 'triangle', f0: 200, f1: 150, dur: 0.09, vol: 0.18, when: w, rv: 0.1 }); }
function rockCharles(t, abierto){ noise({ dur: abierto ? 0.18 : 0.04, vol: 0.07, f0: 8000, type: 'highpass', when: t - actx.currentTime, rv: 0.05 }); }
function rockBanda(now, beat, b0, T, notas, gen, solo){
  // batería en la rejilla de corcheas del riff: bombo en 1 y 3 (y en los acordes), caja en 2 y 4, charles en todas
  const desde = Math.ceil(b0 * 2 - 1e-6), hasta = b0 * 2 + T / beat * 2;
  for (let j = desde; j < hasta; j++){ const tt = now + (j / 2 - b0) * beat, golpe = j / 2, enTiempo = j % 2 === 0, bt = Math.floor(golpe) % 4;
    rockCharles(tt, !enTiempo && j % 4 === 3);
    if (enTiempo && (bt === 1 || bt === 3)){ rockCaja(tt); later(tt - now, () => { if (ROCK.gen === gen) rockClonOnda(0, 0xffe04a); }); }
    else if (enTiempo && bt === 0){ rockBombo(tt); later(tt - now, () => { if (ROCK.gen === gen) rockClonOnda(0, 0xff4a8a); }); }
    if (solo && !enTiempo) rockCharles(tt + beat / 4, false); }
  // el bajo: la nota del riff (o la del solo) dos octavas abajo; con los acordes, bombo también
  for (const [nt, t, d] of notas){ let m = nt[0]; while (m > 40) m -= 12;
    const src = actx.createBufferSource(), g = actx.createGain(), t0 = now + t; src.buffer = rockCuerda(m, false);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.7, t0 + 0.006); g.gain.setValueAtTime(0.7, t0 + Math.max(0.01, d - 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.05);
    src.connect(g); g.connect(rockBajo().in); src.start(t0); src.stop(t0 + d + 0.1); ROCK.notas.push({ t: t0, src });
    if ((nt[2] === 'p' || nt[2] === 'o') && t > 0) rockBombo(t0);
    later(t, () => { if (ROCK.gen === gen) rockClonOnda(1, 0x4ad8ff); }); }
}
// a cada golpe de la banda, una onda en el clon que lo toca
function rockClonOnda(i, col){
  if (!lvl('clones') || curW() !== 'guitar' || gameState !== 'play' || !cloneP[i]) return; const c = cloneP[i];
  gring(c.x, 1.0, c.z, col, 0.1, 0.8, 0.22, hero.rotation.y, 0.7); if (rnd() < 0.4) pa(c.x, 1.6, c.z, (rnd() - 0.5), 1.5, (rnd() - 0.5), col, 0.1, 0.4, -1, 1, 0, SH7.star);
}

/* ---------- Los movimientos ---------- */
const ROCK_TODOS = ROCK_RIFFS.concat(ROCK_SOLOS);
const rock_startMove = startMove;
startMove = function(name, idx){
  if (name !== 'chGuitar') rockCorta();   // (cualquier otro movimiento corta el riff)
  rock_startMove(name, idx);
  if (curW() !== 'guitar' || name !== 'chGuitar') return;
  try { initAudio(); if (!actx) return; const R = rockSaca(ROCK_TODOS, ROCK.bolsa); ROCK.solo = ROCK_SOLOS.includes(R); ROCK.riff = null;
    const T = rockTrozo(0, R) || 0; ROCK.hasta = time + T + 0.3; } catch (err) { console.error(err); }
};
MV.chGuitar.trail = [2, 2.1];   // (la estela del arma iría por el aire: la guitarra está en el cuerpo)
// los golpes normales: un acorde corto al acertar y uno grande que se deja sonar en el remate (ya no a sierra)
const ROCK_GOLPE = [40, 43, 45, 47, 38];
Object.assign(SFX, {
  strum: () => { if (!actx || ROCK.hasta) return; const t = actx.currentTime + 0.005; rockNota([ROCK_GOLPE[ROCK.col++ % ROCK_GOLPE.length], 1, 'p'], t, t + 0.2); },
  chordSolo: () => {},
  chord: () => { if (!actx) return; rockNota([Math.random() < 0.5 ? 40 : 45, 1, 'p'], actx.currentTime + 0.01, 0); }
});

/* ---------- La pose: tocarla de verdad ---------- */
// dónde va (en P.spine) y cómo se ponen los brazos: [x, y, z del hombro, codo] (izq = P.armR, el que lleva el arma)
const ROCK_POSE = { pos: [0.41, 0.46, 0.36], rot: [0.15, -0.3, 2.15], esc: 1, izq: [-1.6, 0.3, 0.5, -0.7], der: [-0.7, 0, 0.6, -0.9], solo: 2.6 };
function rockPorta(){
  if (ROCK.porta) return ROCK.porta;
  const g = new THREE.Group(); P.spine.add(g); return (ROCK.porta = g);
}
function rockPose(){
  const G = WEAPONS.guitar; if (!G) return;
  const dt = Math.min(0.1, Math.max(0, time - ROCK.t0)); ROCK.t0 = time;
  if (ROCK.hasta && (time > ROCK.hasta || player.dead || state === 'roll' || state === 'dead' || curW() !== 'guitar' || gameState !== 'play' && gameState !== 'paused')) rockCorta();
  const toca = curW() === 'guitar' && !player.dead && !lcut && ((state === 'attack' && curMove && curMove.name === 'chGuitar') || (state === 'charge' && staffInHand) || (ROCK.hasta > 0 && state !== 'attack'));
  ROCK.w += ((toca ? 1 : 0) - ROCK.w) * (1 - Math.exp(-dt * 18)); if (!toca && ROCK.w < 0.03) ROCK.w = 0;
  const por = rockPorta();
  if (ROCK.w <= 0){ if (G.parent === por){ staff.add(G); G.position.set(0, 0, 0); G.rotation.set(0, 0, 0); } if (ROCK.lampara){ ROCK.lampara = false; lamp.visible = true; } return; }
  if (G.parent !== por){ por.add(G); G.position.set(0, 0, 0); G.rotation.set(0, 0, 0); }
  if (lamp.visible){ lamp.visible = false; ROCK.lampara = true; }   // (la linterna del bastón quedaba suelta en la mano)
  const w = ROCK.w, solo = ROCK.solo && ROCK.hasta > 0, cargando = state === 'charge';
  ROCK.ras += (0 - ROCK.ras) * (1 - Math.exp(-dt * 14));   // el rasgueo vuelve solo
  if (cargando && (ROCK.trem = (ROCK.trem || 0) + dt) > 0.07){ ROCK.trem = 0; ROCK.ras = ROCK.rasObj = -ROCK.rasObj; }   // cargando: trémolo
  const Q = ROCK_POSE; por.position.fromArray(Q.pos); por.rotation.set(Q.rot[0], Q.rot[1], solo ? Q.solo : Q.rot[2]); por.scale.setScalar(Q.esc);
  // mano izquierda (P.armR) en el mástil; derecha (P.armL) en las cuerdas
  const L = P.armR, R = P.armL, r = ROCK.ras, a = Q.izq, b = Q.der;
  bl(L.sh.rotation, 'x', a[0] - (solo ? 0.4 : 0), w); bl(L.sh.rotation, 'y', a[1], w); bl(L.sh.rotation, 'z', a[2], w); bl(L.el.rotation, 'x', a[3], w);
  bl(R.sh.rotation, 'x', b[0] - r * 0.22, w); bl(R.sh.rotation, 'y', b[1], w); bl(R.sh.rotation, 'z', b[2], w); bl(R.el.rotation, 'x', b[3] + r * 0.35, w);
  bl(P.spine.rotation, 'y', 0.2, w * 0.6); bl(P.spine.rotation, 'x', solo ? -0.28 : 0.05, w); if (solo) bl(P.neck.rotation, 'x', -0.35, w);
}
const rock_legendPose = legendPose;
legendPose = function(){ rock_legendPose(); try { rockPose(); } catch (err) { console.error(err); } };
