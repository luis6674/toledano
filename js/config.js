/**
 * CONFIGURACIÓN DEL SITIO "EL TOLEDANO"
 * ======================================
 * Este es el ÚNICO fichero que hay que tocar para:
 *   1) Abrir/cerrar candados (campo "unlocked").
 *   2) Añadir el contenido real cuando esté listo (campo "content").
 *   3) Configurar la contraseña y el endpoint de alta en la newsletter.
 *
 * No hace falta tocar HTML, CSS ni el resto del JS para publicar una
 * actualización: basta con editar este fichero y volver a subir los
 * ficheros estáticos.
 */

const SITE_CONFIG = {
  // Contraseña que Sony envía en el email de bienvenida de la newsletter.
  // Solo protege los candados marcados con "requiresPassword: true".
  password: "eltoledano",

  // Endpoint real de alta en la newsletter de Sony Music Fans (SMF), tal
  // cual lo facilitó Sony en form.html. Si algún día hay que desactivar
  // temporalmente el envío, poner esto a `null`: el formulario avisará de
  // que la suscripción no está activa, pero se podrá seguir probando el
  // acceso con contraseña ("¿Ya tienes la contraseña?").
  subscribeEndpoint: "https://subs.sonymusicfans.com/submit",

  // URL de "reservar/comprar el álbum". No es un candado: es un enlace
  // externo siempre visible, colocado sobre la pizarra "RESERVAS ABIERTAS"
  // del fondo. De momento apunta a la home de Sony Music como marcador.
  reserveUrl: "https://www.sonymusic.es/",
};

/**
 * Lista de candados sobre la imagen de fondo (assets/images/fondo2.jpg).
 *
 * Cada candado tiene esta forma:
 * {
 *   id: "identificador-unico",
 *   top: 42.03,   // posición vertical, en % de la altura de la imagen
 *   left: 60.54,  // posición horizontal, en % de la anchura de la imagen
 *   unlocked: false,        // true = candado verde y clicable
 *   requiresPassword: false, // true = pide la contraseña de la newsletter
 *   label: null,             // texto que aparece sobre el candado cuando está
 *                             // desbloqueado, ej: { title: "VEN Y BÁILAME", subtitle: "DESBLOQUEADO" }
 *   content: { ... }         // lo que se muestra al pulsar el candado (ver abajo)
 * }
 *
 * Tipos de contenido soportados en "content.type":
 *   - "audio"   -> reproductor de audio (fragmento de canción / mensaje de voz)
 *   - "video"   -> reproductor de vídeo
 *   - "gallery" -> galería de fotos
 *   - "text"    -> texto / manuscrito
 *
 * Todos los tipos admiten: title, eyebrow (texto pequeño superior),
 * description.
 *   - audio/video admiten además: src, poster (solo vídeo)
 *   - gallery admite además: images: [{ src, alt }] (y, opcionalmente,
 *     description, que se muestra como pie de foto)
 *   - text admite además: body (puede tener saltos de línea con \n)
 *
 * IMPORTANTE: mientras un candado tenga "unlocked: false" da igual lo que
 * pongamos en "content": nunca se descarga ni se muestra al visitante.
 * Así que es seguro dejar aquí datos de relleno (placeholders) para
 * candados que todavía no tienen fecha de publicación.
 */
const LOCKS = [
  {
    id: "perchero",
    top: 47,
    left: 32.7,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  },
  {
    id: "fotos-pared",
    top: 38.21,
    left: 41.04,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [
        { src: "assets/images/sample.jpg", alt: "Foto de recuerdo 1" },
        { src: "assets/images/sample.jpg", alt: "Foto de recuerdo 2" },
        { src: "assets/images/sample.jpg", alt: "Foto de recuerdo 3" },
      ],
    },
  },
  {
    id: "puerta",
    top: 39.5,
    left: 51.3,
    // Primer lote de lanzamiento (junto con "bola-disco" y "mariposa"):
    // ya desbloqueado, pero pide la contraseña de la newsletter.
    unlocked: true,
    requiresPassword: true,
    label: null,
    content: {
      type: "audio",
      title: "No sé si quiero volver",
      eyebrow: "Recuerdo desbloqueado",
      src: "assets/audio/sample-12s.mp3",
      description: "Esta es una nota de voz grabada por El Toledano sobre el tema 'No sé si quiero volver'.",
    },
  },
  {
    id: "corazones",
    top: 42.03,
    left: 59.15,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "audio",
      title: "Mensaje de voz",
      eyebrow: "Recuerdo desbloqueado",
      src: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "camara",
    top: 32.67,
    left: 74.08,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/sample.jpg", alt: "Foto de recuerdo" }],
    },
  },
  {
    id: "esquina",
    top: 28.77,
    left: 90.8,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "bola-disco",
    top: 16.21,
    left: 71.61,
    // Primer lote de lanzamiento, con contraseña.
    unlocked: true,
    requiresPassword: true,
    label: { title: "VEN Y BÁILAME", subtitle: "DESBLOQUEADO" },
    content: {
      type: "gallery",
      title: "Ven y báilame",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/toledano01.jpg", alt: "Foto inédita de Guille Toledano" }],
      description: "Foto inédita para celebrar este nuevo tema 'Ven y báilame'.",
    },
  },
  {
    id: "mariposa",
    top: 54.52,
    left: 62,
    // Primer lote de lanzamiento, con contraseña.
    unlocked: true,
    requiresPassword: true,
    label: null,
    content: {
      type: "gallery",
      title: "Mil mariposas",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/sample.jpg", alt: "Foto de El Toledano con su madre" }],
      description: "Foto con mi madre.",
    },
  },
  {
    // Candado sobre la barra, junto al letrero ovalado "El Toledano" (no
    // confundir con el enlace de "Reservar álbum", que está más a la
    // derecha, sobre la pizarra, y no es un candado).
    id: "letrero-barra",
    top: 57.8,
    left: 69.6,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "reloj-arena",
    top: 83.23,
    left: 43,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "banqueta",
    top: 81.15,
    left: 59.34,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "audio",
      title: "Mensaje de voz",
      eyebrow: "Recuerdo desbloqueado",
      src: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "bala",
    top: 88.66,
    left: 36.7,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/sample.jpg", alt: "Foto de recuerdo" }],
    },
  },
];
