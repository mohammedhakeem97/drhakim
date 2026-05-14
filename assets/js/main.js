(function () {
  const doc = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const langToggle = document.querySelector("[data-lang-toggle]");
  const progress = document.querySelector("[data-scroll-progress]");
  const cursorGlow = document.querySelector("[data-cursor-glow]");
  const loader = document.querySelector("[data-loader]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];

  if (loader) {
    window.addEventListener("load", () => {
      window.setTimeout(() => loader.classList.add("is-hidden"), reduceMotion ? 0 : 450);
    });
  }

  function setLanguage(lang) {
    doc.lang = lang;
    doc.dir = lang === "ar" ? "rtl" : "ltr";
    body.classList.toggle("en", lang === "en");
    document.querySelectorAll("[data-ar][data-en]").forEach((node) => {
      node.textContent = node.dataset[lang];
    });
    localStorage.setItem("drHakimLang", lang);
  }

  if (langToggle) {
    setLanguage(localStorage.getItem("drHakimLang") || "ar");
    langToggle.addEventListener("click", () => {
      setLanguage(doc.lang === "ar" ? "en" : "ar");
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => body.classList.toggle("menu-open"));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) body.classList.remove("menu-open");
    });
  }

  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  function updateScrollUI() {
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const ratio = window.scrollY / max;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 30);

    let activeId = "";
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 180 && rect.bottom > 180) activeId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });

    if (!reduceMotion) {
      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.parallax || 0);
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = (window.innerHeight / 2 - rect.top) * speed;
        item.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
        item.style.transform = item.classList.contains("is-visible")
          ? `translate3d(0, var(--parallax-y), 0)`
          : item.style.transform;
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  updateScrollUI();

  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".reveal").forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = -((y / rect.height) - 0.5) * 8;
        card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
        card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const stats = document.querySelector("[data-stats]");
  if (stats) {
    const statObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      stats.querySelectorAll("[data-count]").forEach((item) => {
        const target = Number(item.dataset.count);
        const duration = 1100;
        const start = performance.now();
        function tick(now) {
          const progressValue = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progressValue, 3);
          item.textContent = Math.floor(eased * target);
          if (progressValue < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      statObserver.disconnect();
    }, { threshold: 0.5 });
    statObserver.observe(stats);
  }

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const cards = [...carousel.querySelectorAll(".testimonial-card")];
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    let index = 0;
    let startX = 0;
    let timer;

    function show(nextIndex) {
      cards[index].classList.remove("is-active");
      index = (nextIndex + cards.length) % cards.length;
      cards[index].classList.add("is-active");
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5200);
    }

    prev?.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
    next?.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
    carousel.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45) {
        show(index + (delta > 0 ? -1 : 1));
        restart();
      }
    });
    restart();
  }
})();
