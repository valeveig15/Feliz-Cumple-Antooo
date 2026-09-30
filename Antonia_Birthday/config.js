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
    "Ya cumple 17 años mi tirana favorita!",
    "Por otro año lleno de tus audios/podcasts.",
    "Hecho con mucho cariño, porfavor tomar en cuenta cuando me quiera matar luego.",
    "Te vigilo, se que te esta gustando mi codigo, JUAJUAJUA."
  ],

  letter: [
    "Anto:",
    "Feliz cumple, bella. Claramente no me alcanzaba con mandarte un mensajito corto de ""Feliz cumple!"" y listo, así que terminé haciendo esto para vos.",
    "Uno de mis recuerdos favoritos con vos es cuando fuimos unos días a lo de mis abuelos y decidiste que TENÍA que mirar toda la saga de Crepúsculo. Yo empecé pensando que iba a morir del cringe y aburrimiento, y terminé disfrutándola justamente de tanto cringe. Ahora cada que veo algo de esa saga me hacen acordar a esos días juntas y es un recuerdo que guardo con muchísimo cariño.",
    "También amo tus audios mortales de cinco minutos mínimo. Siempre arrancas hablando de una cosa y para cuando terminas ya atravesaste tres temas, dos indignaciones y un plan demasido claro y realista de como aniquilar a tu enemigo del momento sea el gobierno o el universo mismo. Espero nunca cambies ese habito porque honestamente creo que no hay nada mas que me saque tanta risa de la nada.",
    "Pero mas alla de tus comportamientos tiranicos y de gobernar el universo, también sos una amiga increíble: sos honesta conmigo, estás cuando importa y hacés que hasta las cosas más normales terminen siendo recuerdos que quiero guardar por toda la eternidad.",
    "Entre días juntas, conversaciones larguísimas, alguna salida con los demas, planes que salen de la nada y todas las estupideces que nos hacen reír, me hace muy feliz tenerte en mi vida.",
    "Hace muuucho tiempo me dijiste: “Cualquier cosa estoy para vos siempre”, para serte sincera desde ese dia es que me di cuenta que no sabria ni quiero saber como seria mi vida si no nos hubieramos conocido, si no nos hubieramos hecho amigas y si no hubiera tenido el honor de darte verguneza como he hecho tantas veces.",
    "Y tambien quiero que sepas que de mi lado es exactamente igual, estoy para ti cuando lo necesites y para lo que necesites, no lo dudes. (Tambien se algunas cosas de matar a alguien si dejar rastro por si necesitas un secuaz)",
    "Espero que tus 17 estén llenos de gente que te quiera muchísimo, momentos que valgan la pena guardar, cosas nuevas que te entusiasmen y muchas razones para reírte. Gracias por existir.",
    "Te quiero muchísimo. Feliz cumpleaños, Anto. 💜",
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
    ["Cringe convertido en cariño", "98%"],
    ["Nivel de tiranía de Anto", "exede todo limite"],
    ["“amiga / bella / blda” utilizados", "incontables"],
    ["Conversaciones que cambian de tema sin aviso", "24/7"],
    ["Veces que negaste conocerme por verguenza", "4 minimo 😢"]
  ],

  gallery: [
    {
      src: "assets/photos/anto-portrait-1.jpeg",
      caption: "Sacandose fotos con un cel ageno ✨"
    },
    {
      src: "assets/photos/anto-portrait-2.jpeg",
      caption: "La grandiosa tirana en cuestión"
    },
    {
      src: "assets/photos/amigas-espejo.jpeg",
      caption: "Que bellas!"
    },
    {
      src: "assets/photos/amigas-casa.jpeg",
      caption: "Nosotras"
    }
  ],

  constellation: [
    {
      title: "",
      text: "...",
      photo: null
    },
    {
      title: "",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    },
    {
      title: "...",
      text: "...",
      photo: null
    }
  ]
};
