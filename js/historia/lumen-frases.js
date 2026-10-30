'use strict';
/* ===== Lumen no se repite: explica una vez y luego varía según el momento =====
   barkOnce era «una vez por partida» (barkSaid se vacía en startRun) y, con el campamento, se revive a menudo: en cada
   partida se oía lo mismo (el paquete, los puestos, los capitanes, los mapas grandes, cada enemigo nuevo…).
   - Lo que ya ha dicho de verdad se apunta en meta.dichos y no lo vuelve a explicar. Solo se apunta si el globo ha
     salido (bark se salta el comentario si aún se ve otro): si no, lo intentará la próxima vez. lumenTip(clave, texto)
     hace lo mismo con los consejos sueltos (las peleas de los colosos, el campamento…). Se repiten siempre las frases de
     la pelea final con el Gato (DICHO_SIEMPRE). Al borrar los datos se vuelve a oír todo.
   - Donde antes repetía la explicación, ahora suelta (no siempre) una frase corta al azar del tema de ese momento
     (LUMEN_TEMAS, lumenComenta). lumenElige no repite las dos últimas de cada tema, ni entre partidas (meta.lumUlt).
     Los jefes, al aparecer, dicen una de varias (BOSS_Q10 pasa a tener un «getter» por jefe).
   Las frases nuevas están en assets/fuentes/voces/lumen.json con su prompt: hasta que se generen sus mp3, Lumen las
   dice con el «bla bla». */
const DICHO_SIEMPRE = new Set(['cat2', 'cat3']);
const dichoYa = k => !!(meta.dichos && meta.dichos[k]);
const lumenSalio = t => !barkEl.hidden && typeof t === 'string' && barkText.textContent === vozTx(t);
function lumenLee(t){ if (lumenSalio(t)) barkT = Math.max(barkT, 1.6 + t.length * 0.04); }   // las largas se quedan lo que se tarda en leerlas
function dichoApunta(k, text){ if (!lumenSalio(text)) return false; (meta.dichos || (meta.dichos = {}))[k] = 1; saveMeta(); return true; }
function lumenTip(k, text){ if (dichoYa(k)) return false; barkT = 0; bark(text); lumenLee(text); return dichoApunta(k, text); }

/* ---------- Frases por tema ---------- */
const LUMEN_TEMAS = {
  campRevive: ['Otra vez de una pieza. Casi todas las piezas, al menos.', 'Recomponerte cuesta fragmentos. Te lo apunto en la cuenta.',
    'Has vuelto. Te faltaba un tornillo, pero eso ya venía de fábrica.', 'Arriba, repartidor. Los paquetes no se entregan solos.',
    'Esta vez te he puesto la cabeza al derecho. La última vez tardé un rato.', '¿Qué tal el más allá? ¿Firmaban allí? Ya me lo imaginaba.',
    'Respira. Bueno, haz como que respiras: queda más natural.'],
  campLlega: ['De vuelta al campamento. Los monstruos no se van a ir a ningún sitio.', 'Hogar, dulce ruina.',
    'Si vas a cambiarte de sombrero, el armario no muerde. El arco, a veces.', 'El fuego sigue encendido. Yo también. Qué casualidad.'],
  capitulo0: ['Las ruinas de siempre. Huele a piedra vieja y a monstruo nuevo.', 'Parada uno. Me sé este camino de memoria. Y tú, de muerte.',
    'Otra vez aquí. Si los monstruos cobraran por visita, serían ricos.'],
  capitulo1: ['Cerezos otra vez. Qué bonito todo, hasta que te muerde.', 'El Santuario. Que los oni no te vean de buen humor, que les molesta.',
    'Pétalos por todas partes. Luego no me pidas que te los quite del pelo.'],
  capitulo2: ['La Cumbre. Abrígate. Ah, no, que no tienes abrigo.', 'Nieve, frío y huesos. El menú completo.', 'Aquí arriba se resbala. Y no es una metáfora.'],
  capitulo3: ['Canal X. Sonríe, que te están grabando.', 'Vuelta a la tele. Si te preguntan por la audiencia, di que bien.',
    'Míster Confianza sigue en antena. Él nunca se cansa de sí mismo.'],
  capitulo4: ['La playa del mundo real. Cuidado con la arena: se ve demasiado bien.', 'Sol, olas y algo que hierve. Vacaciones de repartidor.',
    'Aquí todo brilla mucho. Yo también, pero yo lo hago gratis.'],
  capitulo5: ['Las ruinas rotas. Si algo parpadea, no lo mires mucho rato.', 'Aquí todo falla. Bueno, como en mi primer día.', 'Último tramo antes de la azotea. Ya casi huele a firma.'],
  paquete: ['Otro paquete. Ya sabes: que no salga del círculo.', 'Paquete a la vista. Y ladrones a la vista. Lo de siempre.',
    'Cuida ese paquete como si fuera yo. Bueno, mejor que a mí.', 'Un paquete. Si se lo llevan, lloro. Y brillo menos.'],
  horda: ['¡Horda! Defiende el paquete y habrá premio brillante.', 'Ahí vienen todos a por el paquete. Ni que regalaran algo.', 'Otra horda de ladrones. Esto ya es acoso.'],
  robo: ['¡Que se lo llevan!', '¡Ese ladrón tiene tu paquete! ¡A por él!', '¡Ladrón! ¡Paquete! ¡Corre!', 'Eh, eso no es tuyo. Ni mío. Pero menos tuyo.'],
  puestos: ['Más puestos corruptos. Rómpelos y se acaba el grifo.', 'Puestos otra vez. Mientras sigan en pie, esto no se acaba.',
    'Esos puestos no se van a romper solos. Créeme, lo he intentado.'],
  capitan: ['Un capitán. Míralo bien antes de pegar: cada pieza se rompe desde un lado.', 'Capitán a la vista. Rómpele las piezas y se le baja el ego.',
    'Ese viene con armadura. Busca por dónde se rompe.'],
  pieza: ['¡Crac! Una pieza menos.', '¡Eso se ha roto! Mira cómo cambia.', 'Pieza fuera. Ahora pelea distinto: atento.'],
  capfuga: ['¡Se va a escapar con el botín!', '¡Que se larga! ¡Túmbalo ya!', 'Ese capitán tiene prisa. Tú, más.'],
  escudo: ['Escudo arriba. Pégale hasta que cruja.', 'Otra burbuja. Rómpela y luego, todo lo que tengas.'],
  escRoto: ['¡Escudo roto! ¡Ahora, ahora!', '¡Ya no le protege nada! ¡Dale!', '¡Cristal roto! Eso da buena suerte. A ti.'],
  frenzy: ['¡Se ha enfadado! Y cuando se enfadan, corren.', '¡Modo furia! Esquiva primero, pega después.', 'Rojo y rápido. Mala combinación. Para ti.'],
  jefeMitad: ['¡A la mitad! Ahora se pone serio.', '¡Le queda la mitad! Y a ti… mejor no miro.', '¡Ya flaquea! Sigue así.'],
  trozo: ['¡Trozo recuperado! Otra vez. Este sello se rompe más que mi paciencia.', 'Ya lo tenemos. Lo apunto en el albarán.',
    'Otro trozo en la saca. Esto empieza a parecer una colección.', 'Recuperado. Y sin firma, como siempre.'],
  combo: ['¡Así se reparte!', '¡Qué ritmo! ¿Seguro que eres repartidor?', '¡Combo! Si esto fuera un trabajo, te subían el sueldo.']
};
// otras frases para cuando sale cada jefe (la de siempre sigue entre ellas)
const LUMEN_JEFES = {
  boss: ['El Guardián otra vez. Mil años de guardia y ni un día libre.', 'Ese portero de piedra no se cansa. Tú tampoco, ¿verdad?'],
  dragon: ['Ryūjin. Si escupe fuego, no te pongas delante. Lo digo por experiencia ajena.', 'El dragón de jade. Precioso, enorme y con muy mal genio.'],
  skeleton: ['Gashadokuro. Cuando aúlle, salta. Cuando no aúlle, también.', 'Un montón de huesos con muchas ganas de abrazarte. Mejor no.'],
  star: ['Míster Confianza. Sonríe a cámara mientras le pegas.', 'Ya está aquí el número uno. Del ranking, y del ego.'],
  teapot: ['La tetera. Hierve, silba y pega. Como mi tía.', 'Cuidado, que quema. Siempre quema.'],
  error: ['El ERROR otra vez. Si se reinicia él, tú no.', 'Ese ERROR no se arregla apagando y encendiendo. Lo he probado.'],
  sixeyes: ['Seis ojos para vigilarte. Tú con dos te apañas.', 'El de los seis ojos. Muévete, que te ve venir.'],
  finalcat: ['El gato. Ni se te ocurra rascarle la barriga.', 'Miau no es una respuesta, gato.']
};
// la clave del comentario que se explicaba → el tema de lo que dice después
const DICHO_TEMA = { obj_paquete: 'paquete', obj_horda: 'horda', obj_robo: 'robo', obj_puestos: 'puestos', obj_puestos2: 'puestos', obj_capfuga: 'capfuga',
  escudo: 'escudo', escRoto: 'escRoto', frenzy: 'frenzy', combo: 'combo' };
const LUMEN_PROB = { robo: 1, capfuga: 1, escRoto: 0.8, combo: 0.5, pieza: 0.6, jefeMitad: 0.7 };
function lumenTema(k){
  if (DICHO_TEMA[k]) return DICHO_TEMA[k];
  if (k.startsWith('half_') || k.startsWith('phase2_')) return 'jefeMitad';
  if (k.startsWith('cap_')){ const id = k.slice(4); if (CAP_DEF[id]) return 'capitan'; if (Object.values(CAP_DEF).some(d => d.parts && d.parts.some(p => p.id === id))) return 'pieza'; }
  return null;
}
// una del tema, sin repetir las dos últimas (tampoco entre partidas)
function lumenElige(tema, L){
  const U = meta.lumUlt || (meta.lumUlt = {}), ult = U[tema] || [];
  let ops = L.map((_, i) => i).filter(i => !ult.includes(i)); if (!ops.length) ops = L.map((_, i) => i);
  const i = ops[Math.floor(rnd() * ops.length)]; U[tema] = [i, ...ult].slice(0, Math.min(2, L.length - 1)); saveMeta(); return L[i];
}
function lumenComenta(tema, prob){
  const L = LUMEN_TEMAS[tema]; if (!L || barkT > 0.6 || rnd() > (prob != null ? prob : LUMEN_PROB[tema] != null ? LUMEN_PROB[tema] : 0.75)) return false;
  const t = lumenElige(tema, L); bark(t); lumenLee(t); return lumenSalio(t);
}
for (const [t, extra] of Object.entries(LUMEN_JEFES)){ if (!BOSS_Q10[t]) continue; const L = [BOSS_Q10[t], ...extra], c = { t: -9, v: '' };   // (se lee dos veces seguidas: misma frase)
  Object.defineProperty(BOSS_Q10, t, { get: () => { if (time - c.t > 0.5){ c.t = time; c.v = lumenElige('jefe_' + t, L); } return c.v; }, enumerable: true, configurable: true }); }

/* ---------- Envoltorios ---------- */
const _barkOnceDicho = barkOnce;
barkOnce = function(key, text){
  if (typeof key !== 'string' || DICHO_SIEMPRE.has(key)) return _barkOnceDicho(key, text);
  if (dichoYa(key)){ if (barkSaid[key]) return; barkSaid[key] = true; const t = lumenTema(key); if (t) lumenComenta(t); return; }
  const r = _barkOnceDicho(key, text); lumenLee(typeof text === 'string' ? text : ''); dichoApunta(key, text); return r;
};
// (pendingBark fuerza el comentario aunque ya se hubiera dicho en la partida: si ya se dijo alguna vez, va una frase del tema)
const _pendingBarkDicho = pendingBark;
pendingBark = function(t, k, txt){ if (!dichoYa(k)) return _pendingBarkDicho(t, k, txt); const tema = lumenTema(k); if (tema) later(t, () => { if (gameState === 'play') lumenComenta(tema, 0.85); }); };
