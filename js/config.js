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

  // URL del formulario de alta de Sony Music (aún no disponible).
  // En cuanto Sony lo facilite, se pega aquí y el formulario de
  // suscripción empezará a enviar los datos automáticamente.
  // Mientras sea `null`, el formulario avisa de que la suscripción
  // todavía no está activa, pero se puede seguir probando el acceso
  // con contraseña ("¿Ya tienes la contraseña?").
  subscribeEndpoint: null,

  // URL de "reservar/comprar el álbum". No es un candado: es un enlace
  // externo siempre visible, colocado sobre la pizarra "RESERVAS ABIERTAS"
  // del fondo. De momento apunta a la home de Sony Music como marcador.
  reserveUrl: "https://www.sonymusic.es/",
};

/**
 * Lista de candados sobre la imagen de fondo (assets/images/fondo.jpg).
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
 *   - gallery admite además: images: [{ src, alt }]
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
    top: 47.54,
    left: 28.91,
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
    left: 39.04,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [
        { src: "assets/images/fondo.jpg", alt: "Foto de recuerdo 1" },
        { src: "assets/images/fondo.jpg", alt: "Foto de recuerdo 2" },
        { src: "assets/images/fondo.jpg", alt: "Foto de recuerdo 3" },
      ],
    },
  },
  {
    id: "puerta",
    top: 38.97,
    left: 50.89,
    // Este candado forma parte del primer lote (junto con "bola-disco" y
    // "mariposa"): se desbloquea con la contraseña de la newsletter.
    unlocked: false,
    requiresPassword: true,
    label: null,
    content: {
      type: "audio",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      src: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  },
  {
    id: "corazones",
    top: 42.03,
    left: 60.54,
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
    left: 78.08,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/fondo.jpg", alt: "Foto de recuerdo" }],
    },
  },
  {
    id: "esquina",
    top: 28.77,
    left: 95.8,
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
    left: 74.61,
    // Primer lote, con contraseña.
    unlocked: false,
    requiresPassword: true,
    label: { title: "VEN Y BÁILAME", subtitle: "DESBLOQUEADO" },
    content: {
      type: "video",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      src: "",
      poster: "",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  },
  {
    id: "mariposa",
    top: 54.52,
    left: 63.79,
    // Primer lote, con contraseña.
    unlocked: false,
    requiresPassword: true,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/fondo.jpg", alt: "Foto de recuerdo" }],
    },
  },
  {
    // Candado sobre la barra, junto al letrero ovalado "El Toledano" (no
    // confundir con el enlace de "Reservar álbum", que está más a la
    // derecha, sobre la pizarra, y no es un candado).
    id: "letrero-barra",
    top: 57.76,
    left: 72.81,
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
    left: 40.63,
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
    id: "bala",
    top: 81.15,
    left: 60.34,
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
    id: "fotos-mesa",
    top: 88.66,
    left: 33.49,
    unlocked: false,
    requiresPassword: false,
    label: null,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/fondo.jpg", alt: "Foto de recuerdo" }],
    },
  },
];
