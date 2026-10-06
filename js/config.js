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
  // Solo protege los candados marcados con "requiresPassword: true". No
  // hace falta escribir aquí variantes con/sin tilde: la comprobación en
  // js/app.js (openSubscribeGate) ignora acentos y mayúsculas/minúsculas.
  password: "Hacerlecasoalcorazon",

  // Endpoint real de alta en la newsletter de Sony Music Fans (SMF), tal
  // cual lo facilitó Sony en form.html. Si algún día hay que desactivar
  // temporalmente el envío, poner esto a `null`: el formulario avisará de
  // que la suscripción no está activa, pero se podrá seguir probando el
  // acceso con contraseña ("¿Ya tienes la contraseña?").
  subscribeEndpoint: "https://subs.sonymusicfans.com/submit",

  // URL de "reservar/comprar el álbum". No es un candado: es un enlace
  // externo siempre visible, colocado sobre la pizarra "RESERVAS ABIERTAS"
  // del fondo.
  reserveUrl: "https://store.sonymusic.es/collections/guille-toledano",
};

/**
 * Lista de candados sobre la imagen de fondo (assets/images/fondo4.jpg).
 *
 * Cada candado tiene esta forma:
 * {
 *   id: "identificador-unico",
 *   top: 42.03,   // posición vertical, en % de la altura de la imagen
 *   left: 60.54,  // posición horizontal, en % de la anchura de la imagen
 *   unlocked: false,        // true = candado verde y clicable
 *   requiresPassword: false, // true = pide la contraseña de la newsletter
 *   content: { ... }         // lo que se muestra al pulsar el candado (ver abajo)
 * }
 *
 * Todo candado con "unlocked: true" muestra "content.title" + "Desbloqueado"
 * al pasar el ratón por encima (ver .lock-label en css/style.css) — no hace
 * falta configurar nada aparte para eso.
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
 *     description, que se muestra como pie de foto). Si además se indica
 *     "thumbnail" (ruta a una imagen), se muestra solo esa foto de
 *     portada y, al pulsarla, se abre el visor grande con todas las
 *     "images" navegable con izquierda/derecha — pensado para cuando hay
 *     varias fotos pero se quiere mostrar una sola miniatura en el
 *     popup en vez del collage de postales superpuestas.
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
    left: 33.1,
    unlocked: false,
    requiresPassword: false,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  },
  {
    id: "fotos-pared",
    top: 37.81,
    left: 41.04,
    unlocked: false,
    requiresPassword: false,
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
    content: {
      type: "audio",
      title: "No sé si quiero volver",
      eyebrow: "Recuerdo desbloqueado",
      src: "assets/audio/guille_nota_voz_1.mp3",
      description: "Nota de voz sobre el tema 'No sé si quiero volver'.",
    },
  },
  {
    id: "corazones",
    top: 42.03,
    left: 59.15,
    unlocked: false,
    requiresPassword: false,
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
    // Con contraseña.
    unlocked: true,
    requiresPassword: true,
    content: {
      type: "video",
      title: "Ya no me avisas",
      eyebrow: "Recuerdo desbloqueado",
      src: "assets/video/bts_rodaje.mp4",
      poster: "assets/images/bts_rodaje_poster.jpg",
      description: "Un vistazo detrás de las cámaras durante el rodaje.",
    },
  },
  {
    id: "esquina",
    top: 28.77,
    left: 90.8,
    unlocked: false,
    requiresPassword: false,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "bola-disco",
    top: 15.9,
    left: 71.61,
    // Primer lote de lanzamiento, con contraseña.
    unlocked: true,
    requiresPassword: true,
    content: {
      type: "gallery",
      title: "Ven y báilame",
      eyebrow: "Recuerdo desbloqueado",
      thumbnail: "assets/images/guille_inedita.png",
      images: [{ src: "assets/images/toledano01.jpg", alt: "Foto inédita de Guille Toledano" }],
      description: "Foto inédita para celebrar el nuevo tema 'Ven y báilame'.",
    },
  },
  {
    id: "mariposa",
    top: 52.52,
    left: 62,
    // Primer lote de lanzamiento, con contraseña.
    unlocked: true,
    requiresPassword: true,
    content: {
      type: "gallery",
      title: "Mil mariposas",
      eyebrow: "Recuerdo desbloqueado",
      thumbnail: "assets/images/guille_madre.png",
      images: [{ src: "assets/images/mariposa_foto.jpg", alt: "Foto de Guille Toledano con su madre" }],
      description: "Foto con mi madre.",
    },
  },
  {
    id: "letrero-barra",
    top: 89.8,
    left: 40.6,
    // Con contraseña.
    unlocked: true,
    requiresPassword: true,
    content: {
      type: "gallery",
      title: "Quédate un ratito",
      eyebrow: "Recuerdo desbloqueado",
      thumbnail: "assets/images/quedate_un_ratito_thumb.png",
      images: [
        { src: "assets/images/quedate-un-ratito/foto1.jpeg", alt: "Foto de recuerdo 1" },
        { src: "assets/images/quedate-un-ratito/foto2.jpeg", alt: "Foto de recuerdo 2" },
        { src: "assets/images/quedate-un-ratito/foto3.jpeg", alt: "Foto de recuerdo 3" },
        { src: "assets/images/quedate-un-ratito/foto4.jpeg", alt: "Foto de recuerdo 4" },
        { src: "assets/images/quedate-un-ratito/foto5.jpeg", alt: "Foto de recuerdo 5" },
        { src: "assets/images/quedate-un-ratito/foto6.jpeg", alt: "Foto de recuerdo 6" },
        { src: "assets/images/quedate-un-ratito/foto7.jpeg", alt: "Foto de recuerdo 7" },
        { src: "assets/images/quedate-un-ratito/foto8.jpeg", alt: "Foto de recuerdo 8" },
        { src: "assets/images/quedate-un-ratito/foto9.jpeg", alt: "Foto de recuerdo 9" },
        { src: "assets/images/quedate-un-ratito/foto10.jpeg", alt: "Foto de recuerdo 10" },
        { src: "assets/images/quedate-un-ratito/foto11.jpeg", alt: "Foto de recuerdo 11" },
        { src: "assets/images/quedate-un-ratito/foto12.jpeg", alt: "Foto de recuerdo 12" },
        { src: "assets/images/quedate-un-ratito/foto13.jpeg", alt: "Foto de recuerdo 13" },
        { src: "assets/images/quedate-un-ratito/foto14.jpeg", alt: "Foto de recuerdo 14" },
        { src: "assets/images/quedate-un-ratito/foto15.jpeg", alt: "Foto de recuerdo 15" },
        { src: "assets/images/quedate-un-ratito/foto16.jpeg", alt: "Foto de recuerdo 16" },
        { src: "assets/images/quedate-un-ratito/foto17.jpeg", alt: "Foto de recuerdo 17" },
      ],
    },
  },
  {
    id: "reloj-arena",
    top: 83.23,
    left: 43,
    unlocked: false,
    requiresPassword: false,
    content: {
      type: "text",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  },
  {
    id: "bala",
    top: 90.66,
    left: 29.7,
    unlocked: false,
    requiresPassword: false,
    content: {
      type: "gallery",
      title: "Nombre canción",
      eyebrow: "Recuerdo desbloqueado",
      images: [{ src: "assets/images/sample.jpg", alt: "Foto de recuerdo" }],
    },
  },
];
