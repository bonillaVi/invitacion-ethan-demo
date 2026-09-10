(() => {
  "use strict";

  // DEMO CLIENTES: esta versión no guarda ni envía datos a ningún servidor.
  // iPhone/Safari: restaurar la escala y el viewport después de cerrar el teclado.
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const lockedViewport = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  if (viewportMeta) viewportMeta.setAttribute("content", lockedViewport);

  function restoreIOSViewport() {
    if (viewportMeta) viewportMeta.setAttribute("content", lockedViewport);
    const x = window.scrollX || 0;
    const y = window.scrollY || 0;
    requestAnimationFrame(() => {
      window.scrollTo(x, y);
      setTimeout(() => window.scrollTo(x, y), 60);
      setTimeout(() => window.scrollTo(x, y), 250);
    });
  }


  document.querySelectorAll(".v131-rsvp").forEach(section => {
    const eventName = section.dataset.event || "Evento";
    const entry = section.querySelector(".v132-rsvp-entry");
    const form = section.querySelector(".v132-rsvp-form");
    const thanks = section.querySelector(".v132-rsvp-thanks");
    const choices = [...section.querySelectorAll(".v131-choice")];
    const answerInput = form.querySelector('input[name="respuesta"]');
    const nameInput = form.querySelector('input[name="nombre"]');
    const guestsWrap = form.querySelector(".v131-guests-wrap");
    const guestsInput = form.querySelector('input[name="personas"]');
    const submit = form.querySelector(".v131-submit");
    const back = form.querySelector(".v132-back");
    const status = form.querySelector(".v131-status");

    [nameInput, guestsInput].forEach(input => {
      if (!input) return;
      input.addEventListener("focus", () => {
        if (viewportMeta) viewportMeta.setAttribute("content", lockedViewport);
      }, {passive:true});
      input.addEventListener("blur", () => {
        setTimeout(restoreIOSViewport, 80);
      }, {passive:true});
    });

    function openForm(answer) {
      answerInput.value = answer;
      const attending = answer === "Asistiré";

      choices.forEach(btn =>
        btn.classList.toggle("is-selected", btn.dataset.value === answer)
      );

      // Solo ASISTIRÉ muestra número de personas.
      if (attending) {
        guestsWrap.hidden = false;
        guestsWrap.style.display = "";
        guestsInput.disabled = false;
        guestsInput.required = true;
        if (!guestsInput.value || Number(guestsInput.value) < 1) guestsInput.value = "1";
      } else {
        guestsWrap.hidden = true;
        guestsWrap.style.display = "none";
        guestsInput.disabled = true;
        guestsInput.required = false;
        guestsInput.value = "0";
      }

      submit.textContent = attending
        ? submit.dataset.yesText
        : submit.dataset.noText;

      status.textContent = "";
      entry.classList.add("is-collapsed");
      form.hidden = false;

      requestAnimationFrame(() => form.classList.add("is-open"));

      // iPhone/Safari: el enfoque automático abre el teclado y puede alterar
      // la escala del viewport. En equipos táctiles dejamos que el invitado
      // toque el campo cuando quiera escribir. En escritorio conservamos foco.
      const isTouchDevice = window.matchMedia?.("(pointer: coarse)")?.matches ||
        (navigator.maxTouchPoints || 0) > 0;
      if (!isTouchDevice) {
        setTimeout(() => nameInput.focus({preventScroll:true}), 220);
      }
    }

    function resetChoice() {
      form.classList.remove("is-open");
      setTimeout(() => {
        form.hidden = true;
        entry.classList.remove("is-collapsed");
        answerInput.value = "";
        choices.forEach(btn => btn.classList.remove("is-selected"));
        status.textContent = "";
      }, 220);
    }

    choices.forEach(btn => btn.addEventListener("click", () => openForm(btn.dataset.value || "")));
    back.addEventListener("click", resetChoice);

    form.addEventListener("submit", async e => {
      e.preventDefault();

      // Cierra teclado/foco antes de cambiar la vista de confirmación en móvil.
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      restoreIOSViewport();

      const name = nameInput.value.trim();
      const answer = answerInput.value;
      let people = Number(guestsInput.value || 0);

      if (!name) {
        status.textContent = "Escribe tu nombre para continuar.";
        nameInput.focus();
        return;
      }
      if (!answer) {
        status.textContent = "Selecciona ASISTIRÉ o NO ASISTIRÉ.";
        return;
      }
      if (answer === "Asistiré" && (!Number.isFinite(people) || people < 1)) {
        status.textContent = "Indica cuántas personas asistirán.";
        return;
      }
      if (answer !== "Asistiré") people = 0;

      submit.disabled = true;
      back.disabled = true;
      status.textContent = "Procesando demostración…";

      // DEMO CLIENTES: simulación 100 % local.
      // No se realiza ninguna petición de red ni se persisten datos.
      setTimeout(() => {
        if (answer === "Asistiré") lanzarConfeti();

        form.hidden = true;
        thanks.hidden = false;
        thanks.innerHTML = answer === "Asistiré"
          ? `<strong>¡Demostración completada!</strong><span>En una invitación real, aquí se registraría la confirmación del invitado.</span>`
          : `<strong>Demostración completada.</strong><span>En una invitación real, aquí se registraría la respuesta del invitado.</span>`;

        nameInput.value = "";
        guestsInput.value = "1";
        answerInput.value = "";
        status.textContent = "";
        submit.disabled = false;
        back.disabled = false;
      }, 450);
    });
  });

  function lanzarConfeti() {
    const previo = document.getElementById("rsvpConfettiCanvas");
    if (previo) previo.remove();

    const canvas = document.createElement("canvas");
    canvas.id = "rsvpConfettiCanvas";
    canvas.setAttribute("aria-hidden","true");
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    resize();

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const colors = ["#ff304f","#168cff","#ffd54a","#ffffff","#58d68d","#ff7bd5"];
    const total = window.innerWidth <= 650 ? 120 : 170;

    const pieces = Array.from({length:total}, () => ({
      x: Math.random() * W(),
      y: H() + 15 + Math.random() * 60,
      vx: (Math.random() - .5) * 7.4,
      vy: -(12 + Math.random() * 13),
      gravity: .28 + Math.random() * .16,
      drag: .992,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      r: Math.random() * Math.PI,
      vr: (Math.random() - .5) * .28,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    }));

    let start = performance.now();

    function frame(now){
      const elapsed = now - start;
      ctx.clearRect(0,0,W(),H());

      for (const p of pieces){
        p.vx *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;

        if (elapsed > 2200) {
          p.life = Math.max(0, 1 - (elapsed - 2200) / 900);
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x,p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        ctx.restore();
      }

      if (elapsed < 3200) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        window.removeEventListener("resize", resize);
      }
    }

    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }

})();
