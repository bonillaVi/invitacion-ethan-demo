
(() => {
  "use strict";

  const init = () => {
    const openBtn = document.getElementById("openBaptismV102");
    const closeBtn = document.getElementById("closeBaptismV102");
    const view = document.getElementById("baptismViewV102");

    if (!openBtn || !closeBtn || !view) {
      console.error("[Bautizo] Faltan elementos esenciales.");
      return;
    }

    const setOpen = (open, updateHash = true) => {
      view.classList.toggle("is-visible", open);
      view.setAttribute("aria-hidden", open ? "false" : "true");
      document.documentElement.classList.toggle("bautizo-open", open);
      document.body.classList.toggle("bautizo-open", open);

      if (open) {
        view.scrollTop = 0;
        if (updateHash && location.hash !== "#baptismViewV102") {
          history.replaceState(null, "", "#baptismViewV102");
        }
      } else if (updateHash && location.hash === "#baptismViewV102") {
        history.replaceState(null, "", "#eventDetails");
      }
    };

    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    });

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && view.classList.contains("is-visible")) {
        setOpen(false);
      }
    });

    window.addEventListener("hashchange", () => {
      setOpen(location.hash === "#baptismViewV102", false);
    });

    if (location.hash === "#baptismViewV102") {
      setOpen(true, false);
    }

    const timer = view.querySelector(".v102-baptism-countdown");

    const tick = () => {
      if (!timer) return;
      let diff = Math.max(
        0,
        new Date(timer.dataset.target).getTime() - Date.now()
      );

      const values = {
        d: Math.floor(diff / 86400000)
      };
      diff %= 86400000;
      values.h = Math.floor(diff / 3600000);
      diff %= 3600000;
      values.m = Math.floor(diff / 60000);
      diff %= 60000;
      values.s = Math.floor(diff / 1000);

      Object.entries(values).forEach(([unit, value]) => {
        const el = timer.querySelector(`[data-v102-u="${unit}"]`);
        if (el) el.textContent = String(value).padStart(2, "0");
      });
    };

    tick();
    window.setInterval(tick, 1000);

    console.info("[Bautizo] Módulo inicializado correctamente.");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
