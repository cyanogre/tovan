'use strict';
/* ======================================================================
   TUTORIAL (la 1.ª oleada de la primera partida)
   Lumen enseña paso a paso: moverse, la cámara, atacar, rodar, saltar,
   pelear, el especial y las cartas. Mientras se aprenden los movimientos
   no sale ningún enemigo. En el táctil, el botón de cada paso parpadea.
   'tovan-tuto' = '1' si ya se ha hecho (o saltado), '0' si se ha pedido
   desde Opciones → Tutorial; sin valor, sale solo en la primera partida.
   ====================================================================== */
let tutoEstado = null;
try { tutoEstado = localStorage.getItem('tovan-tuto'); } catch (e) {}
const tutoToca = () => tutoEstado === '0' || (tutoEstado == null && (meta.runs || 0) < 1);
const tutoGuarda = v => { tutoEstado = v; try { localStorage.setItem('tovan-tuto', v); } catch (e) {} };
const tuto = { on: false, i: 0, t: 0, dist: 0, giro: 0, atq: 0, rod: 0, sal: 0, esp: 0, bajas: 0, carta: false, px: 0, pz: 0, yaw: 0 };
function tutoActivo(){ return tuto.on; }
const TUTO_PASOS = [
  { txt: 'Muévete un poco por la plaza.', pc: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o las flechas', tac: 'Arrastra el círculo de la izquierda', ojo: '#joy', hecho: () => tuto.dist > 3 },
  { txt: 'Gira la cámara para ver lo que viene.', pc: 'Arrastra con el ratón · la rueda acerca y aleja', tac: 'Arrastra el dedo por la pantalla', hecho: () => tuto.giro > 0.8 || tuto.t > 8 },
  { txt: 'Ataca. Tres golpes seguidos son un combo; mantén pulsado para cargar.', pc: '<kbd>J</kbd> o clic', tac: 'Pulsa ATACAR', ojo: '[data-act=attack]', hecho: () => tuto.atq >= 3 },
  { txt: 'Rueda para esquivar: mientras ruedas, no te tocan.', pc: '<kbd>K</kbd> o <kbd>Shift</kbd>', tac: 'Pulsa RODAR', ojo: '[data-act=roll]', hecho: () => tuto.rod >= 1 },
  { txt: 'Salta. En el aire tampoco te tocan, y si atacas, caes en picado.', pc: '<kbd>Espacio</kbd>', tac: 'Pulsa SALTAR', ojo: '[data-act=jump]', hecho: () => tuto.sal >= 1 },
  { txt: '¡Ahí vienen! Tumba a tres.', suelta: true, hecho: () => tuto.bajas >= 3 },
  { txt: 'Cada golpe llena el ímpetu. Te lo he llenado yo: suelta el especial (con los pies en el suelo).', pc: '<kbd>L</kbd> o clic derecho', tac: 'Pulsa ESPECIAL', ojo: '[data-act=special]',
    entra: () => { player.meter = 100; }, hecho: () => tuto.esp >= 1 || tuto.t > 20 },   // (en el aire no sale: a los 20 s, se sigue igual)
  { txt: 'Acaba con los que quedan: cuando no quede ninguno, la oleada se cierra.', resto: true, hecho: () => gameState === 'upgrade' },
  { txt: 'Elige una carta. Tres cartas de la misma familia activan un bonus.', pc: '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> o clic', tac: 'Toca una carta', arriba: true, hecho: () => tuto.carta }
];

/* ---------- Panel ---------- */
const tutoEl = document.createElement('div'); tutoEl.id = 'tuto'; tutoEl.hidden = true; tutoEl.setAttribute('aria-live', 'polite');
tutoEl.innerHTML = '<canvas width="32" height="32" aria-hidden="true"></canvas><div class="tb"><div class="tp"></div><div class="tx"></div><div class="tk"></div></div><button class="tsk" type="button">Saltar tutorial</button>';
document.body.appendChild(tutoEl);
const tutoPic = tutoEl.querySelector('canvas'), tutoP = tutoEl.querySelector('.tp'), tutoX = tutoEl.querySelector('.tx'), tutoK = tutoEl.querySelector('.tk');
tutoEl.querySelector('.tsk').addEventListener('click', e => { e.stopPropagation(); play('confirm'); tutoFin(); });
const tutoTactil = () => matchMedia('(pointer:coarse)').matches;
function tutoPinta(){
  const P = TUTO_PASOS[tuto.i], tac = tutoTactil();
  { const g = tutoPic.getContext('2d'); if (g){ g.imageSmoothingEnabled = false; g.clearRect(0, 0, 32, 32); g.drawImage(assetImg('retratos/lumen'), 0, 0); } }
  tutoP.textContent = `Tutorial · ${tuto.i + 1} de ${TUTO_PASOS.length}`;
  tutoX.textContent = P.txt; tutoK.innerHTML = (tac ? P.tac : P.pc) || ''; tutoK.hidden = !tutoK.innerHTML;
  tutoEl.classList.toggle('arriba', !!P.arriba); tutoEl.classList.remove('ok'); tutoEl.classList.remove('nuevo'); void tutoEl.offsetWidth; tutoEl.classList.add('nuevo');
  document.querySelectorAll('.tutoOjo').forEach(el => el.classList.remove('tutoOjo'));
  if (tac && P.ojo) document.querySelectorAll(P.ojo).forEach(el => el.classList.add('tutoOjo'));
}
function tutoPaso(i){
  tuto.i = i; tuto.t = 0;
  if (TUTO_PASOS[i] && TUTO_PASOS[i].resto) while (tuto.extra > 0 && queue.length && queue[queue.length - 1] === 'imp'){ queue.pop(); waveTotal--; tuto.extra--; }   // fuera los de práctica que no han salido
  if (i >= TUTO_PASOS.length){ tutoFin(true); return; }
  const P = TUTO_PASOS[i]; if (P.entra) P.entra();
  tutoPinta(); play('cursor');
}
function tutoEmpieza(){
  Object.assign(tuto, { on: true, i: 0, t: 0, extra: 0, dist: 0, giro: 0, atq: 0, rod: 0, sal: 0, esp: 0, bajas: 0, carta: false, px: hero.position.x, pz: hero.position.z, yaw: camYaw, okT: 0 });
  tutoEl.hidden = false; tutoPaso(0);
}
function tutoFin(completo){
  if (!tuto.on) return;
  tuto.on = false; tutoEl.hidden = true; tutoGuarda('1');
  document.querySelectorAll('.tutoOjo').forEach(el => el.classList.remove('tutoOjo'));
  if (completo) later(0.6, () => { barkT = 0; bark('Ya sabes lo básico. Ahora, a por el primer trozo del sello.'); });
}

/* ---------- Ganchos ---------- */
const _doAttackTuto = doAttack; doAttack = function(){ if (tuto.on && gameState === 'play') tuto.atq++; _doAttackTuto(); };
const _doRollTuto = doRoll; doRoll = function(){ if (tuto.on && gameState === 'play') tuto.rod++; _doRollTuto(); };
const _doJumpTuto = doJump; doJump = function(){ if (tuto.on && gameState === 'play') tuto.sal++; _doJumpTuto(); };
const _doSpecialTuto = doSpecial; doSpecial = function(){ const m0 = player.meter; _doSpecialTuto(); if (tuto.on && player.meter < m0) tuto.esp++; };
const _killEnemyTuto = killEnemy; killEnemy = function(e){ const was = e.alive; _killEnemyTuto(e); if (tuto.on && was && !e.alive) tuto.bajas++; };
const _chooseUpgradeTuto = chooseUpgrade; chooseUpgrade = function(i){ _chooseUpgradeTuto(i); if (tuto.on) tuto.carta = true; };
const _comedy10Tuto = comedy10; comedy10 = function(q){ return tuto.on ? false : _comedy10Tuto(q); };   // sin chistes mientras explica
const _startWaveTuto = startWave;
startWave = function(n){
  if (tuto.on && n !== 1) tutoFin();
  _startWaveTuto(n);
  if (n === 1 && tutoToca() && !special) tutoEmpieza();
};
const _startRunTuto = startRun; startRun = function(){ if (tuto.on){ tuto.on = false; tutoEl.hidden = true; } _startRunTuto(); };
const _toTitleTuto = toTitle; toTitle = function(){ if (tuto.on){ tuto.on = false; tutoEl.hidden = true; document.querySelectorAll('.tutoOjo').forEach(el => el.classList.remove('tutoOjo')); } _toTitleTuto(); };

function tutoTick(dt){
  if (!tuto.on) return;
  const P = TUTO_PASOS[tuto.i]; if (!P) return;
  tutoEl.hidden = !(gameState === 'play' || gameState === 'upgrade');
  if (gameState !== 'play' && gameState !== 'upgrade') return;
  tuto.t += dt;
  tuto.dist += Math.hypot(hero.position.x - tuto.px, hero.position.z - tuto.pz); tuto.px = hero.position.x; tuto.pz = hero.position.z;
  tuto.giro += Math.abs(camYaw - tuto.yaw); tuto.yaw = camYaw;
  if (!TUTO_PASOS.slice(0, tuto.i + 1).some(p => p.suelta) && queue.length) spawnTimer = Math.max(spawnTimer, 0.5);   // aún no salen enemigos
  if (player.dead){ tuto.on = false; tutoEl.hidden = true; return; }
  // Entre «pelea» y «resto» la oleada no se puede acabar: si se quedan sin enemigos, salen diablillos de práctica
  const iPelea = TUTO_PASOS.findIndex(p => p.suelta), iResto = TUTO_PASOS.findIndex(p => p.resto);
  // (dos en cola, no uno: main.js cuenta los vivos antes de sacar al siguiente, y si sale el último con nadie vivo da la oleada por cerrada)
  if (gameState === 'play' && tuto.i >= iPelea && tuto.i < iResto){
    while (queue.length < 2){ queue.push('imp'); waveTotal++; tuto.extra++; }
    if (enemies.filter(e => e.alive).length >= 2) spawnTimer = Math.max(spawnTimer, 0.5);
  }
  if (P.entra && tuto.i === iResto - 1 && player.meter < 100 && tuto.esp < 1 && state === 'normal') player.meter = 100;   // el ímpetu sigue lleno hasta que suelte el especial
  if (gameState === 'upgrade' && tuto.i < TUTO_PASOS.length - 1){ tutoPaso(TUTO_PASOS.length - 1); return; }   // por si acaso: si la oleada se cerrase antes, a las cartas
  if (tuto.okT > 0){ if ((tuto.okT -= dt) <= 0) tutoPaso(tuto.i + 1); return; }
  if (P.hecho()){ tuto.okT = 0.7; tutoEl.classList.add('ok'); play('pickup'); }
}
const _v3UpdateTuto = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateTuto(dt, pdt, playing); try { tutoTick(dt); } catch (err) { console.error(err); } };

/* ---------- Opción para repetirlo ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const o = { label: 'Tutorial', get: () => tutoToca() ? 'En la próxima partida' : 'Repetir', act: () => tutoGuarda(tutoToca() ? '1' : '0') };
  options.splice(2, 0, o);   // tras «HUD»
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>Tutorial</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); const l = document.getElementById('menuList'); l.insertBefore(li, l.children[2] || null);
});
