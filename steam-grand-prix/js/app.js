/**
 * Steam Grand Prix — Rebajas Veraniegas
 * Lógica principal: loader, cursor, estrellas, parallax, partículas,
 * cuenta regresiva, auto (rAF), navbar, búsqueda, scroll reveal, carrusel.
 */
(function () {
  "use strict";

  const SALE_END = new Date("2026-07-09T19:00:00"); // Fin de ofertas (referencia evento)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (sel, root = document) => root.querySelector(sel);

  /* ---------- Loader ---------- */
  function initLoader() {
    const loader = el("#loader");
    const page = el("#page");
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("is-done");
        page.classList.remove("is-hidden");
      }, 900);
    });
    // Si load ya ocurrió
    if (document.readyState === "complete") {
      loader.classList.add("is-done");
      page.classList.remove("is-hidden");
    }
  }

  /* ---------- Cursor personalizado ---------- */
  function initCursor() {
    if (prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;

    const dot = el("#cursor-dot");
    const ring = el("#cursor-ring");
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );

    window.addEventListener("mousedown", () => document.body.classList.add("is-pressing"));
    window.addEventListener("mouseup", () => document.body.classList.remove("is-pressing"));

    function loop() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) rotate(45deg)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Estrellas de fondo (scroll + idle) ---------- */
  function initStars() {
    const canvas = el("#stars-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;
    let scrollY = 0;
    let tick = 0;

    function resize() {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: Math.min(count, 140) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.2,
      }));
    }

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    }, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    function frame() {
      tick += 0.016;
      ctx.clearRect(0, 0, w, h);
      const drift = scrollY * 0.08;
      for (const s of stars) {
        const twinkle = 0.35 + Math.sin(s.tw + tick * s.sp) * 0.35;
        ctx.fillStyle = `rgba(180, 220, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x + drift * 0.02, s.y + drift * 0.15 + (scrollY % h) * 0.01, s.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Parallax del hero (mousemove) ---------- */
  function initParallax() {
    if (prefersReducedMotion) return;
    const root = el("#heroParallax");
    const hero = el("#hero");
    if (!root || !hero) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    hero.addEventListener(
      "mousemove",
      (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        targetX = nx * 2;
        targetY = ny * 2;
      },
      { passive: true }
    );

    hero.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

    function smooth() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      root.querySelectorAll("[data-depth]").forEach((layer) => {
        const d = parseFloat(layer.getAttribute("data-depth"));
        layer.style.transform = `translate3d(${curX * d * 40}px, ${curY * d * 24}px, 0)`;
      });
      requestAnimationFrame(smooth);
    }
    requestAnimationFrame(smooth);
  }

  /* ---------- Partículas / chispas en el banner (canvas) ---------- */
  function initHeroParticles() {
    const canvas = el("#heroParticles");
    const hero = el("#hero");
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");
    let parts = [];
    let w = 0;
    let h = 0;

    function resize() {
      const r = hero.getBoundingClientRect();
      w = canvas.width = r.width * devicePixelRatio;
      h = canvas.height = r.height * devicePixelRatio;
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
    }

    function spawn() {
      if (parts.length > 90) return;
      parts.push({
        x: Math.random() * w,
        y: -20 * devicePixelRatio,
        vy: (1.5 + Math.random() * 3) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 1.2 * devicePixelRatio,
        life: 1,
        hue: 280 + Math.random() * 60,
      });
    }

    window.addEventListener("resize", resize);
    resize();

    function tick() {
      if (Math.random() < 0.35) spawn();
      ctx.clearRect(0, 0, w, h);
      parts = parts.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.006;
        if (p.life <= 0 || p.y > h) return false;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.life * 0.6})`;
        ctx.fillRect(p.x, p.y, 3 * devicePixelRatio, 6 * devicePixelRatio);
        return true;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Countdown principal ---------- */
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function initCountdown() {
    const dEl = el("#cd-days");
    const hEl = el("#cd-hours");
    const mEl = el("#cd-mins");
    const sEl = el("#cd-secs");
    if (!dEl) return;

    function update() {
      const now = Date.now();
      let diff = SALE_END.getTime() - now;
      if (diff < 0) diff = 0;
      const s = Math.floor(diff / 1000) % 60;
      const m = Math.floor(diff / 60000) % 60;
      const h = Math.floor(diff / 3600000) % 24;
      const d = Math.floor(diff / 86400000);
      dEl.textContent = pad(d);
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    }
    update();
    setInterval(update, 1000);
  }

  /* ---------- Timer ofertas del día (ciclo 24 h desde medianoche local) ---------- */
  function initDailyTimer() {
    const hOut = el("#dailyH");
    const mOut = el("#dailyM");
    const sOut = el("#dailyS");
    if (!hOut) return;

    function tick() {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      let diff = next - now;
      const s = Math.floor(diff / 1000) % 60;
      const m = Math.floor(diff / 60000) % 60;
      const h = Math.floor(diff / 3600000);
      hOut.textContent = pad(h);
      mOut.textContent = pad(m);
      sOut.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Auto de carreras: requestAnimationFrame ---------- */
  function initRaceCar() {
    const car = el("#raceCar");
    const hero = el("#hero");
    if (!car || !hero) return;

    /** Posición horizontal en % respecto al ancho de la pista */
    let xPct = 112;
    /** -1 = hacia la izquierda, +1 = hacia la derecha */
    let dir = -1;
    const SPEED_BASE = 26;
    const SPEED_FAST = 58;
    let last = performance.now();

    function isAccelerating() {
      return hero.matches(":hover");
    }

    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const speed = isAccelerating() ? SPEED_FAST : SPEED_BASE;
      hero.classList.toggle("is-fast", isAccelerating());

      xPct += dir * speed * dt;

      // Rebote suave en el borde izquierdo y vuelta
      if (dir < 0 && xPct < 7) {
        dir = 1;
        xPct = 7;
        car.classList.add("is-bounce");
        window.setTimeout(() => car.classList.remove("is-bounce"), 400);
      }
      // Al salir por la derecha, reinicia el circuito hacia la izquierda
      if (dir > 0 && xPct > 112) {
        dir = -1;
        xPct = 112;
      }

      car.classList.toggle("is-forward", dir > 0);
      car.style.left = xPct + "%";
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Navbar sticky: blur al scroll ---------- */
  function initNavScroll() {
    const nav = el("#navTop");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Búsqueda expandible ---------- */
  function initSearch() {
    const wrap = el("#searchWrap");
    const toggle = el("#searchToggle");
    const input = el("#searchInput");
    if (!wrap || !toggle || !input) return;

    toggle.addEventListener("click", () => {
      const open = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) input.focus();
    });

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  function initReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
          }
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- Carrusel horizontal ---------- */
  function initCarousel() {
    const track = el("#carouselTrack");
    const prev = el("#carouselPrev");
    const next = el("#carouselNext");
    if (!track || !prev || !next) return;
    const amount = () => Math.min(track.clientWidth * 0.65, 320);

    prev.addEventListener("click", () => {
      track.scrollBy({ left: -amount(), behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      track.scrollBy({ left: amount(), behavior: "smooth" });
    });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    initLoader();
    initCursor();
    initStars();
    initParallax();
    initHeroParticles();
    initCountdown();
    initDailyTimer();
    initRaceCar();
    initNavScroll();
    initSearch();
    initReveal();
    initCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
