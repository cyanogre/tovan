'use strict';
/* ======================================================================
   CANAL X · EMISIÓN (a lo «To Be Hero X»: cada tramo, otro estilo de animación)
     · Contornos de tinta limpios: la segunda pasada empuja cada vértice por
       la normal media de los que comparten su sitio (antes cada cara se
       separaba por su lado y en las esquinas de los cubos quedaban astillas
       negras). Las piezas planas, translúcidas o que no son mallas no se entintan.
     · Cambio de estilo con cortinilla: tres bandas en diagonal con los colores
       del estilo nuevo, el nombre en chino y en grande, y el episodio; el
       estilo cambia debajo, mientras tapan. Sin estática ni pantallazo.
     · Índice de confianza como rótulo de emisión (信任値), con su puesto.
     · Los caracteres van en formas que traen las fuentes japonesas (動画, 街機…),
       porque «Zen Kaku Gothic New» no tiene las simplificadas.
     · Las franjas de cine del Canal X son de emisión (degradado, línea de color
       y «EN DIRECTO»), y los conos de luz del plató ya no tapan la recreativa.
   ====================================================================== */
const CX_ESTILO = {
  anime:    { zh: '動画', en: 'ANIME', c: ['#2350ff', '#ff4fb8', '#ffffff'] },
  manga:    { zh: '漫画', en: 'MANGA', c: ['#f4f4f0', '#111114', '#111114'] },
  vector:   { zh: '図形', en: 'VECTOR', c: ['#ff8ad0', '#6fe3ff', '#2a1046'] },
  arcade:   { zh: '街機', en: 'ARCADE', c: ['#12121e', '#ffd23a', '#ff3a3a'] },
  invaders: { zh: '外星', en: 'INVADERS', c: ['#05060a', '#7dff8a', '#ff5ad8'] },
  paper:    { zh: '剪紙', en: 'PAPERCUT', c: ['#c89a64', '#f8f0dc', '#3a2412'] }
};

/* ---------- Contornos de tinta sin astillas ---------- */
outlineMat.vertexShader = `attribute vec3 oNor; uniform float uW;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 on = normalMatrix * oNor; float l = length(on);
  if (l > 1e-5) mv.xyz += on / l * uW * 1.3 * max(1.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
outlineMat.needsUpdate = true;
const _tintaKey = (P, i) => Math.round(P.getX(i) * 1e4) + ',' + Math.round(P.getY(i) * 1e4) + ',' + Math.round(P.getZ(i) * 1e4);
function tintaGeo(g){   // normales medias por posición (una vez por geometría); devuelve si se puede entintar
  if (g.userData.tinta != null) return g.userData.tinta;
  const P = g.attributes.position, N = g.attributes.normal;
  if (!P || !N){ g.userData.tinta = false; return false; }
  if (!g.boundingBox) g.computeBoundingBox();
  const s = g.boundingBox.getSize(new V3());
  if (Math.min(s.x, s.y, s.z) < 1e-3){ g.userData.tinta = false; return false; }   // planos: no tienen silueta que perfilar
  const acc = new Map(), n = P.count, out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++){ const k = _tintaKey(P, i); let a = acc.get(k); if (!a){ a = [0, 0, 0]; acc.set(k, a); } a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); }
  for (let i = 0; i < n; i++){ const a = acc.get(_tintaKey(P, i)); out[i * 3] = a[0]; out[i * 3 + 1] = a[1]; out[i * 3 + 2] = a[2]; }
  g.setAttribute('oNor', new THREE.BufferAttribute(out, 3)); g.userData.tinta = true; return true;
}
function tintaObj(root){
  root.traverse(o => {
    if (!o.layers.test(_tintaCapa)) return;
    const m = o.material, op = m && m.uniforms && m.uniforms.uOpacity ? m.uniforms.uOpacity.value : 1;
    if (!o.isMesh || !o.geometry || Array.isArray(m) || op < 1 || (m && (m.transparent || m.blending !== THREE.NormalBlending)) || !tintaGeo(o.geometry)) o.layers.disable(3);
  });
}
const _tintaCapa = new THREE.Layers(); _tintaCapa.set(3);
[decoAnime, decoManga, decoVector, decoPaper].forEach(tintaObj);
const _renderOutlineCX = renderOutline;
renderOutline = function(){
  if (chActive && chOutline && chMode !== 'invaders'){
    if (!heroInked){ hero.traverse(o => o.layers.enable(3)); heroInked = true; }
    tintaObj(hero);   // barato: las geometrías ya vistas solo miran su marca
    for (const e of enemies) if (!e._ink2){ e._ink2 = true; e._ink = true; e.g.traverse(o => o.layers.enable(3)); if (e.parts) e.parts.forEach(q => q.traverse(o => o.layers.enable(3))); tintaObj(e.g); if (e.parts) e.parts.forEach(tintaObj); }
  }
  _renderOutlineCX();
};

/* ---------- Plató: los conos de luz no tapan la recreativa ---------- */
studioG.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'ConeGeometry' && o.material.uniforms && o.material.uniforms.uOpacity.value < 0.5) o.visible = false; });

/* ---------- Cortinilla de cambio de estilo ---------- */
const corteX = document.createElement('div'); corteX.id = 'corteX'; corteX.hidden = true; corteX.setAttribute('aria-hidden', 'true');
corteX.innerHTML = '<i class="cb b1"></i><i class="cb b2"></i><i class="cb b3"></i><div class="ck"></div><div class="ct"><div class="ce"></div><div class="cn"></div><div class="cs"></div></div><div class="cl">CANAL X <b>●</b> EN DIRECTO</div>';
document.body.appendChild(corteX);
const corteK = corteX.querySelector('.ck'), corteE = corteX.querySelector('.ce'), corteN = corteX.querySelector('.cn'), corteS = corteX.querySelector('.cs');
const cx = { t: 0, modo: null, cambiado: true };
const CX_DUR = 2.1, CX_TAPA = 0.42;   // dura 2,1 s; el estilo cambia a los 0,42 s, con todo tapado
function corteXMuestra(clase, E, epHTML, tit, sub){
  corteX.className = 'cx-' + clase; corteX.style.setProperty('--c1', E.c[0]); corteX.style.setProperty('--c2', E.c[1]); corteX.style.setProperty('--c3', E.c[2]);
  corteK.textContent = E.zh; corteE.innerHTML = epHTML; corteN.textContent = tit; corteS.textContent = sub;
  corteX.hidden = false; corteX.classList.remove('on'); void corteX.offsetWidth; corteX.classList.add('on'); cx.t = CX_DUR; play('cxCorte');
}
function corteXEmpieza(modo, ep, cambia){
  const c = CH.find(q => q.id === modo) || { t: modo, s: '' }, E = CX_ESTILO[modo] || CX_ESTILO.anime;
  corteXMuestra(modo, E, `第${ep}集 <b>EP.${String(ep).padStart(2, '0')}</b> · ${E.en}`, c.t, c.s);
  cx.modo = modo; cx.cambiado = !cambia; hitStop = Math.max(hitStop, CX_DUR - 0.2);
}
// Los programas del show de Míster Confianza (js/show/director.js) entran con la misma cortinilla
const CX_SHOW = { 'ep-show': { zh: '直播', c: ['#d8322a', '#ffd23a', '#ffffff'] }, 'ep-arcade': { zh: '格闘', c: ['#12121e', '#ff3a3a', '#ffffff'] },
  'ep-run': { zh: '疾走', c: ['#ff7a4a', '#5a2a8a', '#ffffff'] }, 'ep-invaders': { zh: '外星', c: ['#05060a', '#7dff8a', '#ff5ad8'] }, 'ep-rpg': { zh: '幻想', c: ['#3a4ae8', '#0a0c5a', '#ffffff'] } };
const _showEp9CX = showEp9;
showEp9 = function(G_){
  const E = CX_SHOW[G_.ep]; if (!E) return _showEp9CX(G_);
  staticT = 0; if (!cx.cambiado){ cx.cambiado = true; setChannel(cx.modo); } corteXMuestra('show ' + G_.ep, E, `<b>${G_.title[0]}</b> · Canal X`, G_.title[1], G_.title[2]);
};
switchChannel = function(){
  chEp++; chIdx = (chIdx + 1) % CH.length; chT = 22;
  corteXEmpieza(CH[chIdx].id, chEp, true);
  if (CH[chIdx].id === 'manga') barkOnce('ch_manga', '¿Dónde han ido los colores? ¿Me he quedado sin tinta?');
};
const _showEpCardCX = showEpCard;
showEpCard = function(){ if (chActive && !(typeof MG !== 'undefined' && MG.active)) corteXEmpieza(CH[chIdx].id, chEp, false); else _showEpCardCX(); };

/* ---------- Índice de confianza (sustituye a la píldora #trust, que se oculta por CSS) ---------- */
const cxTrust = document.createElement('div'); cxTrust.id = 'cxTrust'; cxTrust.hidden = true; cxTrust.setAttribute('aria-hidden', 'true'); document.body.appendChild(cxTrust);
let cxTrustKey = '', cxTrustV = 0;
const _chUpdateCX = chUpdate;
chUpdate = function(dt, pdt, playing){
  _chUpdateCX(dt, pdt, playing);
  if (cx.t > 0){
    cx.t -= dt;
    if (!cx.cambiado && cx.t <= CX_DUR - CX_TAPA){ cx.cambiado = true; setChannel(cx.modo); }
    if (cx.t <= 0){ corteX.hidden = true; corteX.classList.remove('on'); }
  }
  const ver = chActive && !trustEl.hidden && (playing || gameState === 'paused');
  if (cxTrust.hidden === ver) cxTrust.hidden = !ver;
  if (!ver){ cxTrustV = trust; return; }
  cxTrustV += (trust - cxTrustV) * Math.min(1, dt * 6); if (Math.abs(trust - cxTrustV) < 1) cxTrustV = trust;   // el número sube rodando
  const key = Math.round(cxTrustV) + '|' + trustRank;
  if (key !== cxTrustKey){ cxTrustKey = key;
    cxTrust.innerHTML = `<span class="tz">信任値</span><span class="tl">Confianza</span><b>${Math.round(cxTrustV).toLocaleString('es-ES')}</b><span class="tr"><small>Puesto</small>#${trustRank}</span>`; }
};
const _addTrustCX = addTrust;
addTrust = function(v){ const r0 = trustRank; _addTrustCX(v); if (trustRank !== r0){ cxTrust.classList.remove('sube'); void cxTrust.offsetWidth; cxTrust.classList.add('sube'); } };

Object.assign(SFX, {
  cxCorte: () => { noise({ dur: 0.35, vol: 0.18, f0: 400, f1: 6000, q: 0.7, rv: 0.2 }); tone({ type: 'square', f0: 220, f1: 880, dur: 0.18, vol: 0.05, rv: 0.2 });
    tone({ type: 'sine', f0: 90, f1: 45, dur: 0.4, vol: 0.22, when: 0.38 }); noise({ dur: 0.12, vol: 0.2, f0: 2500, q: 1.2, when: 0.38 }); }
});
