(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var locksLayer = document.getElementById("locks-layer");
  var logoOverlay = document.getElementById("logo-overlay");
  var registrateBtn = document.getElementById("registrate-btn");
  var toastEl = document.getElementById("toast");
  var modalBackdrop = document.getElementById("modal-backdrop");
  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modal-body");
  var modalCloseBtn = document.getElementById("modal-close");
  var modalHint = document.getElementById("modal-hint");

  var PASSWORD_KEY = "elToledano_passwordVerified";

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------

  var toastTimer = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  function isPasswordVerified() {
    try {
      return localStorage.getItem(PASSWORD_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setPasswordVerified() {
    try {
      localStorage.setItem(PASSWORD_KEY, "true");
    } catch (e) {
      /* localStorage no disponible: la contraseña se pedirá cada vez */
    }
  }

  function openModal() {
    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    modalBody.innerHTML = "";
    modalBody.classList.remove("is-centered");
    modalHint.hidden = true;
    modalHint.textContent = "";
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", function (evt) {
    if (evt.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", function (evt) {
    // Si el visor de fotos está abierto, es su propio listener el que
    // debe gestionar Escape (para cerrar solo el visor, no todo el modal).
    if (evt.key === "Escape" && !modalBackdrop.hidden && lightbox.hidden) closeModal();
  });

  // ---------------------------------------------------------------
  // Posicionar el botón "Regístrate para acceder" sobre el papel
  // rasgado que forma parte de assets/images/logo_home_txt.png
  // ---------------------------------------------------------------

  function layoutRegistrateButton() {
    var rect = logoOverlay.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var top = rect.top - stageRect.top + rect.height * 0.82;
    var left = rect.left - stageRect.left + rect.width * 0.01;
    var width = rect.width * 0.8;
    var height = rect.height * 0.17;
    registrateBtn.style.top = top + "px";
    registrateBtn.style.left = left + "px";
    registrateBtn.style.width = width + "px";
    registrateBtn.style.height = height + "px";
  }

  window.addEventListener("resize", layoutRegistrateButton);
  if (logoOverlay.complete) {
    layoutRegistrateButton();
  } else {
    logoOverlay.addEventListener("load", layoutRegistrateButton);
  }

  registrateBtn.addEventListener("click", function () {
    openSubscribeGate(null);
  });

  // ---------------------------------------------------------------
  // Enlace de "Reservar álbum" sobre la pizarra del fondo
  // ---------------------------------------------------------------

  var reserveLink = document.getElementById("reserve-link");
  if (SITE_CONFIG.reserveUrl) {
    reserveLink.href = SITE_CONFIG.reserveUrl;
  } else {
    reserveLink.addEventListener("click", function (evt) {
      evt.preventDefault();
      showToast("El enlace para reservar el álbum estará disponible próximamente.");
    });
  }

  // ---------------------------------------------------------------
  // Pintar los candados
  // ---------------------------------------------------------------

  LOCKS.forEach(function (lock) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lock";
    btn.style.top = lock.top + "%";
    btn.style.left = lock.left + "%";
    btn.dataset.lockId = lock.id;

    var img = document.createElement("img");
    setLockIcon(img, lock);
    btn.appendChild(img);

    // Todo candado desbloqueado muestra su título + "Desbloqueado" al
    // pasar el ratón por encima (ver CSS: .lock-label solo es visible en
    // :hover/:focus-visible).
    if (lock.unlocked && lock.content.title) {
      var labelWrap = document.createElement("span");
      labelWrap.className = "lock-label";
      var titleEl = document.createElement("span");
      titleEl.className = "lock-title";
      titleEl.textContent = lock.content.title;
      var subtitleEl = document.createElement("span");
      subtitleEl.className = "lock-subtitle";
      subtitleEl.textContent = "Desbloqueado";
      labelWrap.appendChild(titleEl);
      labelWrap.appendChild(subtitleEl);
      btn.insertBefore(labelWrap, img);
    }

    btn.setAttribute(
      "aria-label",
      lock.unlocked ? "Recuerdo desbloqueado: " + (lock.content.title || lock.id) : "Recuerdo bloqueado"
    );

    btn.addEventListener("click", function () {
      onLockClick(lock, btn);
    });

    locksLayer.appendChild(btn);
  });

  function setLockIcon(img, lock) {
    img.src = lock.unlocked
      ? "assets/images/candado_abierto.png"
      : "assets/images/candado_cerrado.png";
    img.alt = lock.unlocked ? "Candado abierto" : "Candado cerrado";
  }

  function onLockClick(lock, btn) {
    if (!lock.unlocked) {
      btn.classList.remove("is-shaking");
      // forzar reflow para poder reiniciar la animación
      void btn.offsetWidth;
      btn.classList.add("is-shaking");
      showToast("Este recuerdo todavía no se ha desbloqueado.");
      return;
    }

    if (lock.requiresPassword && !isPasswordVerified()) {
      openSubscribeGate(lock);
      return;
    }

    openContentModal(lock);
  }

  // ---------------------------------------------------------------
  // Modal: alta en newsletter + contraseña
  // ---------------------------------------------------------------

  function openSubscribeGate(pendingLock) {
    var tpl = document.getElementById("tpl-gate");
    var node = tpl.content.cloneNode(true);
    modalBody.innerHTML = "";
    modalBody.classList.remove("is-centered");
    modalBody.appendChild(node);

    var subscribePanel = modalBody.querySelector(".panel-subscribe");
    var passwordPanel = modalBody.querySelector(".panel-password");
    var successPanel = modalBody.querySelector(".panel-success");
    var signatureEl = modalBody.querySelector(".modal-signature");
    var showSubscribeBtn = modalBody.querySelector('[data-action="show-subscribe"]');
    var subscribeForm = modalBody.querySelector(".subscribe-form");
    var subscribeMsg = modalBody.querySelector('[data-role="form-msg"]');
    var passwordForm = modalBody.querySelector(".password-form");
    var passwordMsg = modalBody.querySelector('[data-role="password-msg"]');

    // La firma "El Toledano" no se muestra durante el formulario de alta
    // (queda muy apretado con tantos campos), solo en los pasos de
    // contraseña y de "gracias por registrarte".
    function syncSignatureVisibility() {
      signatureEl.hidden = !subscribePanel.hidden;
    }

    showSubscribeBtn.addEventListener("click", function () {
      passwordPanel.hidden = true;
      subscribePanel.hidden = false;
      syncSignatureVisibility();
    });

    // Al pulsar "Regístrate" (pendingLock nulo) se ve directamente el
    // formulario de alta. Al pulsar un candado protegido por contraseña
    // (pendingLock presente) se ve directamente el paso de contraseña,
    // con un enlace para ir a suscribirse si todavía no se tiene.
    if (pendingLock) {
      subscribePanel.hidden = true;
      passwordPanel.hidden = false;
    }
    syncSignatureVisibility();

    wireMailingListSync(subscribeForm);

    var phoneInput = subscribeForm.querySelector("#field_mobile_phone");
    var countrySelect = subscribeForm.querySelector("#field_country_region");
    var phoneIti = initPhoneField(phoneInput, countrySelect);

    // Al hacer click en cualquier punto del campo de fecha (no solo en el
    // icono del calendario) se abre directamente el selector nativo.
    var dobInput = subscribeForm.querySelector("#dob_picker");
    if (dobInput) {
      dobInput.addEventListener("click", function () {
        if (typeof dobInput.showPicker === "function") {
          try {
            dobInput.showPicker();
          } catch (e) {
            // Navegador sin soporte o llamada fuera de un gesto del
            // usuario: se ignora y el campo se comporta como siempre.
          }
        }
      });
    }

    subscribeForm.addEventListener("submit", function (evt) {
      evt.preventDefault();

      // Sustituye lo que haya escrito el usuario por el número completo en
      // formato internacional (+34...) que calcula intl-tel-input, para que
      // sea eso lo que se envíe en field_mobile_phone.
      if (phoneIti && phoneInput.value.trim()) {
        var internationalNumber = phoneIti.getNumber();
        if (internationalNumber) phoneInput.value = internationalNumber;
      }

      if (!subscribeForm.checkValidity()) {
        subscribeForm.classList.add("was-validated");
        var firstInvalid = subscribeForm.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      handleSubscribeSubmit(subscribeForm, subscribeMsg, function () {
        subscribePanel.hidden = true;
        successPanel.hidden = false;
        modalBody.classList.add("is-centered");
        syncSignatureVisibility();
      });
    });

    passwordForm.addEventListener("submit", function (evt) {
      evt.preventDefault();
      var value = passwordForm.elements.password.value.trim();
      if (value.toLowerCase() === SITE_CONFIG.password.toLowerCase()) {
        setPasswordVerified();
        closeModal();
        if (pendingLock) {
          openContentModal(pendingLock);
        } else {
          showToast("¡Contraseña correcta! Ya puedes acceder a los recuerdos desbloqueados.");
        }
      } else {
        passwordMsg.hidden = false;
        passwordMsg.textContent = "Contraseña incorrecta. Revisa el email de bienvenida.";
        passwordMsg.className = "form-msg is-error";
      }
    });

    openModal();
  }

  // ---------------------------------------------------------------
  // Checkboxes de consentimiento: sincronizar los campos ocultos
  // "triggered_sends" / "global_participants" / "virtual_participants"
  // de cada lista con el checkbox visible correspondiente.
  //
  // Reproduce el comportamiento que Sony añadió a form.html, con los ids
  // reales de nuestro formulario (los suyos, del tipo "#ts-for-ml-0", no
  // coinciden con ningún elemento del propio form.html ni del nuestro —
  // probablemente un desajuste en su ejemplo — así que aquí se usan los
  // ids completos que sí existen: "ts-for-mailing-list-id[N]", etc.).
  // ---------------------------------------------------------------

  function wireMailingListSync(form) {
    var checkboxes = form.querySelectorAll(".mailing-list-id");
    Array.prototype.forEach.call(checkboxes, function (checkbox) {
      var match = checkbox.id.match(/\[(\d+)\]$/);
      if (!match) return;
      var index = match[1];
      var relatedIds = [
        "ts-for-mailing-list-id[" + index + "]",
        "gp-for-mailing-list-id[" + index + "]",
        "vp-for-mailing-list-id[" + index + "]",
      ];
      checkbox.addEventListener("change", function () {
        relatedIds.forEach(function (id) {
          var el = form.querySelector('[id="' + id + '"]');
          if (el) el.checked = checkbox.checked;
        });
      });
    });
  }

  // ---------------------------------------------------------------
  // Teléfono: intl-tel-input, con detección de país por IP
  // ---------------------------------------------------------------

  // Servicio gratuito y sin clave para averiguar el país a partir de la IP
  // del visitante. Si falla (red, timeout, bloqueado...) se usa "es" como
  // valor por defecto, ya que el público de este sitio es mayoritariamente
  // de España.
  function geoIpCountryLookup() {
    return fetch("https://get.geojs.io/v1/ip/country.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return (data && data.country ? data.country : "ES").toLowerCase();
      })
      .catch(function () {
        return "es";
      });
  }

  function initPhoneField(phoneInput, countrySelect) {
    if (!phoneInput || typeof window.intlTelInput !== "function") return null;

    var iti = window.intlTelInput(phoneInput, {
      // Sin "initialCountry": así intl-tel-input espera a
      // initialCountryLookup en vez de ignorarlo.
      initialCountryLookup: geoIpCountryLookup,
      separateDialCode: true,
    });

    // Cuando se detecta (o el usuario cambia) el país del teléfono,
    // seleccionamos el mismo país en el desplegable "field_country_region"
    // de Sony, si existe como opción.
    phoneInput.addEventListener("countrychange", function (evt) {
      var country = evt.detail;
      if (!country || !country.iso2 || !countrySelect) return;
      var iso2Upper = country.iso2.toUpperCase();
      var hasOption = Array.prototype.some.call(countrySelect.options, function (opt) {
        return opt.value === iso2Upper;
      });
      if (hasOption) countrySelect.value = iso2Upper;
    });

    return iti;
  }

  function handleSubscribeSubmit(form, msgEl, onSuccess) {
    if (!SITE_CONFIG.subscribeEndpoint) {
      // El formulario de alta de Sony Music está desactivado temporalmente
      // (SITE_CONFIG.subscribeEndpoint a null). Dejamos avanzar igualmente
      // al paso de contraseña para poder seguir probando el resto del
      // flujo mientras tanto.
      msgEl.hidden = false;
      msgEl.className = "form-msg is-error";
      msgEl.textContent =
        "La suscripción no está activa todavía. En cuanto lo esté, recibirás la contraseña por email. Si ya la tienes, usa el enlace de arriba.";
      return;
    }

    msgEl.hidden = false;
    msgEl.className = "form-msg";
    msgEl.textContent = "Enviando...";

    // Igual que hace el ejemplo de Sony (form.html) con $(this).serialize():
    // se envía como application/x-www-form-urlencoded, con los mismos
    // nombres de campo que espera subs.sonymusicfans.com. FormData ya
    // excluye los checkboxes no marcados, igual que serialize().
    var body = new URLSearchParams(new FormData(form));

    fetch(SITE_CONFIG.subscribeEndpoint, {
      method: "POST",
      body: body,
      mode: "cors",
      credentials: "omit",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad-response");
        msgEl.className = "form-msg is-ok";
        msgEl.textContent = "¡Listo! Revisa tu correo para encontrar la contraseña.";
        setTimeout(onSuccess, 900);
      })
      .catch(function () {
        msgEl.className = "form-msg is-error";
        msgEl.textContent = "Ha ocurrido un error. Por favor, inténtalo más tarde.";
      });
  }

  // ---------------------------------------------------------------
  // Modal: contenido de un recuerdo desbloqueado
  // ---------------------------------------------------------------

  function openContentModal(lock) {
    var tpl = document.getElementById("tpl-content");
    var node = tpl.content.cloneNode(true);
    modalBody.innerHTML = "";
    modalBody.classList.remove("is-centered");
    modalBody.appendChild(node);

    var content = lock.content;
    modalBody.querySelector('[data-role="eyebrow"]').textContent = content.eyebrow || "";
    modalBody.querySelector('[data-role="title"]').textContent = content.title || "";

    var mediaEl = modalBody.querySelector('[data-role="media"]');
    var descriptionEl = modalBody.querySelector('[data-role="description"]');

    modalHint.hidden = true;
    modalHint.textContent = "";

    switch (content.type) {
      case "audio":
        mediaEl.appendChild(buildAudioPlayer(content.src));
        descriptionEl.textContent = content.description || "";
        break;
      case "video":
        mediaEl.appendChild(buildVideoPlayer(content.src, content.poster));
        descriptionEl.textContent = content.description || "";
        break;
      case "gallery":
        mediaEl.appendChild(buildGallery(content.images || []));
        if (content.description) {
          descriptionEl.textContent = content.description;
        } else {
          descriptionEl.remove();
        }
        if ((content.images || []).length > 0) {
          modalHint.textContent = "Haz click en las fotos para ampliar";
          modalHint.hidden = false;
        }
        break;
      case "text":
        var p = document.createElement("p");
        p.className = "manuscript-body";
        p.textContent = content.body || "";
        mediaEl.appendChild(p);
        descriptionEl.remove();
        break;
      default:
        descriptionEl.textContent = content.description || content.body || "";
    }

    openModal();
  }

  function buildAudioPlayer(src) {
    var wrap = document.createElement("div");
    wrap.className = "audio-player";

    var playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Reproducir");

    var current = document.createElement("span");
    current.className = "time";
    current.textContent = "00:00";

    var range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.value = "0";

    var duration = document.createElement("span");
    duration.className = "time";
    duration.textContent = "00:00";

    wrap.appendChild(playBtn);
    wrap.appendChild(current);
    wrap.appendChild(range);
    wrap.appendChild(duration);

    if (!src) return wrap;

    var audio = new Audio(src);

    playBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play();
        playBtn.textContent = "❚❚";
      } else {
        audio.pause();
        playBtn.textContent = "▶";
      }
    });

    audio.addEventListener("loadedmetadata", function () {
      duration.textContent = formatTime(audio.duration);
      range.max = String(Math.floor(audio.duration));
    });

    audio.addEventListener("timeupdate", function () {
      current.textContent = formatTime(audio.currentTime);
      range.value = String(Math.floor(audio.currentTime));
    });

    audio.addEventListener("ended", function () {
      playBtn.textContent = "▶";
    });

    range.addEventListener("input", function () {
      audio.currentTime = Number(range.value);
    });

    return wrap;
  }

  function buildVideoPlayer(src, poster) {
    var video = document.createElement("video");
    video.controls = true;
    if (poster) video.poster = poster;
    if (src) video.src = src;
    return video;
  }

  // Posiciones/rotaciones fijas para el "collage" de fotos superpuestas
  // (se repiten en bucle si hay más fotos que posiciones definidas).
  var COLLAGE_POSITIONS = [
    { left: "38%", top: "42%", rot: -6 },
    { left: "62%", top: "56%", rot: 5 },
    { left: "48%", top: "66%", rot: -3 },
    { left: "68%", top: "38%", rot: 7 },
    { left: "30%", top: "60%", rot: 3 },
    { left: "56%", top: "34%", rot: -8 },
  ];

  function buildGallery(images) {
    var wrap = document.createElement("div");

    if (images.length > 1) {
      wrap.appendChild(buildCollage(images));
    } else if (images.length === 1) {
      var grid = document.createElement("div");
      grid.className = "gallery-grid";
      var img = document.createElement("img");
      img.src = images[0].src;
      img.alt = images[0].alt || "";
      img.addEventListener("click", function () {
        openLightbox(images, 0);
      });
      grid.appendChild(img);
      wrap.appendChild(grid);
    }

    return wrap;
  }

  // Varias fotos: en vez de una rejilla, se apilan como un collage de
  // postales (superpuestas, giradas y con un trocito de cinta), como en
  // el mockup. Al pulsar en cualquier punto del collage se abre la
  // primera foto en el visor grande, desde donde se navega con
  // izquierda/derecha entre todas.
  function buildCollage(images) {
    var collage = document.createElement("div");
    collage.className = "gallery-collage";

    images.forEach(function (image, index) {
      var pos = COLLAGE_POSITIONS[index % COLLAGE_POSITIONS.length];

      var item = document.createElement("div");
      item.className = "collage-item";
      item.style.left = pos.left;
      item.style.top = pos.top;
      item.style.setProperty("--rot", pos.rot + "deg");
      item.style.zIndex = String(index + 1);

      var tape = document.createElement("span");
      tape.className = "collage-tape";
      item.appendChild(tape);

      var img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt || "";
      item.appendChild(img);

      collage.appendChild(item);
    });

    collage.addEventListener("click", function () {
      openLightbox(images, 0);
    });

    return collage;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "00:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  // ---------------------------------------------------------------
  // Lightbox para la galería: foto grande, con navegación
  // izquierda/derecha cuando hay más de una.
  // ---------------------------------------------------------------

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxPrevBtn = document.getElementById("lightbox-prev");
  var lightboxNextBtn = document.getElementById("lightbox-next");

  var lightboxImages = [];
  var lightboxIndex = 0;

  function openLightbox(images, startIndex) {
    lightboxImages = images;
    lightboxIndex = startIndex || 0;
    renderLightboxImage();
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    lightboxImages = [];
  }

  function renderLightboxImage() {
    var image = lightboxImages[lightboxIndex];
    if (!image) return;
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt || "";
    var hasMultiple = lightboxImages.length > 1;
    lightboxPrevBtn.hidden = !hasMultiple;
    lightboxNextBtn.hidden = !hasMultiple;
  }

  function showPrevImage() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    renderLightboxImage();
  }

  function showNextImage() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    renderLightboxImage();
  }

  lightbox.addEventListener("click", function (evt) {
    if (evt.target === lightbox || evt.target === lightboxImg) closeLightbox();
  });

  lightboxPrevBtn.addEventListener("click", function (evt) {
    evt.stopPropagation();
    showPrevImage();
  });

  lightboxNextBtn.addEventListener("click", function (evt) {
    evt.stopPropagation();
    showNextImage();
  });

  document.addEventListener("keydown", function (evt) {
    if (lightbox.hidden) return;
    if (evt.key === "Escape") closeLightbox();
    else if (evt.key === "ArrowLeft" && lightboxImages.length > 1) showPrevImage();
    else if (evt.key === "ArrowRight" && lightboxImages.length > 1) showNextImage();
  });

  // ---------------------------------------------------------------
  // Móvil: la escena ocupa toda la altura y se desplaza en horizontal.
  // Mostramos una pista y un pequeño auto-scroll de cortesía al cargar,
  // que se cancela en cuanto el usuario toca/hace scroll por su cuenta.
  // ---------------------------------------------------------------

  var stageWrapper = document.getElementById("stage-wrapper");
  var scrollHint = document.getElementById("scroll-hint");
  var mobileQuery = window.matchMedia("(max-width: 900px)");

  function initMobileAutoScroll() {
    if (!mobileQuery.matches) return;

    var cancelled = false;
    function cancel() {
      if (cancelled) return;
      cancelled = true;
      hideHint();
      ["pointerdown", "touchstart", "wheel"].forEach(function (evt) {
        stageWrapper.removeEventListener(evt, cancel);
      });
    }
    ["pointerdown", "touchstart", "wheel"].forEach(function (evt) {
      stageWrapper.addEventListener(evt, cancel, { passive: true });
    });

    function hideHint() {
      if (scrollHint) scrollHint.classList.add("is-hidden");
    }

    // La pista desaparece sola pasado un rato, se haya usado o no.
    setTimeout(hideHint, 5000);

    setTimeout(function () {
      if (cancelled) return;
      var maxScroll = stageWrapper.scrollWidth - stageWrapper.clientWidth;
      if (maxScroll <= 0) return;

      var start = null;
      var duration = 1600;
      var target = Math.min(maxScroll, stageWrapper.clientWidth * 0.55);

      function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function step(timestamp) {
        if (cancelled) return;
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        stageWrapper.scrollLeft = easeInOutQuad(progress) * target;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setTimeout(function () {
            if (cancelled) return;
            var backStart = null;
            function stepBack(ts) {
              if (cancelled) return;
              if (backStart === null) backStart = ts;
              var p = Math.min((ts - backStart) / duration, 1);
              stageWrapper.scrollLeft = (1 - easeInOutQuad(p)) * target;
              if (p < 1) requestAnimationFrame(stepBack);
            }
            requestAnimationFrame(stepBack);
          }, 500);
        }
      }
      requestAnimationFrame(step);
    }, 900);
  }

  initMobileAutoScroll();
})();
