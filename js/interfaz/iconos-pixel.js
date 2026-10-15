'use strict';
/* =====================================================================
   v13.2 · iconos en pixel art en lugar de emojis
   Iconos originales de Tovan dibujados en pixel art (16x16), sin partir de ningún set de emojis
   ===================================================================== */
const PX13_KEYS = ["🏷️", "⚡", "🔥", "🗡️", "🔒", "7️⃣", "📜", "🏆", "🎬", "✨", "⚙", "👕", "💎", "🧪", "🌩️", "☄️", "📦", "🩴", "🚚", "⚗️", "🃏", "📸", "🪙", "⚠", "💥", "🩸", "🎯", "❤️", "👟", "🛡️", "🔁", "🧊", "💢", "✍️", "☂️", "🦆", "💸", "🥖", "📈", "☕", "💀", "🦸", "✔", "⚔", "⏭", "❄️", "🌋", "🌀", "🔆", "🌟", "🥶", "🐈", "😎", "🧘", "👋", "🗿", "🎩", "🐜", "🚫", "👑", "🏮", "🥨", "🔊", "🤡", "🎁", "📺", "🌊", "⏱️", "👉", "🫖", "🧲", "🧬", "🍀", "🔋", "💨", "🦘", "🍷", "💉", "🥘", "🎸", "🪀", "🪭", "🔨", "🌍", "🤖", "✊", "👏", "🧐", "🤸", "🎰", "🔰", "🍒", "🔔", "⏳", "😤", "🔷", "⛈️", "🍖", "🌪️", "🪶", "👶", "📭", "⏰", "🐉", "👹", "🏔️", "🎓", "🛠️", "🛍️", "🐷", "🧢", "🍲", "😇", "🚧", "🥸", "🐔", "🌈", "🎊", "🧍", "🕺", "🙆", "❓", "🔵", "👥", "💛", "📓", "📉", "🏖️", "🔌", "🌙", "🦊", "🟪", "📡", "🔗", "💣", "🐍", "☠️", "🪞", "🍄", "🪐", "🏠", "🐱", "🎉", "💿", "🎒", "🎮", "🛵", "↩️", "📍", "🚐", "😴", "😡", "🌵", "🧥", "💫", "🎵", "🍌", "🎳", "💰", "🪅", "🫁", "🌨️", "👻", "🕶️", "🕳️", "➕", "🔦", "🗼", "✝️", "🍫", "🥚", "🐣", "🌑", "🌬️", "🍤", "🍚", "🤘", "💃", "⭐", "🔴", "🍑", "🪵", "🍓", "🐕", "🐸", "🫲", "⚔️", "🛑", "⚫", "👝", "💠", "🔮", "🌕", "☁️", "⬆", "👍", "🥷", "😊", "🔄", "🪽", "🧗", "🪂", "🎲", "🧱", "🩹", "🦺", "🏎️", "🧾", "📮", "🛞", "🔬", "🕯️", "🚀", "🏰", "❔"];
/* (la hoja de iconos está en assets/img/iconos-16px.png) */
const PX13_IDX = new Map(); PX13_KEYS.forEach((k, i) => { PX13_IDX.set(k, i); PX13_IDX.set(k.replace(/️/g, ''), i); });
const PX13_RE = new RegExp('(' + [...PX13_IDX.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')️?', 'gu');
/* (estilos de esta parte: css/iconos-pixel.css) */
function px13Html(s){ return String(s).replace(PX13_RE, (m, k) => { const i = PX13_IDX.get(k); return i == null ? m : `<i class="px13" style="--c:${i % 16};--r:${(i / 16) | 0}" aria-hidden="true"></i>`; }); }
const PX13_SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'TITLE', 'CANVAS']);
function px13Node(n){
  if (n.nodeType === 3){ const t = n.nodeValue; if (!t || !PX13_RE.test(t)) return; PX13_RE.lastIndex = 0; const p = n.parentNode; if (!p || PX13_SKIP.has(p.nodeName)) return;
    const span = document.createElement('span'); span.innerHTML = px13Html(t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]));
    const f = document.createDocumentFragment(); while (span.firstChild) f.appendChild(span.firstChild); p.replaceChild(f, n); return; }
  if (n.nodeType !== 1 || PX13_SKIP.has(n.nodeName)) return;
  if (n.title && PX13_RE.test(n.title)){ PX13_RE.lastIndex = 0; n.title = n.title.replace(PX13_RE, '').trim(); }
  PX13_RE.lastIndex = 0;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), list = []; while (w.nextNode()) list.push(w.currentNode);
  for (const t of list) px13Node(t);
}
px13Node(document.body);
new MutationObserver(ms => { for (const m of ms){ if (m.type === 'characterData') px13Node(m.target); else for (const n of m.addedNodes) px13Node(n); } })
  .observe(document.body, { childList: true, subtree: true, characterData: true });
