'use strict';
/* ---------- Texturas pixel-art (los PNG están en assets/texturas) ---------- */
const groundTex = texAsset('mundo/ruinas-suelo');
const brickTex = texAsset('mundo/ruinas-ladrillo');
const coatTex = texAsset('jugador/tovan-abrigo');
const HAIR = 0x7a2f1f;
const hairTex = texAsset('jugador/tovan-pelo');
const faceTex = texAsset('jugador/tovan-cara'), faceBlink = texAsset('jugador/tovan-cara-parpadeo'), faceHappy = texAsset('jugador/tovan-cara-feliz');
const sideTex = texAsset('jugador/tovan-cabeza-lado');
const shadowTex = texAsset('efectos/sombra');
const runeTex = texAsset('efectos/runas-linterna');
const grassTex = texAsset('mundo/hierba');

/* ---------- Materiales ---------- */
const M = {
  coat: makeMat(0xffffff, { map: coatTex }),
  coatDS: makeMat(0xffffff, { map: coatTex, side: THREE.DoubleSide }),
  pants: makeMat(0x4a3526), boot: makeMat(0x2e2320), glove: makeMat(0x8a5a36),
  skin: makeMat(0xe8b894), hair: makeMat(0xffffff, { map: hairTex }),
  face: makeMat(0xffffff, { map: faceTex }), side: makeMat(0xffffff, { map: sideTex }),
  scarf: makeMat(0xb3242b), gold: makeMat(0xd9a441), belt: makeMat(0x3a2418),
  wood: makeMat(0x5a3a22), crystal: makeMat(0x7ff5ff, { emissive: 1 }),
  stone: makeMat(0xffffff, { map: brickTex }), iron: makeMat(0x3a3036),
  rock: makeMat(0x6d6474), mount: makeMat(0x2a1f3a),
  shadow: makeMat(0x000000, { map: shadowTex, emissive: 1, opacity: 0.7 }),
  grass: makeMat(0xffffff, { map: grassTex, side: THREE.DoubleSide, emissive: 0.3 }),
  rune: makeMat(0xffffff, { map: runeTex, emissive: 0.8 })
};
