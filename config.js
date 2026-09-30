/*
  ==============================================================
  💌  ZONA EDITABLE DE VALEN — PODÉS CAMBIAR ESTO SIN ROMPER NADA
  ==============================================================

  ⭐ CÓMO AGREGAR FOTOS A LA CONSTELACIÓN DE CORAZONES ⭐

  1) Poné la foto nueva dentro de la carpeta:
        assets/photos/

  2) Para que sea fácil, renombrala sin espacios ni tildes.
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

  heroLines: [
    "17 años de Anto ✦ una cantidad ilegal de cariño",
    "Hecho con recuerdos, chistes internos y probablemente demasiados corazones.",
    "Sí, preguntarte si te gustaban los corazones TENÍA una razón."
  ],

  letter: [
    "Anto:",
    "No sabía cómo hacerte una carta normal, así que claramente terminé haciéndote un universo entero. Me parecía más acorde a nosotras.",
    "Nuestra amistad puede pasar de una conversación completamente seria a discutir siete licuados, un litro de helado, una teoría ridícula o una emergencia sentimental en aproximadamente tres segundos. Y, de alguna manera, eso es de mis cosas favoritas.",
    "Sos de esas personas que me dicen la verdad, me bajan a tierra, se ríen conmigo, me bancan cuando estoy insoportable y también aparecen cuando de verdad importa. Hace mucho me dijiste: “Cualquier cosa estoy para vos siempre”. Yo quiero que sepas que es exactamente mutuo.",
    "Ojalá tus 17 vengan con auroras boreales, parques de atracciones, hamburguesas, helado de frambuesa (y vainilla, porque según vos es un clásico), pelis de romance que no sean una porquería y un montón de momentos que después podamos convertir en otro chiste interno.",
    "Y como tu peli favorita es El Libro de la Vida, esto es un mini libro de la nuestra: desordenado, exagerado, lleno de gente que te quiere y con una banda sonora de fondo.",
    "Feliz cumpleaños, bella. Gracias por existir y por dejarme estar en tu vida. Te quiero muchísimo. 🩶",
    "— Valen"
  ],

  friendMessages: [
    {
      name: "Sopi",
      message: "Sopi te desea un muy feliz cumple bella!! Que pases hermoso ❣️",
      pending: false
    },
    {
      name: "Sofía",
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
    ["Consultas de emergencia", "24/7"],
    ["Incidente de los 7 licuados", "1 💀"],
    ["Litros de helado moralmente justificables", "todos"],
    ["“amiga / bella / blda” utilizados", "incontables"],
    ["Planes improvisados", "demasiados"],
    ["Ataques de risa", "sin stock"],
    ["Veces que te elegiría como amiga", "todas"]
  ],

  gallery: [
    {
      src: "assets/photos/anto-portrait-1.jpeg",
      caption: "Una Anto ✨"
    },
    {
      src: "assets/photos/anto-portrait-2.jpeg",
      caption: "Otra Anto porque una claramente no alcanza."
    },
    {
      src: "assets/photos/amigas-espejo.jpeg",
      caption: "Prueba fotográfica de que sí existimos fuera de WhatsApp."
    },
    {
      src: "assets/photos/amigas-casa.jpeg",
      caption: "Gente linda + caos controlado = memoria guardada."
    }
  ],

  constellation: [
    {
      title: "Gracias por existir",
      text: "Una vez me dijiste algo así a mí. Hoy te lo devuelvo: gracias por existir, Anto. El mundo —y el mío— es bastante más divertido porque estás.",
      photo: "assets/photos/anto-portrait-1.jpeg"
    },
    {
      title: "La teoría de los 7 licuados",
      text: "Una amistad verdaderamente sólida sobrevive incluso a descubrir que una persona puede bajarse siete licuados y seguir teniendo opiniones.",
      photo: null
    },
    {
      title: "Sodre",
      text: "Gracias por estar en momentos que para mí eran importantes. Ese concierto quedó archivado en mi cerebro como uno de esos recuerdos chiquitos que valen muchísimo.",
      photo: null
    },
    {
      title: "Helado",
      text: "Oreo, vainilla, avellanas, frambuesa… la ciencia todavía no decide si esto es un recuerdo o una categoría completa de nuestra amistad.",
      photo: null
    },
    {
      title: "Friend quiz",
      text: "Ese glorioso momento en que descubrimos que creemos conocernos muchísimo hasta que aparece una pregunta sobre helado, colores o momentos locos.",
      photo: null
    },
    {
      title: "Auroras boreales",
      text: "Deseo oficial: que algún día veas las auroras boreales de verdad. Y que cuando pase te acuerdes de que esto estaba escrito acá antes.",
      photo: null
    },
    {
      title: "Libro de nuestra vida",
      text: "Tu peli favorita de chica sigue siendo El Libro de la Vida. Este corazón es una página nueva: feliz capítulo 17, Anto.",
      photo: "assets/photos/anto-portrait-2.jpeg"
    },
    {
      title: "Nosotras + gente linda",
      text: "Por todas las juntadas que salen bien, las que salen raras y las que terminan siendo historias que contamos durante meses.",
      photo: "assets/photos/amigas-espejo.jpeg"
    },
    {
      title: "Una casa llena de amigas",
      text: "Hay fotos que no necesitan ser perfectas porque ya guardan exactamente lo importante: estar juntas.",
      photo: "assets/photos/amigas-casa.jpeg"
    },
    {
      title: "Tu honestidad",
      text: "Gracias por decirme lo que pensás incluso cuando no es lo que quiero escuchar. Es una de las razones por las que confío tanto en vos.",
      photo: null
    },
    {
      title: "Tu humor",
      text: "Deseo que nunca pierdas esa capacidad de convertir una conversación normal en algo completamente ridículo en menos de un minuto.",
      photo: null
    },
    {
      title: "Tu gente",
      text: "Este corazón también es para toda la gente que te quiere. Ojalá hoy te quede clarísimo que sos importante para muchísimas personas.",
      photo: null
    },
    {
      title: "17",
      text: "Que los 17 te encuentren siendo exactamente vos: fuerte, graciosa, sensible cuando toca, insoportable cuando corresponde y muy, muy querida.",
      photo: null
    },
    {
      title: "El próximo recuerdo",
      text: "Este queda vacío a propósito. Es para algo que todavía no pasó y que después vamos a mirar diciendo: ‘¿te acordás de esto?’",
      photo: null
    }
  ]
};
