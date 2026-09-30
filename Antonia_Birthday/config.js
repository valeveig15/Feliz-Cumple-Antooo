/*

  CÓMO AGREGAR FOTOS A LA CONSTELACIÓN DE CORAZONES 

  1) Poné la foto nueva dentro de la carpeta:
        assets/photos/

  2) Renombrala sin espacios ni tildes para que sea fácil.
        Ejemplo:  anto-y-cande.jpg

  3) Bajá hasta "constellation" y elegí el corazón que quieras.
     Donde dice:
        photo: null
     cambialo por:
        photo: "assets/photos/anto-y-cande.jpg"

  4) Si querés crear UN CORAZÓN NUEVO, copiá un bloque entero como este:
        {
          title: "Título del recuerdo",
          text: "Lo que quieras que Anto lea cuando toque el corazón.",
          photo: "assets/photos/mi-foto.jpg"
        },
     y pegalo antes del último ] de constellation.

  5) Si ese corazón NO lleva foto, dejá:
        photo: null

  6) IMPORTANTE: no borres las comas entre bloques. Si solo cambiás textos,
     títulos y rutas de fotos dentro de este archivo, no necesitás tocar
     script.js ni style.css.

  💬 CÓMO AGREGAR LOS MENSAJES QUE FALTAN DE SUS AMIGOS
  En "friendMessages", buscá a Martina, Toty, Cande, Bruno o Aye y reemplazá:
        message: "MENSAJE PENDIENTE"
  por el mensaje real entre comillas. También cambiá pending: true a false.
*/

const BIRTHDAY_CONFIG = {
  birthdayPerson: "Anto",
  fullBirthdayName: "Antonia",
  creator: "Valen",
  age: 17,
  birthdayISO: "2026-10-01T00:00:00-03:00",
  song: "assets/music/someone-new.mp3",

  // Mini juego que Anto tiene que superar antes de abrir el regalo.
  // Está pensado para alguien que escucha MUCHO true crime: cero gore, pura memoria de podcast.
  unlockGame: {
    aliases: [
      { alias: "BTK", identity: "Dennis Rader" },
      { alias: "Son of Sam", identity: "David Berkowitz" },
      { alias: "Night Stalker", identity: "Richard Ramirez" },
      { alias: "Green River Killer", identity: "Gary Ridgway" },
      { alias: "Killer Clown", identity: "John Wayne Gacy" },
      { alias: "Milwaukee Cannibal", identity: "Jeffrey Dahmer" }
    ],
    trivia: [
      {
        question: "¿Qué caso quedó especialmente asociado a un Volkswagen Beetle?",
        options: ["Ted Bundy", "BTK", "Green River Killer", "Son of Sam"],
        answer: "Ted Bundy"
      },
      {
        question: "¿Qué asesino fue desenmascarado, en parte, por información recuperada de un disquete que él mismo envió?",
        options: ["Dennis Rader", "Richard Ramirez", "Gary Ridgway", "David Berkowitz"],
        answer: "Dennis Rader"
      },
      {
        question: "¿Qué caso estuvo ligado a cartas y mensajes cifrados enviados a periódicos de California?",
        options: ["Zodiac Killer", "Night Stalker", "Son of Sam", "BTK"],
        answer: "Zodiac Killer"
      },
      {
        question: "¿Qué asesino fue arrestado en Milwaukee en julio de 1991?",
        options: ["Jeffrey Dahmer", "John Wayne Gacy", "Ted Bundy", "Gary Ridgway"],
        answer: "Jeffrey Dahmer"
      },
      {
        question: "¿Qué caso ayudó a mostrar el potencial de los sistemas automatizados de huellas en Los Ángeles en 1985?",
        options: ["Night Stalker", "BTK", "Green River Killer", "Zodiac Killer"],
        answer: "Night Stalker"
      },
      {
        question: "¿Quién fue identificado como el Green River Killer tras una investigación en la que el ADN tuvo un papel decisivo?",
        options: ["Gary Ridgway", "Dennis Rader", "Richard Ramirez", "David Berkowitz"],
        answer: "Gary Ridgway"
      },
      {
        question: "¿Qué nombre real corresponde al apodo Son of Sam?",
        options: ["David Berkowitz", "Ted Bundy", "Dennis Rader", "John Wayne Gacy"],
        answer: "David Berkowitz"
      }
    ],
    chronology: [
      { label: "Son of Sam", year: 1977 },
      { label: "Ted Bundy — captura final", year: 1978 },
      { label: "Night Stalker", year: 1985 },
      { label: "Jeffrey Dahmer", year: 1991 },
      { label: "Green River Killer", year: 2001 },
      { label: "BTK", year: 2005 }
    ]
  },

  heroLines: [
    "17 años de una grandiosa tirana y, lamentablemente para todos, recién empieza.",
    "Amo tus audios mortales de cinco minutos mínimo. Esto ya cuenta como podcast.",
    "Hecho con mucho cariño, demasiados corazones y cero intención de ser discreta."
  ],

  letter: [
    "Anto:",
    "Feliz cumple, bella. Claramente no podía limitarme a mandarte un mensaje normal y listo, así que terminé haciendo todo esto para vos.",
    "Uno de mis recuerdos favoritos con vos es cuando fuimos unos días a lo de mis abuelos y decidiste que TENÍA que mirar toda la saga Crepúsculo. Yo empecé pensando que iba a morir del cringe y terminé disfrutándola justamente de tanto cringe. Ahora esas películas me hacen acordar a esos días juntas y es un recuerdo que guardo con muchísimo cariño.",
    "También amo tus audios mortales de cinco minutos mínimo, que arrancan contando una cosa y para cuando terminan ya atravesaron tres temas, dos indignaciones y una conclusión completamente distinta. Nunca cambies eso porque honestamente me encantan.",
    "Sos una grandiosa tirana, tenés una habilidad especial para convencerme de cosas que inicialmente digo que no y, peor todavía, muchas veces terminás teniendo razón. Pero también sos una amiga increíble: sos honesta conmigo, estás cuando importa y hacés que hasta las cosas más normales terminen siendo recuerdos que quiero guardar.",
    "Entre días juntas, conversaciones larguísimas, alguna salida al Sodre, planes que salen de la nada y todas las estupideces que nos hacen reír, me hace muy feliz tenerte en mi vida.",
    "Hace tiempo me dijiste: “Cualquier cosa estoy para vos siempre”. Quiero que sepas que de mi lado es exactamente igual.",
    "Espero que tus 17 estén llenos de gente que te quiera muchísimo, momentos que valgan la pena guardar, cosas nuevas que te entusiasmen y muchas razones para reírte. Gracias por ser vos, incluso cuando estás ejerciendo tu cargo oficial de tirana.",
    "Te quiero muchísimo. Feliz cumpleaños, Anto. 🩶",
    "— Valen"
  ],

  friendMessages: [
    {
      name: "Sopi",
      message: "Sopi te desea un muy feliz cumple bella!! Que pases hermoso ❣️",
      pending: false
    },
    {
      name: "Sof",
      message: "Hola Anto, te deseo un muy feliz cumpleaños y q la pases hermoso hoy, te quiero mucho",
      pending: false
    },
    { name: "Martina", message: "MENSAJE PENDIENTE", pending: true },
    { name: "Toty", message: "MENSAJE PENDIENTE", pending: true },
    { name: "Cande", message: "MENSAJE PENDIENTE", pending: true },
    { name: "Bruno", message: "MENSAJE PENDIENTE", pending: true },
    { name: "Aye", message: "MENSAJE PENDIENTE", pending: true }
  ],

  receiptItems: [
    ["Mensajes que empiezan con “ANTOOOO”", "∞"],
    ["Audios mortales", "mín. 5:00"],
    ["Saga Crepúsculo soportada juntas", "completa"],
    ["Cringe convertido en cariño", "100%"],
    ["Nivel de tiranía de Anto", "grandioso"],
    ["“amiga / bella / blda” utilizados", "incontables"],
    ["Conversaciones que cambian de tema sin aviso", "24/7"],
    ["Veces que te elegiría como amiga", "todas"]
  ],

  gallery: [
    {
      src: "assets/photos/anto-portrait-1.jpeg",
      caption: "Anto siendo Anto ✨"
    },
    {
      src: "assets/photos/anto-portrait-2.jpeg",
      caption: "La grandiosa tirana en cuestión."
    },
    {
      src: "assets/photos/amigas-espejo.jpeg",
      caption: "Nosotras + gente linda 🩶"
    },
    {
      src: "assets/photos/amigas-casa.jpeg",
      caption: "Una de esas fotos que quiero guardar siempre."
    }
  ],

  constellation: [
    {
      title: "Los días en lo de mis abuelos",
      text: "De mis recuerdos favoritos con vos. Unos días juntas, toda la saga Crepúsculo y yo descubriendo que algo puede dar tanto cringe que termina gustándome. Lo guardo con muchísimo cariño.",
      photo: "assets/photos/amigas-casa.jpeg"
    },
    {
      title: "Crepúsculo",
      text: "Esto es básicamente tu culpa. Yo fui obligada a entrar y terminé saliendo con opiniones. Inaceptable, pero memorable.",
      photo: null
    },
    {
      title: "Tus audios mortales",
      text: "Cinco minutos mínimo. Una historia principal, tres historias secundarias, alguna indignación y un final que a veces no tiene nada que ver con el principio. Los amo.",
      photo: null
    },
    {
      title: "Grandiosa tirana",
      text: "Título oficial y vitalicio. Tenés una capacidad preocupante para lograr que la gente haga lo que querés y encima hacer parecer que fue idea nuestra.",
      photo: "assets/photos/anto-portrait-2.jpeg"
    },
    {
      title: "Gracias por estar",
      text: "Me quedo con esa frase tuya: “Cualquier cosa estoy para vos siempre”. Lo mismo vale de mi lado, siempre.",
      photo: null
    },
    {
      title: "Tu honestidad",
      text: "Gracias por decirme lo que pensás de verdad, incluso cuando no es exactamente lo que quería escuchar. Es una de las razones por las que confío tanto en vos.",
      photo: null
    },
    {
      title: "Tu humor",
      text: "Tenés el talento de hacer que una conversación completamente normal se vaya al carajo en cuestión de segundos. Y sí, es un talento.",
      photo: null
    },
    {
      title: "Planes y salidas",
      text: "Por las juntadas, los planes improvisados y todas esas cosas que en el momento parecen normales y después terminan siendo recuerdos lindos.",
      photo: "assets/photos/amigas-espejo.jpeg"
    },
    {
      title: "Esta foto",
      text: "No necesita una historia enorme. Me gusta porque estamos juntas y eso ya alcanza.",
      photo: "assets/photos/amigas-casa.jpeg"
    },
    {
      title: "Bella.exe",
      text: "Evidencia visual de que la tiranía puede venir con carita de inocente.",
      photo: "assets/photos/anto-portrait-1.jpeg"
    },
    {
      title: "Tu gente",
      text: "Ojalá hoy te quede clarísimo cuánta gente te quiere y lo importante que sos para todos nosotros.",
      photo: null
    },
    {
      title: "17",
      text: "Que tus 17 tengan muchísimo de vos: risas, carácter, planes, historias, gente linda y cosas que después queramos recordar.",
      photo: null
    },
    {
      title: "Nosotras",
      text: "Gracias por todas las conversaciones, los audios, las juntadas, las opiniones intensas y los momentos serios en el medio del caos.",
      photo: "assets/photos/amigas-espejo.jpeg"
    },
    {
      title: "El próximo recuerdo",
      text: "Este queda para algo que todavía no pasó. Después veremos qué estupidez termina ocupando este lugar.",
      photo: null
    }
  ]
};
