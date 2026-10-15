'use strict';
/* ======================================================================
   HISTORIA: diálogos, Lumen, viajes y capítulos
   ====================================================================== */
const STORY = {
  intro: [
    ['narr', 'Hace siglos, una linterna selló a los monstruos bajo las Ruinas del Ocaso.'],
    ['narr', 'Esta noche, un repartidor la ha encendido para ver dónde pisaba.'],
    ['tovan', '¿Hola? ¡Paquete para el «Guardián de las Ruinas»! Necesito una firma.'],
    ['lumen', '¡¿QUIÉN OSA DESPERTARME?! …Ah. Un repartidor. Maravilloso.'],
    ['tovan', '¡La linterna habla! ¿Esto venía en el catálogo?', 'happy'],
    ['lumen', 'Soy Lumen, guardiana del sello. Ese sello que TÚ acabas de romper, por cierto.'],
    ['lumen', 'Los monstruos van a salir. En oleadas. Muchas oleadas.'],
    ['tovan', '¿Y quién me firma el paquete?'],
    ['lumen', '¡OLVIDA EL PAQUETE! Agarra el bastón y pega a todo lo que tenga dientes.'],
    ['tovan', 'Vale, pero que conste que esto no entra en mi horario.', 'happy'],
    ['lumen', 'Si caes, recogeré fragmentos de los monstruos y te traeré de vuelta. Cobro en fragmentos, claro.']
  ],
  boss_boss: [
    ['lumen', '¡Cuidado! ¡Es el Guardián de las Ruinas!'],
    ['tovan', '¡Por fin! ¡Traigo un paquete a su nombre!', 'happy'],
    ['lumen', 'No va a firmar nada. Cuando salte, apártate. Y salta sus ondas, que no son alfombras.']
  ],
  win_boss: [
    ['tovan', 'Disculpe… ¿me firma aquí?'],
    ['lumen', 'Lo has convertido en grava.'],
    ['tovan', '…Lo dejo en conserjería.']
  ],
  boss_dragon: [
    ['tovan', 'Eso de ahí arriba… ¿es un dragón? ¿Uno MUY largo?'],
    ['lumen', 'Ryūjin, el dragón de jade. Escupe fuego, se lanza en picado y llueve bolas de fuego.'],
    ['tovan', '¿Algún consejo profesional?'],
    ['lumen', 'Si el suelo se pone rojo, no es una alfombra de bienvenida. Y pégale cuando baje.']
  ],
  win_dragon: [
    ['tovan', '¡Lo hemos derrotado!', 'happy'],
    ['lumen', 'TÚ has pegado. YO he brillado muchísimo. Trabajo en equipo.'],
    ['tovan', '¿Crees que tenía buzón?']
  ],
  biome_1: [
    ['lumen', 'El sello roto nos ha arrastrado al Santuario de los Cerezos.'],
    ['tovan', '¡Qué bonito! ¿Aquí vive alguien que firme paquetes?', 'happy'],
    ['lumen', 'Aquí viven oni. Ogros. Azules.'],
    ['tovan', '¿Azules de frío?'],
    ['lumen', 'De nacimiento. Y ni se te ocurra mencionarlo: son MUY sensibles con el tema.']
  ],
  biome_2: [
    ['tovan', 'Qué frío… ¿Y mi abrigo?'],
    ['lumen', 'En el paquete, supongo. Ese que no has entregado.'],
    ['tovan', '¡Lo entregaré! En cuanto encuentre a alguien que no intente comerme.']
  ],
  loop: [
    ['lumen', '¿Otra vez las ruinas? El sello está peor de lo que pensaba.'],
    ['tovan', 'Mira el lado bueno: ya me sé el camino.', 'happy']
  ]
};
const TIPS = [
  'Los golpes duelen menos si no los recibes.',
  'Rodar te hace invulnerable. Morir, no.',
  'Los oni odian que les recuerdes que son azules. Úsalo.',
  'Fuego y hielo juntos hacen vapor. Y daño. Mucho daño.',
  'He visto piedras esquivar mejor. Y eran piedras.',
  'Si el suelo brilla en rojo, NO es una alfombra de bienvenida.',
  'Tu paquete sigue sin entregar. Lo digo por nada.',
  'El dragón es largo, pero su paciencia es corta.',
  'Tres cartas de la misma familia activan un bonus. Las cuentas no son lo tuyo, lo sé.',
  'Los cristales verdes curan. No, no se comen.',
  'El Guardián salta. Tú también sabes saltar. Coincidencia fascinante.'
];
