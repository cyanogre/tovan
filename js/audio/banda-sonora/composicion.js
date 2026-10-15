'use strict';
/* ---------- Composición ---------- */
// acordes: número = grado de la escala (tríada con la propia escala); array = notas midi explícitas
function chordOf(S, c){
  if (Array.isArray(c)) return c;
  const n = S.scale.length, d2m = d => S.root + 12 * Math.floor(d / n) + S.scale[((d % n) + n) % n];
  return [d2m(c), d2m(c + 2), d2m(c + 4)];
}
function composeMel(S, seed){
  const R = mulberry32(seed), n = S.scale.length, M = S.meter;
  const d2m = d => S.root + 12 * Math.floor(d / n) + S.scale[((d % n) + n) % n];
  S._ch = S.prog.map(c => chordOf(S, c));
  const nearestDeg = (midi, d0) => { let best = d0, bd = 99; for (let d = S.lo - 2; d <= S.hi + 2; d++){ const e = Math.abs(d2m(d) - midi) + Math.abs(d - d0) * 0.01; if (e < bd){ bd = e; best = d; } } return best; };
  const snap = (d, bar) => { const ch = S._ch[bar % S._ch.length], m = d2m(d); let best = ch[0], bd = 99;
    for (const c of ch) for (const o of [-24, -12, 0, 12, 24]){ const e = Math.abs(c + o - m); if (e < bd){ bd = e; best = c + o; } } return nearestDeg(best, d); };
  const pick = a => a[Math.floor(R() * a.length)];
  const steps = [-2, -1, -1, -1, 1, 1, 1, 2, 0, 3, -3];
  function phrase(bar0, d0, rh){
    const out = []; let d = d0;
    for (let b = 0; b < 2; b++){ const r = rh[b];
      for (let s = 0; s < M; s++){ if (r[s] !== 'x') continue;
        d += pick(steps); if (d > S.hi) d -= 2; if (d < S.lo) d += 2;
        if (s === 0 || (M % 4 === 0 && s === M / 2 && R() < 0.6)) d = snap(d, bar0 + b);
        out.push({ st: b * M + s, d }); } }
    return out;
  }
  const rhy = () => pick(S.rhythm);
  const rA = [rhy(), rhy()], rB = [rhy(), rhy()];
  const a2r = rhy();
  const A = phrase(0, S.start || 4, rA), A2 = phrase(2, A[0] ? A[0].d : 4, [rA[0], a2r]), Bp = phrase(4, (S.start || 4) + 2, rB), A3 = A.map(x => ({ ...x }));
  if (A3.length) A3[A3.length - 1].d = snap(S.end != null ? S.end : n, 7);
  const all = [...A.map(x => ({ st: x.st, d: x.d })), ...A2.map(x => ({ st: x.st + 2 * M, d: x.d })), ...Bp.map(x => ({ st: x.st + 4 * M, d: x.d })), ...A3.map(x => ({ st: x.st + 6 * M, d: x.d }))];
  // forma A A' B A: la última frase repite el motivo y cierra en la tónica
  const L = M * 8, mel = new Array(L).fill(null);
  const rhAll = [rA[0], rA[1], rA[0], a2r, rB[0], rB[1], rA[0], rA[1]];
  all.forEach((x, i) => { const nx = all[i + 1], bar = Math.floor(x.st / M), r = rhAll[bar];
    let len = 1; for (let s = x.st % M + 1; s < M && r[s] === '-'; s++) len++;
    if (nx && nx.st - x.st < len) len = nx.st - x.st;
    mel[x.st] = { m: d2m(x.d), d: x.d, len }; });
  S._d2m = d2m; return mel;
}
// dos melodías por tema (misma armonía): la canción da dos vueltas distintas antes de repetirse
function composeSong(S){ const s0 = S.seed || 11; S._mels = [composeMel(S, s0), composeMel(S, s0 * 7 + 13)]; S._mel = S._mels[0]; }
let mPrev = 0;
function compStep(S, st, when, sd){
  if (!S._mels) composeSong(S);
  const M = S.meter, IB = S.intro != null ? S.intro : 4, abs = Math.floor(st / M), s = st % M;
  const intro = abs < IB, bar = intro ? abs : (abs - IB) % S.len, ch = S._ch[bar % S._ch.length];
  const brk = !intro && bar >= S.len - 4, V = S.vol || 1;
  musGain = S.gain || 1;
  const I = k => INS[k] || INS.bass;
  // fondo armónico
  if (s === 0 && S.pad) I(S.pad)(ch[0] + (S.padOct || 0), when, sd * M * 1.02, 0.05 * V);
  if (s === 0 && S.pad2){ for (const c of ch.slice(1)) I(S.pad2)(c + (S.pad2Oct || 0), when, sd * M * 1.02, 0.03 * V); }
  if (s === 0 && S.drone) I(S.drone)(((S.root - 38) % 12 + 12) % 12 + 38, when, sd * M * 1.02, 0.035 * V);
  // bajo
  if (S.bassPat){ const p = S.bassPat[s % S.bassPat.length]; if (p !== '.' && !(intro && S.introNoBass)){
    const b0 = ((ch[0] - 36) % 12 + 12) % 12 + 36, m = (p === 'o' ? b0 + 12 : p === 'f' ? b0 + ch[2] - ch[0] - 12 : b0) + (S.bassOct || 0);
    I(S.bassIns || 'bass')(m, when, sd * (S.bassLen || 1.6), 0.13 * V * (S.bassVol || 1)); } }
  // arpegio / acompañamiento
  if (S.arpPat){ const p = S.arpPat[s % S.arpPat.length];
    if (p === 'x'){ const i = (s + bar) % 4, m = i === 3 ? ch[0] + 12 : ch[i % 3]; I(S.arp)(m + (S.arpOct || 0), when, sd * 1.5, 0.045 * V * (S.arpVol || 1)); }
    else if (p === 's'){ ch.concat([ch[0] + 12]).forEach((c, k) => I(S.arp)(c + (S.arpOct || 0), when + k * 0.012, sd * 2, 0.03 * V * (S.arpVol || 1))); } }
  // percusión
  if (S.drums && !(intro && S.introNoDrums)){
    for (const [k, pat] of Object.entries(S.drums)){ const pp = brk && S.breakDrums && S.breakDrums[k] != null ? S.breakDrums[k] : pat; const c = pp[s % pp.length];
      if (c && c !== '.') I(k.replace(/[0-9]+$/, ''))(c === 'X' ? 1 : c === 't' ? 2 : 3, when, sd, (c === 'X' || c === 'x' ? 0.22 : 0.11) * V * (S.drumVol || 1)); } }
  // melodía
  if (!intro && S.lead){
    const pass = Math.floor((abs - IB) / S.len) % 2, k = (bar * M + s) % (M * 8), note = S._mels[pass][k];
    if (note){ const up = brk && S.breakUp ? 12 : 0, m = note.m + up + (S.leadOct || 0);
      I(S.lead)(m, when, sd * note.len * 0.96, 0.07 * V * (S.leadVol || 1), mPrev); mPrev = m;
      if (S.harm != null){ const hm = S._d2m(note.d + S.harm) + up + (S.leadOct || 0); I(S.harmIns || S.lead)(hm, when, sd * note.len * 0.96, 0.04 * V * (S.leadVol || 1)); }
      if (S.glitchy && Math.random() < 0.12) for (let r = 1; r <= 3; r++) INS.glitch(m + (Math.random() < 0.5 ? 12 : 0), when + r * sd * 0.25, sd * 0.2, 0.035 * V); } }
  // detalles por estilo
  if (S.ocean && s === 0 && abs % 2 === 0) mNoise({ dur: sd * M * 2, vol: 0.05, f0: 420, f1: 900, type: 'lowpass', q: 0.5, when, attack: sd * M * 0.9, rv: 0.4 });
  if (S.gongEvery && s === 0 && abs % S.gongEvery === 0) INS.gong(((S.root - 45) % 12 + 12) % 12 + 45, when, 3, 0.06 * V);
  if (S.crashEvery && s === 0 && abs % S.crashEvery === 0 && !intro) INS.crash(0, when, 1.4, 0.05 * V);
  if (S.bellsEvery && s % S.bellsEvery === 0 && Math.random() < 0.35) INS.bell(S._d2m(S.hi - Math.floor(Math.random() * 4)) + 12, when, 1, 0.022 * V);
  if (S.glitchy && Math.random() < 0.03) mNoise({ dur: sd * 2, vol: 0.06, f0: 300 + Math.random() * 4000, q: 6, when });
}
