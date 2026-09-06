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
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", function (evt) {
    if (evt.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", function (evt) {
    if (evt.key === "Escape" && !modalBackdrop.hidden) closeModal();
  });

  // ---------------------------------------------------------------
  // Posicionar el botón "Regístrate para acceder" sobre el papel
  // rasgado que forma parte de assets/images/logo_home_txt.png
  // ---------------------------------------------------------------

  function layoutRegistrateButton() {
    var rect = logoOverlay.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var top = rect.top - stageRect.top + rect.height * 0.83;
    var left = rect.left - stageRect.left + rect.width * 0.01;
    var width = rect.width * 0.93;
    var height = rect.height * 0.16;
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

    if (lock.unlocked && lock.label) {
      var labelWrap = document.createElement("span");
      labelWrap.className = "lock-label";
      var titleEl = document.createElement("span");
      titleEl.className = "lock-title";
      titleEl.textContent = lock.label.title || "";
      labelWrap.appendChild(titleEl);
      if (lock.label.subtitle) {
        var subtitleEl = document.createElement("span");
        subtitleEl.className = "lock-subtitle";
        subtitleEl.textContent = lock.label.subtitle;
        labelWrap.appendChild(subtitleEl);
      }
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
    modalBody.appendChild(node);

    var subscribePanel = modalBody.querySelector(".panel-subscribe");
    var passwordPanel = modalBody.querySelector(".panel-password");
    var showPasswordBtn = modalBody.querySelector('[data-action="show-password"]');
    var subscribeForm = modalBody.querySelector(".subscribe-form");
    var subscribeMsg = modalBody.querySelector('[data-role="form-msg"]');
    var passwordForm = modalBody.querySelector(".password-form");
    var passwordMsg = modalBody.querySelector('[data-role="password-msg"]');

    showPasswordBtn.addEventListener("click", function () {
      subscribePanel.hidden = true;
      passwordPanel.hidden = false;
    });

    subscribeForm.addEventListener("submit", function (evt) {
      evt.preventDefault();
      handleSubscribeSubmit(subscribeForm, subscribeMsg, function () {
        subscribePanel.hidden = true;
        passwordPanel.hidden = false;
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

  function handleSubscribeSubmit(form, msgEl, onSuccess) {
    var data = {
      nombre: form.elements.nombre.value.trim(),
      apellidos: form.elements.apellidos.value.trim(),
      email: form.elements.email.value.trim(),
      ciudad: form.elements.ciudad.value.trim(),
      provincia: form.elements.provincia.value.trim(),
      pais: form.elements.pais.value.trim(),
      fecha_nacimiento: form.elements.fecha_nacimiento.value,
      consentimiento_privacidad: form.elements.consentimiento_privacidad.checked,
      consentimiento_comercial: form.elements.consentimiento_comercial.checked,
    };

    if (!data.nombre || !data.apellidos || !data.email || !data.consentimiento_privacidad) {
      msgEl.hidden = false;
      msgEl.className = "form-msg is-error";
      msgEl.textContent = "Completa los campos obligatorios y acepta la política de privacidad.";
      return;
    }

    if (!SITE_CONFIG.subscribeEndpoint) {
      // El formulario de alta de Sony Music todavía no está disponible.
      // Dejamos avanzar igualmente al paso de contraseña para poder
      // seguir probando el resto del flujo mientras se integra.
      msgEl.hidden = false;
      msgEl.className = "form-msg is-error";
      msgEl.textContent =
        "La suscripción no está activa todavía. En cuanto lo esté, recibirás la contraseña por email. Si ya la tienes, usa el enlace de arriba.";
      return;
    }

    msgEl.hidden = false;
    msgEl.className = "form-msg";
    msgEl.textContent = "Enviando...";

    fetch(SITE_CONFIG.subscribeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad-response");
        msgEl.className = "form-msg is-ok";
        msgEl.textContent = "¡Listo! Revisa tu correo para encontrar la contraseña.";
        setTimeout(onSuccess, 900);
      })
      .catch(function () {
        msgEl.className = "form-msg is-error";
        msgEl.textContent = "No se ha podido completar el registro. Inténtalo de nuevo más tarde.";
      });
  }

  // ---------------------------------------------------------------
  // Modal: contenido de un recuerdo desbloqueado
  // ---------------------------------------------------------------

  function openContentModal(lock) {
    var tpl = document.getElementById("tpl-content");
    var node = tpl.content.cloneNode(true);
    modalBody.innerHTML = "";
    modalBody.appendChild(node);

    var content = lock.content;
    modalBody.querySelector('[data-role="eyebrow"]').textContent = content.eyebrow || "";
    modalBody.querySelector('[data-role="title"]').textContent = content.title || "";

    var mediaEl = modalBody.querySelector('[data-role="media"]');
    var descriptionEl = modalBody.querySelector('[data-role="description"]');

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
        descriptionEl.remove();
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

  function buildGallery(images) {
    var wrap = document.createElement("div");

    var grid = document.createElement("div");
    grid.className = "gallery-grid";

    images.forEach(function (image) {
      var img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt || "";
      img.addEventListener("click", function () {
        openLightbox(image.src, image.alt || "");
      });
      grid.appendChild(img);
    });

    var hint = document.createElement("p");
    hint.className = "gallery-hint";
    hint.textContent = "Haz click en las fotos para ampliar";

    wrap.appendChild(grid);
    wrap.appendChild(hint);
    return wrap;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "00:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  // ---------------------------------------------------------------
  // Lightbox para la galería
  // ---------------------------------------------------------------

  var lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.hidden = true;
  var lightboxImg = document.createElement("img");
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
  }

  lightbox.addEventListener("click", function () {
    lightbox.hidden = true;
    lightboxImg.src = "";
  });
})();
