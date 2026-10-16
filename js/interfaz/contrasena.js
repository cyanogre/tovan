'use strict';
/* ======================================================================
   CONTRASEÑA (menú de título → Contraseña)
   «marckbyn» desbloquea todo: logros (y con ellos los estéticos), finales,
   poderes, jefes vistos, sinergias y 9999 fragmentos para el Santuario. Además, en la
   pantalla de Finales, cada final conseguido tiene «▶ Ver» para repetir su
   escena entera.
   ====================================================================== */
const CLAVE_TODO = 'marckbyn';
function desbloqueaTodo(){
  const t = Date.now();
  for (const a of ACH) meta.ach[a.id] = meta.ach[a.id] || t;
  meta.endings = meta.endings || {}; for (const E of ENDINGS) meta.endings[E.id] = true;
  const pw = pwStore(); for (const id in PW) pw[id] = pw[id] || t;
  meta.bosses = meta.bosses || {}; for (const b of ALL_BOSSES) meta.bosses[b] = 1;
  meta.syn = meta.syn || {};   // el códice de sinergias, con los mismos nombres y textos que al descubrirlas
  for (const src in CARRY_SYN) for (const el in CARRY_SYN[src]) meta.syn[`carry_${src}_${el}`] = meta.syn[`carry_${src}_${el}`] || [CARRY_SYN[src][el], `${SRC_LABEL[src]} + ${EL_LABEL[el]}: también aplica ${EL_LABEL[el].toLowerCase()}.`];
  for (const src in CHAIN_SYN) meta.syn['chain_' + src] = meta.syn['chain_' + src] || [CHAIN_SYN[src], `Rebote + ${SRC_LABEL[src]}.`];
  for (const src in BOOM_SYN) meta.syn['boom_' + src] = meta.syn['boom_' + src] || [BOOM_SYN[src], `Munición explosiva + ${SRC_LABEL[src]}.`];
  meta.frag = Math.max(meta.frag || 0, 9999);
  saveMeta(); refreshTitleMenu(); refreshPct();
}

/* ---------- Pantalla ---------- */
const passScr = document.createElement('div'); passScr.className = 'overlay'; passScr.id = 'passScr'; passScr.hidden = true;
passScr.innerHTML = `<div class="win panel passp"><h2>Contraseña</h2><p class="sub2">Escribe una contraseña y pulsa Aceptar.</p>
  <input id="passIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="24" aria-label="Contraseña">
  <p id="passMsg"></p><div><button class="win btn" id="passOk">Aceptar</button><button class="win btn" id="passBack">Volver</button></div></div>`;
document.body.appendChild(passScr);
const passIn = document.getElementById('passIn'), passMsg = document.getElementById('passMsg');
function openPass(){ passScr.hidden = false; titleScr.hidden = true; passMsg.textContent = ''; passMsg.className = ''; passIn.value = ''; play('confirm'); setTimeout(() => passIn.focus(), 50); }
function closePass(){ passScr.hidden = true; titleScr.hidden = false; play('cursor'); }
function probarPass(){
  const v = passIn.value.trim().toLowerCase();
  if (v === CLAVE_TODO){ desbloqueaTodo(); passMsg.textContent = '¡Todo desbloqueado! Logros, estéticos, finales, poderes, sinergias y 9999 ✦.'; passMsg.className = 'ok'; play('achieve'); }
  else { passMsg.textContent = 'Contraseña incorrecta.'; passMsg.className = 'mal'; play('bruteWarn'); }
}
document.getElementById('passOk').addEventListener('click', probarPass);
document.getElementById('passBack').addEventListener('click', closePass);
passIn.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') probarPass(); if (e.key === 'Escape') closePass(); });
{ const b = document.createElement('button'); b.className = 'win tbtn'; b.id = 'passBtn';
  b.innerHTML = '<span class="ti">🔒</span><span class="tl">Contraseña</span><span class="td">Trucos</span>';
  b.addEventListener('click', openPass); document.getElementById('introBtn').after(b); }

/* ---------- Finales: volver a ver la escena ---------- */
function verFinal(id){
  endScr.hidden = true; titleScr.hidden = true; clearWorld(); applyBiome(FINAL); endingId = id;
  runCine(endingScript(id), () => {
    cineEls.white.style.opacity = '0'; hud.hidden = true; waveBox.hidden = true; gameState = 'over';
    const E = ENDINGS.find(x => x.id === id);
    endEl.querySelector('.en').textContent = `FINAL ${ENDINGS.indexOf(E) + 1} DE ${ENDINGS.length}`;
    endEl.querySelector('.et').textContent = E.name; endEl.querySelector('.ety').textContent = 'Final ' + E.type.toLowerCase();
    endEl.querySelector('.ety').className = 'ety t-' + E.type.toLowerCase();
    endEl.querySelector('.ed').textContent = E.desc; endEl.querySelector('.er').textContent = ''; endEl.querySelector('.ep').textContent = '';
    endEl.hidden = false;
  });
}
const _openEndingsPass = openEndings;
openEndings = function(){
  _openEndingsPass();
  const got = meta.endings || {};
  document.querySelectorAll('#endList .endi').forEach((el, i) => { const E = ENDINGS[i]; if (!E || !got[E.id]) return;
    const b = document.createElement('button'); b.className = 'win btn sm verfin'; b.textContent = '▶ Ver';
    b.addEventListener('click', () => { play('confirm'); verFinal(E.id); }); el.appendChild(b); });
};
// el botón de Finales llamaba a la versión antigua: se cambia por la nueva
{ const old = document.getElementById('endBtn'), nb = old.cloneNode(true); old.replaceWith(nb); nb.addEventListener('click', () => openEndings()); }
