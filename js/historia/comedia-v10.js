'use strict';
/* ---------- Comedia ---------- */
const WAVE_Q10 = ['Oleada nueva. Mismos demonios, distinto peinado.', 'Según el GPS, el cliente vive justo detrás de esa horda. Qué casualidad.',
  'Recuerda: el paquete es frágil. Tú no tanto.', 'He pedido refuerzos. Me han dicho que eres tú.', 'Si te consuela, ellos tampoco tienen seguro médico.',
  'Otra oleada. Es como el turno de noche, pero con cuernos.', 'Dato curioso: ningún repartidor ha sobrevivido a esto. Dato más curioso: tú sigues aquí.',
  'Huele a demonio mojado. Será la humedad de las ruinas.', 'Hoy toca pierna. Y brazo. Y esquivar.', 'Dicen que si sobrevives a esta te suben el sueldo. Es mentira, pero motiva.',
  'Esa cosa de ahí me ha mirado mal. Pégale primero a esa.', 'Firmar aquí, aquí y aquí. Con el bastón, a ser posible.', 'Lo bueno de las ruinas es que ya no se pueden romper más. Bueno, sí.',
  'Recuerda: en el aire y rodando no te tocan. En la nómina, sí.', 'Tengo un buen presentimiento. Es mentira, soy una linterna, no tengo presentimientos.',
  'Si alguien pregunta, yo no estaba aquí. Solo ilumino.', '¿Por qué siempre vienen en grupo? ¿No saben ir solos al baño tampoco?'];
const DEATH_Q10 = ['¡Dile a mi madre que…!', '¡Pido el libro de reclamaciones!', 'Era mi último día antes de las vacaciones…', '¡Me piro, vampiro!', 'Una estrella. Pésimo servicio.',
  '¡Esto lo cubre el seguro!', '¿Hay devolución?', 'Ni siquiera me han firmado…', '¡Volveré! (en la siguiente oleada)', 'Me hago el muerto. Ah, no, que es de verdad.',
  '¡Mi cuerno! ¡Era de alquiler!', 'Adiós, mundo cruel y bien iluminado.', 'Dejad mi wifi a mi primo.', 'Lo vi venir. No lo esquivé.', '¡Spoiler: muero!', 'Pues vaya.', '¡Mamá, sin manos!'];
const SPAWN_Q10 = ['¡Ese es el del paquete!', '¡A por él, que va solo!', 'Vengo a por mi pedido', '¿Esto es la cola del paro?', '¡Nadie reparte en mi ruina!', '¡Llego tarde, perdón, perdón!',
  'Vengo de parte de mi primo', '¡Que no se escape sin firmar!', 'Huele a repartidor…'];
const DUP_Q10 = ['¿Otra vez {n}? Vale. Esto ya es adicción.', '{n} ×{k}. Se acumula. Como la ropa en la silla.', '¿Más {n}? Me gusta tu estilo: monotemático.',
  'Nivel {k} de {n}. Tu madre estaría orgullosa. O preocupada.', '{n} otra vez. Lo apunto en tu historial.', '{n} ×{k}. Ya no es una mejora, es una personalidad.'];
const LOW_Q10 = ['Te queda poca vida. Sugerencia: no recibas más golpes.', 'Tienes la vida en rojo. A juego con tus decisiones.', 'Si mueres, ¿me quedo con tus fragmentos? Pregunto por nada.',
  '¡Cúrate! O muere con estilo, pero decide ya.', 'Esa barra roja no es decoración.'];
const IDLE_Q10 = ['¿Hola? Los demonios no se van a pegar solos.', 'Si te quedas quieto te confunden con una estatua. No funciona, ya lo he probado.', 'Me aburro. Y yo soy una linterna: me aburro con poco.'];
const BOSS_Q10 = { boss: 'Guardián: «Esta ruina es propiedad privada». Tú: «Traigo un paquete». Guardián: «…». Ya, no ha colado.',
  dragon: '¿Un dragón? ¿Con crías? Esto no venía en la descripción del puesto.', skeleton: 'Ese esqueleto es tan grande que tiene su propio código postal. Cuando aúlle, salta.',
  teapot: 'Una tetera gigante. No preguntes. Yo tampoco lo entiendo.', error: 'ERROR 404: valentía no encontrada. Ah, no, que eres tú. Sigue.',
  sixeyes: 'Seis ojos y ninguno mira por dónde va.', star: 'Ha llegado Míster Confianza. Y su ego. Ocupan dos asientos.',
  finalcat: 'Es un gato. Un gato enorme. Y está enfadado. Regla número uno: nunca acaricies a un jefe final.' };
const EPI10 = ['Aquí yace Tovan. Entregó todo menos el paquete.', 'Murió como vivió: esquivando tarde.', 'Repartidor del mes, a título póstumo.', 'Su último mensaje: «Estoy llegando».',
  'Cliente ausente. Repartidor, también.', 'Valoración del servicio: ★☆☆☆☆', 'No era su día. Ni su oleada.', 'Dejó el paquete en conserjería. La conserjería era el más allá.',
  'Se fue como llegó: sin firmar.'];
TIPS.push('Saltar te hace invulnerable. A los impuestos, no.', 'Si coges la misma carta varias veces, se acumula. Como mis horas extra.',
  'Con tres poderes de la misma familia desbloqueas su bonus y su especial de rama. Se lanza con tu especial.', 'El Guardián siempre ataca en el mismo orden: embiste, salta, columnas… Apúntatelo en la mano.',
  'Las ondas se saltan. No se negocian.', 'Rodar es gratis. Morir sale caro.', 'La Linterna vampírica ahora cura mucho más. No preguntes de dónde saca la sangre.',
  'Si un esqueleto aúlla, salta. Si aúlla tres veces, salta tres veces.', 'El dragón tiene crías. Mal momento para hablar de conciliación.');
function comedy10(q){ if (time - P10.comT < 14 || barkT > 0) return false; P10.comT = time; bark(q); return true; }
const _startWave10 = startWave;
startWave = function(n){ _startWave10(n); P10.idleT = 0; if (rnd() < 0.55) later(2.6, () => { if (gameState === 'play' && !(bossE && bossE.alive)) comedy10(pick10(WAVE_Q10)); }); };
const _killEnemy10 = killEnemy;
killEnemy = function(e){ const was = e.alive; _killEnemy10(e);
  if (was && !e.isBoss && rnd() < 0.07 && time - P10.deathT > 2.5 && !MG.active){ P10.deathT = time; tA.set(e.g.position.x, (e.numY || 2) + 0.6, e.g.position.z); spawnNumber(tA, pick10(DEATH_Q10), 'react', '#ffe9b0'); } };
const _chooseUpgrade10 = chooseUpgrade;
chooseUpgrade = function(i){ const u = offer[i]; _chooseUpgrade10(i);
  if (u && !u.minor && (taken[u.id] || 0) > 1) later(0.4, () => comedy10(pick10(DUP_Q10).replace(/\{n\}/g, u.name).replace(/\{k\}/g, taken[u.id]))); };
const _showOver10 = showOver;
showOver = function(){ _showOver10(); const el = document.getElementById('overTip'); if (el) el.innerHTML += `<br><span style="color:#ffd970">Epitafio: «${pick10(EPI10)}»</span>`; };
function comedyTick10(pdt){
  if (gameState !== 'play' || player.dead || invActive || MG.active) return;
  if (player.hp < player.maxHp * 0.25 && P10.lowW !== wave){ if (comedy10(pick10(LOW_Q10))) P10.lowW = wave; }
  const moved = Math.hypot(hero.position.x - P10.lastPos[0], hero.position.z - P10.lastPos[1]) > 0.05; P10.lastPos = [hero.position.x, hero.position.z];
  if (moved || state !== 'normal' || !enemies.some(e => e.alive)) P10.idleT = 0; else { P10.idleT += pdt; if (P10.idleT > 12){ P10.idleT = -30; comedy10(pick10(IDLE_Q10)); } }
}

/* ---------- Bucle ---------- */
const _startRun10 = startRun;
startRun = function(){ P10.force.length = 0; P10.lowW = -1; P10.comT = 0; _startRun10(); };
const _v3Update10 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update10(dt, pdt, playing);
  try { rb10(playing ? pdt : 0); if (playing) comedyTick10(pdt); } catch (err) { console.error(err); } };
