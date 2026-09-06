# El Toledano

Splash page de Guillermo Toledano.

Sitio 100% estático (HTML + CSS + JS, sin build ni servidor): una escena de
bar con candados colocados sobre objetos concretos. Cada candado se
desbloquea **manualmente** (editando un fichero) cuando llega su fecha, y al
pulsarlo muestra un recuerdo (canción, vídeo, fotos, manuscrito o mensaje de
voz) en una ventana emergente.

## Cómo publicar una actualización (abrir candados / añadir contenido)

Todo se controla desde **`js/config.js`**. No hace falta tocar nada más.

1. Abre `js/config.js` y localiza el candado que quieres actualizar dentro
   del array `LOCKS` (cada uno tiene un `id` descriptivo: `"puerta"`,
   `"bola-disco"`, `"mariposa"`, etc.).
2. Pon `unlocked: true` para que se muestre en verde y sea clicable.
3. Rellena su `content` con los datos reales (título, texto, y las rutas a
   los ficheros de audio/vídeo/fotos que hayas subido dentro de `assets/`).
4. Si ese candado necesita la contraseña de la newsletter, dejar
   `requiresPassword: true`; si no, `false`.
5. Sube los ficheros de contenido nuevos (audio/vídeo/fotos) dentro de
   `assets/` y despliega todo el sitio de nuevo.

Mientras un candado tenga `unlocked: false` su contenido nunca se descarga
ni se muestra al visitante, así que es seguro dejar datos de relleno
("Lorem ipsum...") en candados que aún no tienen fecha.

### El primer lote (con contraseña)

Los tres candados que se desbloquean primero son `bola-disco`, `puerta` y
`mariposa`. Llevan `requiresPassword: true`: aunque estén en verde, al
pulsarlos piden la contraseña que Sony envía en el email de bienvenida de
la newsletter. Una vez introducida correctamente una vez, el navegador la
recuerda (no se vuelve a pedir) y el resto de candados que se vayan
desbloqueando después ya no la piden.

La contraseña se configura en `SITE_CONFIG.password` (placeholder actual:
`eltoledano`).

### El enlace de "Reservar álbum"

La pizarra "RESERVAS ABIERTAS" **no es un candado**: es un enlace externo
siempre visible (no depende de fechas ni de la contraseña) colocado justo
encima de esa zona de la imagen de fondo. Se configura con
`SITE_CONFIG.reserveUrl` en `js/config.js` — de momento apunta a
`https://www.sonymusic.es/` como marcador. En cuanto exista la URL
definitiva de reservas/preventa, basta con cambiar ese valor. Si algún día
`reserveUrl` estuviera vacío, el visitante ve un aviso de "disponible
próximamente" en vez de un enlace roto.

### Formulario de alta en la newsletter (Sony Music)

El formulario "Regístrate" todavía no tiene destino: Sony Music aún tiene
que facilitar el endpoint de alta. En cuanto exista, se pega la URL en
`SITE_CONFIG.subscribeEndpoint` (dentro de `js/config.js`) y el formulario
empezará a enviarle los datos por `fetch` (JSON, método `POST`). Hasta
entonces, el botón "¿Ya tienes la contraseña? Introdúcela aquí" permite
seguir probando el resto del flujo sin depender del formulario.

## Estructura del proyecto

```
index.html          Escena principal
css/style.css        Estilos
js/config.js          <-- fichero a editar para cada actualización
js/app.js             Lógica del sitio (candados, popups, formulario)
assets/images/        Fondo, iconos de candado, logos, papel del popup
assets/fonts/          Tipografía manuscrita
mockups/               Diseños de referencia
```

## Despliegue

Es un sitio estático puro: basta con subir la carpeta completa a
cualquier servidor de ficheros estáticos (no requiere Node, build ni
base de datos). Pensado para alojarse en el servidor de estáticos de
Sony Music.

## Notas / limitaciones conocidas

- La posición de los candados está en porcentaje sobre `assets/images/fondo.jpg`,
  así que la escena mantiene siempre su proporción (1920×1282).
- En móvil (ancho de pantalla ≤ 900px) la escena ocupa toda la altura de la
  pantalla y se ve completa desplazando en horizontal, en vez de encogerse
  para caber entera (así los candados no se vuelven diminutos). Al cargar,
  se muestra brevemente un aviso ("Desliza para ver todo el bar →") y la
  escena se desplaza sola un poco a modo de pista; en cuanto el usuario
  toca la pantalla o hace scroll, la animación se cancela. Todo esto está
  en la sección final de `js/app.js` (`initMobileAutoScroll`) por si se
  quiere afinar el comportamiento más adelante (por ejemplo, iconos de
  flecha en vez de texto, o repetir la pista si no ha habido interacción).
- El desbloqueo es manual y offline (no depende de la fecha del sistema del
  visitante): cada actualización se publica subiendo una nueva versión de
  `js/config.js` con los candados que correspondan ya en verde.
