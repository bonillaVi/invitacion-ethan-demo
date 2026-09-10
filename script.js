
/* ==========================================================
   V150 — PORTADA → TOQUE → VIDEO+SONIDO → WELCOME → MÚSICA 2
   ========================================================== */
(() => {
  const WELCOME_AT = 3.0;
  const CTA_TRANSITION_MS = 690;

  function initV150(){
    const body=document.body;
    const intro=document.getElementById("intro");
    const startBtn=document.getElementById("v150StartExperience");
    const video=document.getElementById("heroVideo");
    const overlay=document.getElementById("cinemaOverlay");
    const welcome=document.getElementById("welcome");
    const cta=document.getElementById("atomicCta");
    const details=document.getElementById("eventDetails");
    const bgMusic=document.getElementById("bgMusic");
    const musicToggle=document.getElementById("musicToggle");

    if(!intro||!startBtn||!video||!welcome||!cta||!details||!bgMusic)return;

    let mode="gate";
    let muted=false;
    let welcomeShown=false;
    let ctaBusy=false;

    body.classList.remove("video-visible","video-fading-in","v80-video-started",
      "v80-welcome-visible","details-open","v146-audio-muted","v150-started");

    details.setAttribute("aria-hidden","true");
    welcome.classList.remove("is-visible");
    welcome.setAttribute("aria-hidden","true");
    if(overlay)overlay.classList.remove("is-dark");

    video.pause();
    video.currentTime=0;
    video.muted=false;
    video.defaultMuted=false;
    video.volume=.86;
    video.playsInline=true;
    video.setAttribute("playsinline","");
    video.setAttribute("webkit-playsinline","");
    video.preload="auto";

    bgMusic.pause();
    bgMusic.currentTime=0;
    bgMusic.loop=true;
    bgMusic.preload="auto";
    bgMusic.volume=.58;

    function updateToggle(){
      body.classList.toggle("v146-audio-muted",muted);
      if(musicToggle){
        musicToggle.setAttribute("aria-pressed", muted ? "true" : "false");
        musicToggle.setAttribute("aria-label", muted ? "Activar música" : "Silenciar música");
        musicToggle.setAttribute("title", muted ? "Activar música" : "Silenciar música");
        const icon=musicToggle.querySelector(".v146-music-icon");
        if(icon) icon.textContent = muted ? "×" : "♫";
      }
    }

    if(musicToggle){
      musicToggle.addEventListener("click",async e=>{
        e.preventDefault();
        e.stopPropagation();
        if(mode === "gate") return;

        muted=!muted;

        if(mode === "video"){
          video.muted=muted;
        }else if(mode === "background"){
          if(muted){
            bgMusic.pause();
          }else{
            bgMusic.muted=false;
            bgMusic.volume=.58;
            try{ await bgMusic.play(); }catch(_){}
          }
        }

        updateToggle();
      });
    }

    function showWelcome(){
      if(welcomeShown)return;
      welcomeShown=true;
      body.classList.add("v80-welcome-visible");
      if(overlay)overlay.classList.add("is-dark");
      welcome.classList.add("is-visible");
      welcome.setAttribute("aria-hidden","false");
    }

    video.addEventListener("timeupdate",()=>{
      if(!welcomeShown&&video.currentTime>=WELCOME_AT)showWelcome();
    });

    /* ÚNICO TOQUE INICIAL:
       inicia el video desde cero y con su audio original.
       Este gesto cumple la política de iPhone/Safari. */
    startBtn.addEventListener("click",async e=>{
      e.preventDefault();
      e.stopPropagation();
      if(mode!=="gate")return;

      mode="video";
      body.classList.add("v150-started");

      try{video.currentTime=0}catch(_){}
      video.muted=false;
      video.defaultMuted=false;
      video.volume=.86;

      try{
        await video.play();
      }catch(_){
        /* Fallback visual solamente si el navegador falla incluso con gesto. */
        video.muted=true;
        muted=true;
        try{await video.play()}catch(__){}
      }

      requestAnimationFrame(()=>{
        body.classList.add("video-fading-in","v80-video-started");
        intro.classList.add("is-leaving");
      });

      setTimeout(()=>{
        body.classList.remove("video-fading-in");
        body.classList.add("video-visible");
        intro.style.visibility="hidden";
      },1570);

      updateToggle();
    });

    /* Botón TOCA PARA CONTINUAR:
       arranca desde 0 la segunda canción recortada. */
    cta.addEventListener("click",async e=>{
      e.preventDefault();
      if(ctaBusy)return;

      ctaBusy=true;
      mode="background";
      cta.classList.add("is-activating");

      if(!muted){
        try{
          bgMusic.pause();
          bgMusic.currentTime=0;
          bgMusic.volume=.001;
          await bgMusic.play();
        }catch(_){}
      }

      let layer=document.querySelector(".atomic-transition-layer");
      if(!layer){
        layer=document.createElement("div");
        layer.className="atomic-transition-layer";
        document.body.appendChild(layer);
      }
      setTimeout(()=>layer.classList.add("is-active"),120);

      const start=performance.now();
      const duration=720;
      const videoVol=video.volume||.86;
      const target=.58;

      function fade(now){
        const p=Math.min(1,(now-start)/duration);

        if(!video.muted&&!muted){
          video.volume=Math.max(0,videoVol*(1-p));
        }
        if(!muted&&!bgMusic.paused){
          bgMusic.volume=.001+(target-.001)*p;
        }

        if(p<1){
          requestAnimationFrame(fade);
        }else{
          video.pause();
          video.muted=true;
          video.volume=.86;
          if(!muted&&!bgMusic.paused)bgMusic.volume=target;
        }
      }
      requestAnimationFrame(fade);

      setTimeout(()=>{
        body.classList.add("details-open");
        details.setAttribute("aria-hidden","false");
        window.scrollTo({top:0,left:0,behavior:"auto"});
      },CTA_TRANSITION_MS);

      setTimeout(()=>{
        layer.classList.remove("is-active");
        cta.classList.remove("is-activating");
        ctaBusy=false;
      },1250);
    });


    /* V152 — BUCLE CONTINUO DE AUDIO
       Si termina el video inicial mientras seguimos en esa etapa,
       vuelve a empezar desde 0 con el mismo estado de sonido.
       Así su audio original tampoco se corta. */
    video.loop = false;
    video.addEventListener("ended", async ()=>{
      if(mode !== "video") return;

      try{
        video.currentTime = 0;
        video.muted = muted;
        await video.play();
      }catch(_){}
    });

    /* La segunda canción se mantiene en loop permanente durante
       selector, Bautizo y Fiesta. */
    bgMusic.loop = true;

    bgMusic.addEventListener("ended", async ()=>{
      if(mode !== "background" || muted) return;

      try{
        bgMusic.currentTime = 0;
        await bgMusic.play();
      }catch(_){}
    });

    updateToggle();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initV150,{once:true});
  }else{
    initV150();
  }
})();


// v93 — live countdown to Ethan's event (Ixtapaluca/CDMX time, UTC-6 on Oct 31 2026)
(function(){
  const target = new Date('2026-10-31T00:00:00-06:00').getTime();
  const ids = ['cdDays','cdHours','cdMinutes','cdSeconds'];
  const els = ids.map(id => document.getElementById(id));
  if (els.some(el => !el)) return;
  function tick(){
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const sec = Math.floor(diff / 1000);
    [d,h,m,sec].forEach((v,i)=> els[i].textContent = String(v).padStart(2,'0'));
  }
  tick(); setInterval(tick,1000);
})();


/* =========================================================
   V94 — PRUEBA RÁPIDA POST-BOTÓN
   ========================================================= */
(() => {
  const target = new Date("2026-10-31T00:00:00-06:00").getTime();

  function updateCountdown(){
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);

    const put = (id,v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v).padStart(2,"0");
    };
    put("cdDays",days);
    put("cdHours",hours);
    put("cdMinutes",minutes);
    put("cdSeconds",seconds);
  }

  function initCards_OLD_DISABLED(){
    const cards = [...document.querySelectorAll(".mission-card")];
    cards.forEach(card => {
      const cover = card.querySelector(".mission-cover");
      if (!cover) return;
      cover.addEventListener("click", () => {
        const opening = !card.classList.contains("is-open");
        cards.forEach(c => c.classList.remove("is-open"));
        if (opening){
          card.classList.add("is-open");
          setTimeout(() => card.scrollIntoView({behavior:"smooth",block:"center"}),120);
        }
      });
    });
  }

  function init(){
    updateCountdown();
    setInterval(updateCountdown,1000);
    /* old card handler disabled in V100 */
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else init();
})();


/* V98 — apertura robusta de cards en iPhone/Safari */
(() => {
  const cards = [...document.querySelectorAll(".mission-card")];

  function openCard(card){
    cards.forEach(c => {
      if(c !== card) c.classList.remove("is-open","is-fullscreen");
    });
    card.classList.add("is-open","is-fullscreen");
    document.body.classList.add("mission-fullscreen-open");
    document.documentElement.classList.add("mission-fullscreen-open");
    requestAnimationFrame(() => {
      const detail = card.querySelector(".mission-detail");
      if(detail) detail.scrollTop = 0;
    });
  }

  function closeCard(card){
    card.classList.remove("is-open","is-fullscreen");
    document.body.classList.remove("mission-fullscreen-open");
    document.documentElement.classList.remove("mission-fullscreen-open");
  }

  document.addEventListener("click", (e) => {
    const close = e.target.closest(".mission-close");
    if(close){
      e.preventDefault();
      e.stopImmediatePropagation();
      const card = close.closest(".mission-card");
      if(card) closeCard(card);
      return;
    }

    if(e.target.closest(".mission-detail a")) return;

    const card = e.target.closest(".mission-card");
    if(card && !card.classList.contains("is-fullscreen")){
      e.preventDefault();
      e.stopImmediatePropagation();
      openCard(card);
    }
  }, true);

  // iOS: make cards explicitly keyboard/touch interactive
  cards.forEach(card => {
    card.setAttribute("role","button");
    card.setAttribute("tabindex","0");
    card.addEventListener("keydown", e => {
      if((e.key==="Enter" || e.key===" ") && !card.classList.contains("is-fullscreen")){
        e.preventDefault(); openCard(card);
      }
    });
  });

  function tickCard(el){
    let diff=Math.max(0,new Date(el.dataset.target).getTime()-Date.now());
    const vals={d:Math.floor(diff/86400000)};
    diff%=86400000; vals.h=Math.floor(diff/3600000);
    diff%=3600000; vals.m=Math.floor(diff/60000);
    diff%=60000; vals.s=Math.floor(diff/1000);
    Object.entries(vals).forEach(([u,v])=>{
      const n=el.querySelector(`[data-u="${u}"]`);
      if(n)n.textContent=String(v).padStart(2,"0");
    });
  }
  function tickAll(){ document.querySelectorAll(".card-countdown").forEach(tickCard); }
  tickAll(); setInterval(tickAll,1000);
})();


/* V100 — selector limpio: Bautizo y Fiesta permanecen visibles */
(() => {
  function normalizeSelector(){
    if(document.body.classList.contains("mission-fullscreen-open")) return;
    document.querySelectorAll(".mission-card").forEach(card => {
      card.classList.remove("is-open","is-fullscreen");
      card.style.removeProperty("grid-column");
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", normalizeSelector, {once:true});
  } else {
    normalizeSelector();
  }

  window.addEventListener("pageshow", normalizeSelector);
})();


/* V101 — sane fullscreen state across viewport sizes */
(() => {
  const clearAll = () => {
    document.querySelectorAll(".mission-card").forEach(c => c.classList.remove("is-open","is-fullscreen"));
    document.body.classList.remove("mission-fullscreen-open");
    document.documentElement.classList.remove("mission-fullscreen-open");
  };

  window.addEventListener("pageshow", () => {
    if (!location.hash) clearAll();
  });

  window.addEventListener("resize", () => {
    const opened = document.querySelector(".mission-card.is-fullscreen");
    if(opened){
      document.body.classList.add("mission-fullscreen-open");
      document.documentElement.classList.add("mission-fullscreen-open");
    }
  });
})();


/* =========================================================
   V135 — VOLVER AL INICIO + ESTADO LIMPIO AL RECARGAR
   ========================================================= */
(() => {
  function closeDetailViews(){
    const baptism = document.getElementById("baptismViewV102");
    const party = document.getElementById("partyViewV124");

    if (baptism) {
      baptism.classList.remove("is-visible");
      baptism.setAttribute("aria-hidden","true");
    }

    if (party) {
      party.classList.remove("is-visible");
      party.setAttribute("aria-hidden","true");
    }

    document.body.classList.remove("v102-view-open","v124-party-open","mission-fullscreen-open");
    document.documentElement.classList.remove("mission-fullscreen-open");
  }

  function goHome(){
    closeDetailViews();

    const body = document.body;
    const details = document.getElementById("eventDetails");
    const intro = document.getElementById("intro");
    const welcome = document.getElementById("welcome");
    const overlay = document.getElementById("cinemaOverlay");
    const video = document.getElementById("heroVideo");

    body.classList.remove(
      "details-open",
      "test-mode",
      "video-visible",
      "video-fading-in",
      "v80-video-started",
      "v80-welcome-visible"
    );

    if (details) details.setAttribute("aria-hidden","true");

    if (welcome) {
      welcome.classList.remove("is-visible");
      welcome.setAttribute("aria-hidden","true");
    }

    if (overlay) overlay.classList.remove("is-dark");

    if (intro) {
      intro.style.removeProperty("display");
      intro.style.removeProperty("visibility");
      intro.classList.remove("is-leaving");
    }

    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
        video.load();
      } catch(e) {}
    }

    history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({top:0,left:0,behavior:"auto"});

    // Recargar reinicia también los temporizadores de intro de forma limpia.
    setTimeout(() => location.reload(), 80);
  }

  function init(){
    const btn = document.getElementById("v135HomeBtn");
    if (btn) btn.addEventListener("click", goHome);

    // Si el navegador restaura la página desde caché, no conservar estados de prueba.
    window.addEventListener("pageshow", e => {
      if (e.persisted) {
        document.body.classList.remove("test-mode");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();


/* =========================================================
   V138 — PARTÍCULAS FLOTANDO / CAYENDO EN LA PORTADA
   ========================================================= */
(() => {
  function initV138Particles(){
    const welcome = document.getElementById("welcome");
    if (!welcome || welcome.querySelector(".v138-particles")) return;

    const layer = document.createElement("div");
    layer.className = "v138-particles";
    layer.setAttribute("aria-hidden","true");

    const cantidad = window.innerWidth <= 430 ? 28 : 42;
    const tipos = ["is-blue","is-red","is-gold","is-soft"];

    for(let i=0;i<cantidad;i++){
      const p = document.createElement("span");
      p.className = "v138-particle " + tipos[Math.floor(Math.random()*tipos.length)];

      const left = Math.random()*100;
      const dur = 7 + Math.random()*8;
      const delay = -(Math.random()*dur);
      const drift1 = (Math.random()-.5)*80;
      const drift2 = (Math.random()-.5)*150;
      const alpha = .28 + Math.random()*.58;
      const scale = .65 + Math.random()*1.15;

      p.style.left = left + "%";
      p.style.setProperty("--dur",dur+"s");
      p.style.setProperty("--delay",delay+"s");
      p.style.setProperty("--drift1",drift1+"px");
      p.style.setProperty("--drift2",drift2+"px");
      p.style.setProperty("--alpha",alpha);
      p.style.transform = `scale(${scale})`;

      layer.appendChild(p);
    }

    welcome.appendChild(layer);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",initV138Particles,{once:true});
  }else{
    initV138Particles();
  }
})();


/* =========================================================
   V139 — TRANSICIONES DE PANTALLA + PARTÍCULAS FIESTA
   ========================================================= */
(() => {
  function resetViewport(){
    try{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    }catch(e){}
  }

  function initScreenFlow(){
    const cta=document.getElementById("atomicCta");
    const baptism=document.getElementById("openBaptismV102");
    const party=document.getElementById("openPartyV122");

    if(cta){
      cta.addEventListener("click",()=>{
        setTimeout(resetViewport,720);
      },{passive:true});
    }

    [baptism,party].forEach(btn=>{
      if(btn){
        btn.addEventListener("click",()=>{
          setTimeout(resetViewport,20);
        },{passive:true});
      }
    });

    window.addEventListener("hashchange",resetViewport);
  }

  function initPartyParticles(){
    const party=document.querySelector(".v126-party");
    if(!party || party.querySelector(".v139-party-particles")) return;

    const layer=document.createElement("div");
    layer.className="v139-party-particles";
    layer.setAttribute("aria-hidden","true");

    const amount=window.innerWidth<=430?30:44;
    const types=["red","blue","white"];

    for(let i=0;i<amount;i++){
      const p=document.createElement("span");
      p.className="v139-party-particle "+types[Math.floor(Math.random()*types.length)];

      const dur=8+Math.random()*8;
      p.style.left=(Math.random()*100)+"%";
      p.style.setProperty("--dur",dur+"s");
      p.style.setProperty("--delay",-(Math.random()*dur)+"s");
      p.style.setProperty("--x1",((Math.random()-.5)*70)+"px");
      p.style.setProperty("--x2",((Math.random()-.5)*140)+"px");
      p.style.setProperty("--alpha",(.2+Math.random()*.52).toFixed(2));

      layer.appendChild(p);
    }

    party.prepend(layer);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{
      initScreenFlow();
      initPartyParticles();
    },{once:true});
  }else{
    initScreenFlow();
    initPartyParticles();
  }
})();
