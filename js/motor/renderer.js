'use strict';
/* ---------- Renderer / escena ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setClearColor(0x000000, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd = mulberry32(1997);
function rgb(hex, k = 1){
  const r = Math.min(255, ((hex >> 16) & 255) * k) | 0, g = Math.min(255, ((hex >> 8) & 255) * k) | 0, b = Math.min(255, (hex & 255) * k) | 0;
  return `rgb(${r},${g},${b})`;
}
// Textura dibujada por código. Las del juego están en assets/texturas (ver texAsset en motor/assets.js);
// esta queda por si alguna vez hace falta generar una sobre la marcha.
function canvasTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function px(g, x, y, c){ g.fillStyle = c; g.fillRect(x, y, 1, 1); }
