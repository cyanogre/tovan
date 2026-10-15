'use strict';
/* ---------- Estado global ---------- */
let gameState = 'title';                  // title | play | upgrade | paused | over
let wave = 0, queue = [], spawnTimer = 0, kills = 0, runTime = 0, clearT = -1, taken = {};
let time = 0, hitStop = 0, shake = 0, slowT = 0, flashA = 0, flashColor = '#ff2a2a', bannerT = 0, deadT = 0;
const player = { hp: 150, maxHp: 150, meter: 0, inv: 0, kx: 0, kz: 0, dead: false };
const UP0 = () => ({ dmg: 1, crit: 0.1, lifesteal: 0, speed: 1, spin: false, slamBoost: 0, fireRoll: 0,
                     reflect: false, perfect: false, orbs: 0, armor: 0, meterRate: 1, quake: 0 });
let up = UP0();
let best = 0; try { best = +localStorage.getItem('tovan-best') || 0; } catch (e) {}

let state = 'normal', seqI = 0, curMove = null, stepT = 0, queued = false, hitDone = false, attackW = 0;
let vy = 0, grounded = true, landT = 0, airW = 0, rollT = 0, rollDir = 0, comboT = 0, comboNext = 0;
let inputMag = 0, inputHeading = 0, heading = 0, phase = 0, walkW = 0, runW = 0, fireDropT = 0, fireTick = 0;
let waveT = 0, waveW = 0, blinkT = 2, blinkDur = 0;
const enemies = [], projectiles = [], eRings = [], pickups = [], flames = [], orbs = [];

let dmgWave = false, noDmgStreak = 0, idleT = 0;
