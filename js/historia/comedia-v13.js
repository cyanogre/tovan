'use strict';
/* =====================================================================
   v13 · comedia: menos chiste fácil, más ironía seca
   ===================================================================== */
const TX13 = {
  // Lumen (comentarios en partida)
  '¡Vas justo de vida! Bebe algo. ¿No tienes? Pues esquiva.': 'Te queda poca vida. Te recomiendo, con todo el cariño, no recibir más golpes.',
  'Te dije que cobro en fragmentos. Esta va a tu cuenta.': 'Resurrección completada. Te la descuento de los fragmentos, como acordamos verbalmente.',
  'Ese brilla. Los que brillan pegan más. Lo digo por experiencia.': 'Ese brilla. Los que brillan pegan más fuerte. Hablo desde la experiencia.',
  '¡Un oni! Recuerda: ni una palabra sobre lo azul.': 'Un oni. Lo del color, ni mencionarlo. Es un tema familiar.',
  '¡Le duele! ¡Creo! Es difícil leer caras de dragón.': 'Creo que le duele. Es difícil leer la cara de un dragón: casi toda es dientes.',
  '¡Ya flaquea! Y apártate cuando salte, que no es un abrazo.': 'Ya flaquea. Cuando salte, apártate: no viene a abrazarte.',
  '¡Se ha puesto rojo! ¡Cuidado, ahora va más rápido!': 'Se ha puesto rojo. En un jefe, eso nunca significa vergüenza.',
  'No pillo las referencias. Soy una linterna. Pero suena fuerte.': 'No entiendo la referencia, pero intuyo que alguien va a reclamar derechos de autor.',
  'Uy, eso brilla más que yo. No me gusta. Me encanta.': 'Eso brilla más que yo. Profesionalmente me ofende. Personalmente, me encanta.',
  '¡Eso ha sido química! O magia. O química mágica.': 'Eso ha sido una reacción. Mezclar elementos: el único consejo de laboratorio que te voy a dar.',
  '¡Eso! ¡Así se reparte, repartidor!': 'Buen ritmo. Si esto fuera una ruta, ya ibas por la mitad.',
  '¡Imparable! Te subo la propina.': 'Cien seguidos. Si fuera tu jefa, te subiría el sueldo. Por suerte para la empresa, no lo soy.',
  '¿Por qué disparo bolas de luz? ¡Yo no sé hacer esto! …Ah, sí sé.': '¿Ahora disparo luz? Trescientos años en una caja y resulta que tenía talento.',
  'Todo es verde. Me siento como un pepinillo.': 'Cuatro tonos de verde. Así veía el mundo media generación, y salió razonablemente bien.',
  '¿Dónde han ido los colores? ¿Me he quedado sin tinta?': 'Blanco y negro. Alguien ha decidido que esto ahora es cine de autor.',
  '¡Solo ha gastado una vida! ¡Le quedan ocho!': 'Una vida menos. Le quedan ocho. Los gatos siempre negocian desde arriba.',
  '¡Es su última vida! ¡Aguanta, Tovan!': 'Última vida. Esta vez va en serio. Creo.',
  '¿Nos han metido en OTRO videojuego? ¡Dispara, que el sueldo no te lo paga nadie!': 'Un videojuego dentro del videojuego. Dispara y no le des muchas vueltas.',
  '¿Vamos? Que el albarán no se firma solo.': '¿Seguimos? El albarán no se va a firmar solo.',
  '¿Ahora también disparo? Esto no estaba en mi contrato.': '¿Ahora también disparo? Esto no estaba en mi contrato. Tampoco tengo contrato.',
  'Ya no me queda nada en el almacén. Toma, un uno por ciento. Ni las gracias.': 'Se ha vaciado el almacén. Te queda el uno por ciento. Literalmente.',
  '¡Está sacando ataques nuevos! ¡Al 50 % se ponen serios!': 'Ataques nuevos. A mitad de vida, todos los jefes descubren que tenían un plan B.',
  '¿Hasta en los marcianitos sale este? Pues dale, que aquí también se le puede pegar.': 'Se ha colado en los marcianitos. Es lo que tiene la fama: sales hasta en la sopa.',
  'No hay tiempo para oleadas: el ERROR va a ir soltando procesos mientras peleamos. ¡Ciérralo!': 'Sin oleadas: el ERROR irá abriendo procesos mientras peleamos. Ciérralo antes de que pida reiniciar.',
  '¡Cada golpe al suelo suelta una onda! Salta justo cuando te llegue: te aviso con un «¡SALTA!».': 'Cada golpe al suelo suelta una onda. Salta cuando te llegue. Yo aviso con un «¡SALTA!», que para algo soy la luz.',
  'Truco: mientras estás en el aire o rodando, nada te toca. Física de dibujos animados, la mejor física.': 'En el aire o rodando no te toca nada. No es física: es diseño de videojuegos.',
  '¿Ya está? ¿Se ha ido? … No. Viene del cielo. Claro que viene del cielo.': '¿Se ha ido? No. Viene del cielo. Claro que viene del cielo: es influencer.',
  // Míster Confianza, segunda fase
  '¡Volando voy, volando vengo!': '¡Contenido aéreo exclusivo!',
  '¡Mira, mamá, sin cables!': 'Esta toma la monetizo.',
  'Uf… uf… ¿esto sale en la tele?': 'Uf… ¿Esto va en directo?',
  '¡Tiempo muerto! ¡Que alguien me traiga agua!': 'Tiempo muerto. Que alguien me traiga agua con gas.',
  'Ay, la espalda… ¡Que no me graben!': 'Mi entrenador personal va a oír hablar de esto.',
  '¡Toma mi premio al mejor héroe! (devuélvemelo)': '¡Toma mi premio al mejor héroe! (lo quiero de vuelta)',
  '¡DADME LIKES! ¡LIKES! ¡LIKES!': '¡LIKES! ¡COMPARTID! ¡ENGAGEMENT!',
  '¡SONRÍE! ¡Selfie panorámico! 📸': '¡Sonríe! Selfie panorámico 📸',
  // Tovan
  '¡Y ni despeinado!': 'Ni un rasguño.',
  // cinemática de la introducción y finales
  '¿Salvar el mundo? ¡¿Y mi uniforme?! ¡Me lo van a descontar del sueldo!': '¿Salvar el mundo? ¿Y mi uniforme? Me lo van a descontar de la nómina.',
  'Al sacarme de la caja has roto el sello. Los monstruos van a salir. En oleadas. Muchas oleadas.': 'Al sacarme de la caja has roto el sello. Los monstruos van a salir. En oleadas. No es una metáfora.',
  '¡OLVIDA EL ALBARÁN! Agarra el bastón y pega a todo lo que tenga dientes.': 'Olvida el albarán. Coge el bastón y golpea todo lo que tenga más dientes que tú.',
  'Que conste que esto no entra en mi horario.': 'Que conste que esto no entra en mi horario. Lo apunto como horas extra.',
  'Si caes, te traeré de vuelta con fragmentos de monstruo. Cobro en fragmentos, claro.': 'Si caes, te recompondré con fragmentos de monstruo. No preguntes cómo. Y sí, te los cobro.',
  '…«el Guardián de las Ruinas». Vaya nombre para un anticuario.': '…«el Guardián de las Ruinas». Un nombre muy ambicioso para un anticuario.',
  'Qué dramático. Seguro que es una lámpara de mesita.': 'Qué dramático. Será una lámpara de mesita con complejo de reliquia.',
  'Tranquilo. Estás entre dos mundos. Y no puedes salvar uno vestido así.': 'Tranquilo. Estás entre dos mundos. Y ninguno de los dos se salva con ese chaleco.',
  'Es que me atropelló un camión y acabé en otro mundo! ¡Y luego en otro! ¡Y el paquete era un gato!': 'Me atropelló un camión y acabé en otro mundo. Y luego en otro. Y el destinatario era un gato.',
  '¡Es que me atropelló un camión y acabé en otro mundo! ¡Y luego en otro! ¡Y el paquete era un gato!': 'Me atropelló un camión y acabé en otro mundo. Y luego en otro. Y el destinatario era un gato.',
  'Soy una linterna sagrada. Guardiana del sello. Y ahora soy… una lámpara de mesita.': 'Trescientos años de guardiana del sello. Y ahora soy una lámpara de mesita.',
  'Das una luz muy bonita para leer.': 'Das una luz estupenda para leer.',
  'Esto es humillante.': 'Esto es humillante. Y cálido. Humillantemente cálido.'
};
const tx13 = s => (typeof s === 'string' && TX13[s]) || s;
const _bark13 = bark; bark = function(text){ return _bark13(tx13(text)); };
const _starShout13 = starShout; starShout = function(e, t){ return _starShout13(e, tx13(t)); };
const _shoutHero13 = shoutHero7; shoutHero7 = function(t, c, dy){ return _shoutHero13(tx13(t), c, dy); };
const _say13 = say; say = function(lines, done, keep){ return _say13(Array.isArray(lines) ? lines.map(l => { const n = l.slice(); n[1] = tx13(n[1]); return n; }) : lines, done, keep); };
const swap13 = (arr, list) => { arr.length = 0; arr.push(...list); };

/* ---------- Historia ---------- */
Object.assign(STORY, {
  intro: [
    ['narr', 'Hace siglos, una linterna selló a los monstruos bajo las Ruinas del Ocaso.'],
    ['narr', 'Esta noche, un repartidor la ha encendido para ver dónde pisaba. Así empiezan casi todos los apocalipsis: con buena intención.'],
    ['tovan', 'Buenas noches. Traigo un paquete para el «Guardián de las Ruinas». Necesito una firma.'],
    ['lumen', 'Trescientos años sellando el mal y lo primero que oigo al despertar es «necesito una firma».'],
    ['tovan', 'La linterna habla. Vale. Esto no venía en la formación.', 'happy'],
    ['lumen', 'Soy Lumen, guardiana del sello. El sello que acabas de romper, para que conste en acta.'],
    ['lumen', 'Los monstruos van a salir. En oleadas. No es una metáfora.'],
    ['tovan', '¿Y el destinatario?'],
    ['lumen', 'Olvida el paquete. Coge el bastón y golpea todo lo que tenga más dientes que tú.'],
    ['tovan', 'Esto no entra en mi horario. Lo apunto como horas extra.', 'happy'],
    ['lumen', 'Si caes, te recompondré con fragmentos de monstruo. No preguntes cómo. Y sí, te los cobro.']
  ],
  boss_boss: [
    ['lumen', 'El Guardián de las Ruinas. Mil años vigilando una puerta que nadie quería abrir.'],
    ['tovan', 'El destinatario. Por fin.', 'happy'],
    ['lumen', 'No va a firmar. Cuando golpee el suelo, salta la onda. Cuando salte él, quítate de debajo. Es todo lo que tienes que aprender hoy.']
  ],
  win_boss: [['tovan', 'Disculpe… ¿me firma aquí?'], ['lumen', 'Es grava, Tovan. Lo has convertido en grava.'], ['tovan', 'Lo marco como «destinatario ausente».']],
  boss_dragon: [
    ['tovan', '¿Eso es un dragón o el cable de un ascensor muy largo?'],
    ['lumen', 'Ryūjin, el dragón de jade. Fuego, picados y lluvia de brasas. Viene con crías, así que también trae prisa.'],
    ['tovan', '¿Algún consejo profesional?'],
    ['lumen', 'Si el suelo se pone rojo, no estés encima. Cuando baje, pégale. El resto es fe.']
  ],
  win_dragon: [['tovan', 'Lo hemos derrotado.', 'happy'], ['lumen', 'Tú has pegado. Yo he iluminado la escena. Los créditos, a medias.'], ['tovan', '¿Crees que tenía buzón?']],
  biome_1: [
    ['lumen', 'El sello roto nos ha arrastrado al Santuario de los Cerezos.'],
    ['tovan', 'Precioso. ¿Algún vecino que firme paquetes?', 'happy'],
    ['lumen', 'Oni. Ogros de tres metros, con mazas. Azules.'],
    ['tovan', '¿Azules de frío?'],
    ['lumen', 'De nacimiento. Y es un tema delicado. Yo no lo sacaría en la conversación.']
  ],
  biome_2: [['tovan', 'Qué frío. ¿Y mi abrigo?'], ['lumen', 'En el paquete, supongo. Ese que sigues sin entregar.'], ['tovan', 'Lo entregaré cuando encuentre a alguien que no intente comerme. El listón está alto.']],
  loop: [['lumen', '¿Otra vez las ruinas? El sello está peor de lo que pensaba.'], ['tovan', 'Míralo por el lado bueno: me sé la ruta.', 'happy']],
  biome_3: [
    ['tovan', '¿Lumen? ¿Esto es… una playa? ¿Una playa de verdad?'],
    ['lumen', 'Es el mundo real. El de la gente que te juega.'],
    ['tovan', 'Se ve la arena grano a grano. Y en el fondo del agua bailan luces.', 'happy'],
    ['lumen', 'Cáusticas. La luz del sol atravesando las olas. Cuestan una fortuna en tarjeta gráfica.'],
    ['tovan', '¿Y por qué yo sigo siendo cuadrado?'],
    ['lumen', 'No entraste en el parche. Presupuesto.'],
    ['tovan', 'Pues la camiseta no me la quito.']
  ],
  biome_4: [['tovan', 'Lumen… ¿por qué el suelo es rosa y negro?'], ['lumen', 'Faltan las texturas. El mundo se está corrompiendo.'], ['tovan', '¿Es grave?'], ['lumen', 'Tu cara sigue cargando. De momento, no.']],
  boss_skeleton: [
    ['tovan', '¿Esa montaña se está moviendo?'],
    ['lumen', 'Gashadokuro. Un esqueleto hecho con los huesos de todos los que se perdieron en la nieve.'],
    ['tovan', '¿Y cómo se le pega a eso?'],
    ['lumen', 'En las manos, cuando las apoye. Salta cuando aúlle o barra el suelo. Y cuando baje la cabeza, sin piedad: él no la tuvo con nadie.']
  ],
  win_skeleton: [['tovan', 'Ahora sí que necesito un vaso de leche.'], ['lumen', 'Por el calcio. Qué fino.']],
  boss_teapot: [
    ['tovan', '¿Eso es una tetera gigante?'],
    ['lumen', 'La Tetera de Utah. Desde 1975, el objeto más renderizado de la historia. Ha venido a lucirse.'],
    ['tovan', '¿Se puede atacar a una tetera?'],
    ['lumen', 'Con cuidado. Está hirviendo, y tiene el ego a la misma temperatura.']
  ],
  win_teapot: [['tovan', 'Te he servido.'], ['lumen', 'Voy a fingir que no has dicho eso. Y voy a fingir muy bien.']],
  boss_error: [['lumen', 'Ahí está la causa de todo: un ERROR. Uno muy grande.'], ['tovan', '¿Probamos a apagarlo y volver a encenderlo?'], ['lumen', 'Pégale. Es lo mismo, pero con más convicción.']],
  win_error: [['tovan', 'Error solucionado.'], ['lumen', 'Se ha cerrado inesperadamente. Como tú cada vez que te pregunto por el paquete.']],
  boss_sixeyes: [['tovan', '¿Por qué tiene seis ojos?'], ['lumen', 'Para verte llegar desde seis sitios a la vez. Cuidado con sus lunas.'], ['tovan', '¿Sus qué?']],
  win_sixeyes: [['lumen', 'El castillo tiembla. Nos está echando.'], ['tovan', '¡Espera, que no he hecho fotos!']],
  isekai1: [
    ['lumen', '¿Estás bien? Te acaba de atropellar un camión.'],
    ['tovan', 'Espera… ¿tatamis? ¿Puertas correderas flotando? ¿Música de biwa?', 'happy'],
    ['tovan', 'Esto es un isekai. Siempre quise estar en un isekai.', 'happy'],
    ['lumen', 'Tovan. Ya estabas en un isekai.'],
    ['tovan', '…Oh.'],
    ['lumen', 'Este castillo no tiene fin. Sobrevive a sus demonios y a su señor, y quizá nos devuelva a casa.']
  ],
  isekai2: [['lumen', '¿Otra vez? Mira a los dos lados antes de cruzar. Es lo único que te pido.'], ['tovan', 'Es que aquí los camiones no frenan.']],
  biome_6: [
    ['tovan', '¿Lumen? ¿Por qué hay un plató de televisión en mitad de la nada?'],
    ['lumen', 'Bienvenido al Canal X. Aquí los héroes se miden por la confianza del público.'],
    ['tovan', '¿Y cuánta confianza da un repartidor?'],
    ['lumen', 'Puesto 9999. Justo detrás de un perro que sabe sumar. Gánate a la audiencia. Y ojo, que aquí cambian de canal sin avisar.'],
    ['tovan', '¿Que cambian el qué?']
  ],
  boss_star: [
    ['star', '¡Tachán! ¡Míster Confianza, número uno del ranking de héroes! ¿Y tú eres…?'],
    ['tovan', 'Tovan. Repartidor.'],
    ['star', '¡Un repartidor! Qué auténtico. Te voy a poner de fondo en mis stories.'],
    ['tovan', 'Mientras me firmes el albarán…']
  ],
  win_star: [['star', '¡Imposible! ¡Mi índice de confianza…!'], ['lumen', 'Enhorabuena, Tovan. Eres el nuevo número uno.'], ['tovan', '¿Eso incluye plus de productividad?']]
});
if (typeof FINAL !== 'undefined') STORY['biome_' + FINAL] = [
  ['tovan', 'Esto es… la azotea del anticuario. Donde empezó todo.'],
  ['lumen', 'El sello nos ha devuelto al mundo real. Aquí vive el Guardián.'],
  ['tovan', 'Por fin. Le doy el paquete, me firma y a casa.'],
  ['lumen', 'Tovan. El paquete era yo. Y me has usado para golpear a medio universo.'],
  ['tovan', '…¿Crees que pondrá una reclamación?']
];

/* ---------- Comentarios sueltos ---------- */
swap13(WAVE_Q10, ['Nueva oleada. Mismos monstruos, distinta motivación.', 'Según el GPS, el destinatario está justo detrás de esa horda. Como siempre.',
  'Recuerda: el paquete es frágil. Tú, en teoría, no.', 'He pedido refuerzos. Me han contestado con tu foto.', 'Si te consuela, ellos tampoco tienen seguro.',
  'Otra oleada. Como el turno de noche, pero con cuernos.', 'Estadísticamente nadie sobrevive a esto. Eres un error estadístico muy persistente.',
  'Huele a monstruo mojado. Será la humedad de las ruinas.', 'Hoy no toca pierna. Toca esquivar.', 'Dicen que si sobrevives a esta te suben el sueldo. Lo dicen ellos, no la empresa.',
  'Ese de ahí te ha mirado mal. No es personal; es su cara.', 'En el aire y rodando no te tocan. En la nómina, sí.',
  'Tengo un buen presentimiento. Mentira: soy una linterna, no tengo presentimientos.', 'Si alguien pregunta, yo solo ilumino.',
  '¿Por qué siempre vienen en grupo? Será cosa del sindicato.', 'La ruta óptima pasa por encima de todos ellos.', 'Vienen en oleadas. Como las facturas.',
  'Te recuerdo que esto cuenta como jornada laboral. No pagada, pero cuenta.']);
swap13(DEATH_Q10, ['Quiero hablar con tu supervisor.', 'Una estrella. Pésimo servicio.', '¿Hay hoja de reclamaciones?', 'Era mi último día antes de vacaciones…',
  'Lo vi venir. No me moví.', 'Me lo apunto para la próxima vida.', 'Esto lo cubre el seguro, ¿no?', 'Ni siquiera me han firmado…', 'Volveré. En la siguiente oleada, concretamente.',
  'Tenía planes.', 'Ha sido un error de comunicación.', 'Pues vaya.', 'Me merecía un final mejor escrito.', 'Debí estudiar oposiciones.', 'Correcto, correcto… incorrecto.']);
swap13(SPAWN_Q10, ['Ese es el del paquete.', 'Vengo a por mi pedido.', '¿Esto es la cola del paro?', 'Nadie reparte en mi ruina.', 'Perdón, perdón, llego tarde.',
  'Me envía mi primo.', 'Que no se vaya sin firmar.', 'Huele a repartidor.', 'Tengo cita a las ocho.', '¿Es aquí la reunión?']);
swap13(DUP_Q10, ['¿Otra vez {n}? Ya no es una mejora, es una línea editorial.', '{n} ×{k}. Se acumula. Como la ropa en la silla.', '{n} otra vez. Monotemático, pero eficaz.',
  'Nivel {k} de {n}. En mi época a esto lo llamábamos especializarse.', '{n} ×{k}. Ya no es una mejora: es una personalidad.', 'Más {n}. Lo dejo anotado en tu expediente.']);
swap13(LOW_Q10, ['Te queda poca vida. Sugerencia: deja de recibir golpes.', 'Tienes la vida en rojo. A juego con tus decisiones recientes.',
  'Si caes, ¿me quedo los fragmentos? Pregunto para un trámite.', 'Cúrate. O cae con estilo, pero decide ya.', 'Esa barra roja no es decorativa.']);
swap13(IDLE_Q10, ['Los monstruos no se van a golpear solos. Lo he comprobado.', 'Quedarte quieto no te hace invisible. Eso solo les funciona a los ninjas.',
  'Me aburro. Y llevo trescientos años en una caja: tengo práctica.']);
Object.assign(BOSS_Q10, {
  boss: 'El Guardián lleva mil años sin visitas. Se nota en la atención al cliente.',
  dragon: '¿Un dragón con crías? Esto no venía en la oferta de empleo.',
  skeleton: 'Ese esqueleto es tan grande que tiene código postal propio. Cuando aúlle, salta.',
  teapot: 'Una tetera gigante. Hay cosas que es mejor no intentar entender.',
  error: 'ERROR 404: jefe no encontrado. Ah, no, ahí está.',
  sixeyes: 'Seis ojos. Y aun así no ve venir lo que le va a pasar.',
  star: 'Ha llegado Míster Confianza. Y su ego. Ocupan dos asientos y piden factura.',
  finalcat: 'Es un gato. Un gato enorme y enfadado. Primera regla del oficio: nunca acaricies a un jefe final.' });
swap13(EPI10, ['Aquí yace Tovan. Entregó todo menos el paquete.', 'Murió como vivió: esquivando un segundo tarde.', 'Repartidor del mes, a título póstumo.',
  'Último mensaje: «Estoy llegando».', 'Cliente ausente. Repartidor, también.', 'Valoración del servicio: ★☆☆☆☆', 'No era su día. Ni su oleada.',
  'Dejó el paquete en conserjería. La conserjería era el más allá.', 'Se fue como llegó: sin firmar.', 'Causa de la muerte: optimismo.']);
swap13(AIR_Q10, ['¡Por los pelos!', 'Fallaste.', 'Hoy no.', 'Casi.', '¡Ni me rozas!', 'Demasiado lento.', 'Por arriba no.', '¡Olé!']);
Object.assign(EX_INTRO, {
  gargoyle: 'Gárgolas. Se pasan siglos quietas y luego bajan en picado. Cuando veas la línea roja, apártate.',
  kasa: 'Un kasa-obake: un paraguas que cumplió cien años y decidió vengarse. Mira el círculo: cae encima.',
  chochin: 'Una linterna que escupe fuego. Entre colegas no nos juzgamos, pero deja mal al gremio.',
  snowman: 'Muñecos de nieve con brazo de lanzador profesional. Ojo a los círculos.',
  penguin: 'Pingüinos. Se lanzan de barriga en línea recta, elegantes hasta para atacar. Sal de la línea.',
  drone: 'Drones con cámara. Graban todo y disparan un flash que quema. Y no has firmado la cesión de imagen.',
  fanatic: 'Fans de Míster Confianza. Abrazan fuerte y, después del selfie, se quedan mirando el móvil. Aprovecha.',
  crab: 'Un cangrejo hiperrealista. Pinzas por delante; por los lados, nada. Atácale de costado, como hace él con todo.',
  popup: 'Ventanas emergentes. Las opciones son «Sí» y «Sí». Rómpelas.',
  cursor: 'Un cursor gigante. Hace doble clic donde estés. No te quedes quieto como un icono.',
  ninja: 'Ninjas de sombra. Lanzan estrellas y desaparecen sin despedirse. Muy de ninja.',
  dragonling: 'Crías de dragón. Pican desde el aire y escupen fuego. Ojo a la línea y al círculo rojos: la educación la tienen a medias.' });
if (SP11 && SP11.poses) swap13(SP11.poses, [['hips', 'Mi mejor perfil. (Son todos.)'], ['dab', '¡Dab! Mi equipo de marketing dice que aún funciona.'],
  ['wave', '¡Saludos a mis tres millones de seguidores! Y a los bots.'], ['flex', 'Estos bíceps tienen cuenta propia.'], ['hips', 'Esto va para el anuncio de proteínas.']]);

/* ---------- Consejos ---------- */
swap13(TIPS, ['Los golpes duelen menos si no los recibes.', 'Rodar te hace invulnerable. Morir, no.', 'A los oni no les menciones el color. Es un tema familiar.',
  'Fuego y hielo hacen vapor. Y daño. La química nunca falla.', 'He visto piedras esquivar mejor. Y eran piedras.', 'Si el suelo se pone rojo, no es una alfombra de bienvenida.',
  'Tu paquete sigue sin entregar. Lo digo por nada.', 'Tres poderes de la misma familia activan su bonus. Hay trece familias: alguna te tocará.',
  'Los cristales verdes curan. No se comen.', 'Camión-kun no frena. Nunca. Es su única regla.', 'En el mundo hiperrealista sigues siendo cuadrado. Asúmelo.',
  'Si ves una ventana de error, no pulses «Sí». Tampoco «Sí».', 'Saltar te hace invulnerable. A los impuestos, no.', 'Si coges la misma carta varias veces, se acumula. Como mis horas extra.',
  'Con tres poderes de una familia desbloqueas su especial de rama. Se lanza con tu especial.', 'El Guardián siempre ataca en el mismo orden. Apúntatelo en la mano.',
  'Las ondas se saltan. No se negocian.', 'Ataca en el aire para caer en picado. Con el Pogo, rebotas y repites.',
  'Las cartas avisan cuando completan una sinergia. Hazles caso: saben más que tú.', 'Rueda en el aire para hacer un impulso aéreo. Con Parkour, varios.',
  'Si un esqueleto aúlla, salta. Si aúlla tres veces, salta tres veces.', 'El dragón tiene crías. Mal momento para hablarle de conciliación.',
  'La Tragaperras paga poco y a menudo. Como todas.', 'Con el paraguas flotando, ataca: picado cargado y, si la tienes, Tormenta de verano.']);
TTIPS.push('Las cartas te dicen qué sinergia completas y con qué combina cada poder.', 'Acrobacia, Fortuna, Coraza e Ímpetu: cuatro familias nuevas, cada una con su bonus y su especial de rama.',
  'El Pogo encadena picados: ataca otra vez en lo alto del rebote.');
