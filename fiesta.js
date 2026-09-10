
(() => {
  "use strict";

  const init = () => {
    const openBtn = document.getElementById("openPartyV122");
    const closeBtn = document.getElementById("closePartyV124");
    const view = document.getElementById("partyViewV124");
    if (!openBtn || !closeBtn || !view) return;

    const setOpen = (open, updateHash = true) => {
      view.classList.toggle("is-visible", open);
      view.setAttribute("aria-hidden", open ? "false" : "true");
      document.documentElement.classList.toggle("party-open", open);
      document.body.classList.toggle("party-open", open);

      if (open) {
        view.scrollTop = 0;
        if (updateHash && location.hash !== "#partyViewV124") {
          history.replaceState(null, "", "#partyViewV124");
        }
      } else if (updateHash && location.hash === "#partyViewV124") {
        history.replaceState(null, "", "#eventDetails");
      }
    };

    openBtn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    });

    closeBtn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && view.classList.contains("is-visible")) setOpen(false);
    });

    window.addEventListener("hashchange", () => {
      setOpen(location.hash === "#partyViewV124", false);
    });

    if (location.hash === "#partyViewV124") setOpen(true, false);

    const timer = view.querySelector(".v124-party-countdown");
    const tick = () => {
      if (!timer) return;
      let diff = Math.max(0, new Date(timer.dataset.target).getTime() - Date.now());
      const values = { d: Math.floor(diff / 86400000) };
      diff %= 86400000;
      values.h = Math.floor(diff / 3600000);
      diff %= 3600000;
      values.m = Math.floor(diff / 60000);
      diff %= 60000;
      values.s = Math.floor(diff / 1000);

      Object.entries(values).forEach(([u,v]) => {
        const el = timer.querySelector(`[data-party-u="${u}"]`);
        if (el) el.textContent = String(v).padStart(2,"0");
      });
    };

    tick();
    setInterval(tick,1000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();
