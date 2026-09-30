(() => {
  "use strict";

  const C = BIRTHDAY_CONFIG;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];

  const state = {
    opened: false,
    musicStarted: false,
    visitedHearts: new Set(),
    candlesOut: 0,
    micStream: null,
    audioContext: null,
    analyser: null,
    micRAF: null,
    lastBlowAt: 0
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const toast = (message, ms = 2400) => {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => el.classList.remove("show"), ms);
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // -----------------------------
  // Countdown + opening
  // -----------------------------
  const targetDate = new Date(C.birthdayISO);
  const countdownEl = $("#countdown");
  const countdownLabel = $("#countdownLabel");

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      countdownLabel.textContent = `OFICIALMENTE ${C.age} AÑITOS 🎉`;
      countdownEl.innerHTML = `<div class="unit" style="grid-column:1/-1"><strong>HOY</strong><span>es el día</span></div>`;
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    countdownLabel.textContent = `Falta esto para que Anto desbloquee el nivel ${C.age}:`;
    countdownEl.innerHTML = [
      [days, "días"], [hours, "horas"], [mins, "min"], [secs, "seg"]
    ].map(([value, label]) => `<div class="unit"><strong>${String(value).padStart(2, "0")}</strong><span>${label}</span></div>`).join("");
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const music = $("#bgMusic");
  music.src = C.song;
  music.volume = 0.38;

  async function startMusic() {
    try {
      await music.play();
      state.musicStarted = true;
      $("#musicBtn").classList.remove("paused");
      $("#musicBtn").textContent = "♫";
    } catch {
      $("#musicBtn").classList.add("paused");
      $("#musicBtn").textContent = "♪";
    }
  }

  $("#openGiftBtn").addEventListener("click", () => {
    state.opened = true;
    document.body.classList.remove("locked");
    $("#opening").classList.add("is-gone");
    startMusic();
    burstHearts(28);
    setTimeout(() => $("#inicio").scrollIntoView({ behavior: "smooth" }), 300);
  });

  $("#musicBtn").addEventListener("click", async () => {
    if (music.paused) {
      await startMusic();
      toast("Música: ON 🎵");
    } else {
      music.pause();
      $("#musicBtn").classList.add("paused");
      $("#musicBtn").textContent = "♪";
      toast("Música: pausa");
    }
  });

  // -----------------------------
  // Hero text type rotation
  // -----------------------------
  let heroLineIndex = 0;
  const heroLine = $("#heroLine");
  function setHeroLine() {
    heroLine.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 450, fill: "both" });
    heroLine.textContent = C.heroLines[heroLineIndex % C.heroLines.length];
    heroLineIndex++;
  }
  setHeroLine();
  setInterval(setHeroLine, 4600);

  // -----------------------------
  // Reveal on scroll
  // -----------------------------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: .12 });
  $$(".reveal").forEach(el => observer.observe(el));

  window.addEventListener("scroll", () => {
    $("#topBtn").classList.toggle("show", scrollY > innerHeight * .65);
  }, { passive: true });
  $("#topBtn").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // -----------------------------
  // Letter
  // -----------------------------
  const envelope = $("#envelope");
  const letter = $("#letter");
  letter.innerHTML = C.letter.map(p => `<p>${escapeHTML(p)}</p>`).join("");

  envelope.addEventListener("click", () => {
    const isOpen = envelope.classList.toggle("open");
    envelope.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      setTimeout(() => {
        letter.hidden = false;
        letter.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 650, fill: "both" });
      }, 520);
    }
  });

  // -----------------------------
  // Friend messages
  // -----------------------------
  const friendGrid = $("#friendGrid");
  C.friendMessages.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = `friend-card reveal ${item.pending ? "pending" : ""}`;
    card.style.transitionDelay = `${Math.min(i * 55, 260)}ms`;
    card.innerHTML = `<h4>${escapeHTML(item.name)}</h4><p>${item.pending ? `💌 Espacio reservado para el mensaje de ${escapeHTML(item.name)}.` : escapeHTML(item.message)}</p>`;
    friendGrid.appendChild(card);
    observer.observe(card);
  });

  // -----------------------------
  // Gallery + dialog
  // -----------------------------
  const gallery = $("#gallery");
  C.gallery.forEach((item, index) => {
    const card = document.createElement("button");
    card.className = "gallery-card reveal";
    card.type = "button";
    card.setAttribute("aria-label", `Abrir foto ${index + 1}`);
    card.innerHTML = `<img src="${item.src}" alt="${escapeHTML(item.caption)}"><div class="gallery-caption">${escapeHTML(item.caption)}</div>`;
    card.addEventListener("click", () => openDialog({ title: item.caption, text: "", photo: item.src }));
    gallery.appendChild(card);
    observer.observe(card);
  });

  const dialog = $("#memoryDialog");
  const dialogContent = $("#dialogContent");
  function openDialog(item) {
    dialogContent.innerHTML = `<div class="dialog-inner">${item.photo ? `<img src="${item.photo}" alt="${escapeHTML(item.title || "Recuerdo")}">` : ""}<h4>${escapeHTML(item.title || "Recuerdo")}</h4>${item.text ? `<p>${escapeHTML(item.text)}</p>` : ""}</div>`;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  $("#closeDialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => {
    const r = dialog.getBoundingClientRect();
    const inDialog = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inDialog) dialog.close();
  });

  // -----------------------------
  // Constellation
  // -----------------------------
  const heartField = $("#heartField");
  const positions = [
    [13,20],[29,12],[52,17],[76,13],[88,28],
    [18,46],[34,36],[69,34],[83,52],
    [12,72],[31,70],[55,79],[74,72],[91,78],
    [47,46],[61,57],[39,58],[72,20]
  ];

  C.constellation.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "heart-star";
    btn.textContent = "♥";
    const [x, y] = positions[i % positions.length];
    btn.style.left = `${x}%`;
    btn.style.top = `${y}%`;
    btn.style.animationDelay = `${(i % 7) * .24}s`;
    btn.setAttribute("aria-label", `Abrir corazón: ${item.title}`);
    btn.addEventListener("click", () => {
      state.visitedHearts.add(i);
      btn.classList.add("visited");
      openDialog(item);
      if (state.visitedHearts.size === C.constellation.length) {
        setTimeout(() => toast("¡Abriste toda la constelación! 🩶✨", 3500), 400);
        burstHearts(24);
      }
    });
    heartField.appendChild(btn);
  });

  drawStarfield();
  window.addEventListener("resize", debounce(drawStarfield, 200));

  function drawStarfield() {
    const canvas = $("#starsCanvas");
    const shell = canvas.parentElement;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = shell.clientWidth * dpr;
    canvas.height = shell.clientHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, shell.clientWidth, shell.clientHeight);
    const seed = mulberry32(1701);
    for (let i = 0; i < 180; i++) {
      const x = seed() * shell.clientWidth;
      const y = seed() * shell.clientHeight;
      const r = seed() * 1.7 + .25;
      const a = seed() * .7 + .15;
      ctx.fillStyle = `rgba(230,236,255,${a})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Lines connecting consecutive hearts (constellation feeling)
    ctx.strokeStyle = "rgba(118,215,204,.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    C.constellation.forEach((_, i) => {
      const [px, py] = positions[i % positions.length];
      const x = px / 100 * shell.clientWidth;
      const y = py / 100 * shell.clientHeight;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // -----------------------------
  // Cake + microphone blow detection
  // -----------------------------
  const candlesEl = $("#candles");
  const candleEls = [];
  for (let i = 0; i < C.age; i++) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.innerHTML = `<span class="flame"></span>`;
    candlesEl.appendChild(candle);
    candleEls.push(candle);
  }

  function extinguish(count = 3) {
    const remaining = candleEls.filter(c => !c.classList.contains("out"));
    if (!remaining.length) return;
    shuffle(remaining).slice(0, count).forEach(c => c.classList.add("out"));
    state.candlesOut = candleEls.filter(c => c.classList.contains("out")).length;
    const left = C.age - state.candlesOut;
    $("#micStatus").textContent = left ? `${left} velita${left === 1 ? "" : "s"} todavía encendida${left === 1 ? "" : "s"}. ¡Otra soplada!` : "¡Las apagaste todas! 🎉";
    if (!left) onAllCandlesOut();
  }

  async function startMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Este navegador no permite usar el micrófono acá. Usá el Plan B ✨", 4000);
      return;
    }
    try {
      if (state.micStream) return;
      state.micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = state.audioContext.createMediaStreamSource(state.micStream);
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 1024;
      source.connect(state.analyser);
      $("#micBtn").textContent = "Micrófono activo — SOPLÁ 💨";
      $("#micStatus").textContent = "Te escucho… soplá fuerte y cerca del micrófono.";
      monitorMic();
    } catch (err) {
      console.warn(err);
      toast("No pude abrir el micrófono. Probá permitirlo o usá el Plan B ✨", 4500);
      $("#micStatus").textContent = "Micrófono no disponible. Plan B habilitado.";
    }
  }

  function monitorMic() {
    const data = new Uint8Array(state.analyser.fftSize);
    const loop = () => {
      state.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) {
        const n = (v - 128) / 128;
        sum += n * n;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      // Soplar cerca del mic genera bastante energía. Hay cooldown para no apagar todo de golpe.
      if (rms > 0.095 && now - state.lastBlowAt > 420) {
        state.lastBlowAt = now;
        const strength = clamp(Math.ceil((rms - .08) * 28), 2, 5);
        extinguish(strength);
      }
      if (state.candlesOut < C.age) state.micRAF = requestAnimationFrame(loop);
    };
    loop();
  }

  $("#micBtn").addEventListener("click", startMic);
  $("#magicBlowBtn").addEventListener("click", () => extinguish(4));

  let allOutDone = false;
  function onAllCandlesOut() {
    if (allOutDone) return;
    allOutDone = true;
    if (state.micRAF) cancelAnimationFrame(state.micRAF);
    if (state.micStream) state.micStream.getTracks().forEach(t => t.stop());
    $("#wishReveal").hidden = false;
    $("#wishReveal").scrollIntoView({ behavior: "smooth", block: "center" });
    fireworks(4500);
    burstHearts(40);
  }

  // -----------------------------
  // Receipt
  // -----------------------------
  const receiptItems = $("#receiptItems");
  C.receiptItems.forEach(([name, qty]) => {
    const row = document.createElement("div");
    row.className = "receipt-item";
    row.innerHTML = `<span>${escapeHTML(name)}</span><strong>${escapeHTML(qty)}</strong>`;
    receiptItems.appendChild(row);
  });

  // -----------------------------
  // Easter egg: 7 clicks
  // -----------------------------
  let chaosClicks = 0;
  let chaosTimer = null;
  $("#chaosBtn").addEventListener("click", () => {
    chaosClicks++;
    clearTimeout(chaosTimer);
    chaosTimer = setTimeout(() => chaosClicks = 0, 4200);
    const messages = [
      "¿Qué esperabas que hiciera? 🤨",
      "No pasa nada. Seguí.",
      "Che…",
      "No me digas que vas a apretar siete veces.",
      "Te estoy viendo.",
      "En serio, no.",
      "ADVERTENCIA: NO TOMEN MÁS DE 7 LICUADOS 💀💀💀"
    ];
    toast(messages[Math.min(chaosClicks, 7) - 1]);
    if (chaosClicks >= 7) {
      burstHearts(17);
      chaosClicks = 0;
    }
  });

  $("#replayBtn").addEventListener("click", () => {
    burstHearts(55);
    fireworks(2800);
  });

  // -----------------------------
  // Ambient canvas: tiny drifting stars/hearts
  // -----------------------------
  const ambient = $("#ambientCanvas");
  const actx = ambient.getContext("2d");
  let motes = [];

  function resizeAmbient() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    ambient.width = innerWidth * dpr;
    ambient.height = innerHeight * dpr;
    ambient.style.width = `${innerWidth}px`;
    ambient.style.height = `${innerHeight}px`;
    actx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motes = Array.from({ length: Math.min(80, Math.floor(innerWidth / 14)) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.5 + .3,
      dy: Math.random() * .16 + .03,
      a: Math.random() * .55 + .12
    }));
  }
  resizeAmbient();
  addEventListener("resize", debounce(resizeAmbient, 180));

  function animateAmbient() {
    actx.clearRect(0, 0, innerWidth, innerHeight);
    for (const m of motes) {
      m.y -= m.dy;
      if (m.y < -5) { m.y = innerHeight + 5; m.x = Math.random() * innerWidth; }
      actx.fillStyle = `rgba(226,216,240,${m.a})`;
      actx.beginPath(); actx.arc(m.x, m.y, m.r, 0, Math.PI*2); actx.fill();
    }
    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();

  // -----------------------------
  // Heart burst DOM particles
  // -----------------------------
  function burstHearts(amount = 24) {
    for (let i = 0; i < amount; i++) {
      setTimeout(() => {
        const h = document.createElement("span");
        h.className = "floating-heart";
        h.textContent = Math.random() > .25 ? "♥" : "✦";
        h.style.left = `${Math.random() * 100}vw`;
        h.style.bottom = `${-10 - Math.random() * 10}px`;
        h.style.setProperty("--dx", `${(Math.random() - .5) * 240}px`);
        h.style.setProperty("--rot", `${(Math.random() - .5) * 180}deg`);
        h.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
        h.style.opacity = `${.45 + Math.random() * .55}`;
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 5000);
      }, i * 35);
    }
  }

  // -----------------------------
  // Fireworks canvas
  // -----------------------------
  function fireworks(duration = 3200) {
    const canvas = $("#fireworksCanvas");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#76d7cc", "#ef9dbd", "#6aa7ff", "#f9d57a", "#d85f8e"];
    let particles = [];
    const start = performance.now();
    let nextBurst = 0;

    const explode = () => {
      const cx = innerWidth * (.15 + Math.random() * .7);
      const cy = innerHeight * (.16 + Math.random() * .45);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 58; i++) {
        const a = Math.PI * 2 * i / 58 + Math.random() * .08;
        const s = 1.5 + Math.random() * 4.2;
        particles.push({ x: cx, y: cy, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 1, color, r: 1 + Math.random()*1.6 });
      }
    };

    const frame = (t) => {
      ctx.clearRect(0,0,innerWidth,innerHeight);
      if (t - start > nextBurst && t - start < duration - 700) {
        explode();
        nextBurst += 480 + Math.random() * 500;
      }
      particles = particles.filter(p => p.life > .02);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += .035;
        p.vx *= .992;
        p.vy *= .992;
        p.life *= .973;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (t - start < duration || particles.length) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,innerWidth,innerHeight);
    };
    requestAnimationFrame(frame);
  }

  // -----------------------------
  // Utilities
  // -----------------------------
  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  document.body.classList.add("locked");
})();
