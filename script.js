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
    auroraRAF: null,
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
  // Countdown + mini juego de acceso
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

  // El MP3 del repo quedó dañado. La fuente estable es el video oficial
  // de Hozier. El iframe se crea EN el click del usuario para que Chrome
  // permita sonido desde el primer momento.
  const YT_MUSIC_ID = "bPJSsAr2iu0";
  const ytDock = $("#ytMusicDock");
  const ytMount = $("#ytMusicPlayer");
  let ytFrame = null;
  let musicPlaying = false;

  function setMusicButton(playing) {
    musicPlaying = playing;
    $("#musicBtn").classList.toggle("paused", !playing);
    $("#musicBtn").textContent = playing ? "♫" : "♪";
    $("#musicBtn").setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  }

  function sendYTCommand(func) {
    if (!ytFrame?.contentWindow) return;
    ytFrame.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func,
      args: []
    }), "*");
  }

  function createAndPlayYouTube() {
    if (!ytFrame) {
      const frame = document.createElement("iframe");
      frame.title = "Someone New — Hozier";
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("allowfullscreen", "");
      frame.src =
        "https://www.youtube.com/embed/" + YT_MUSIC_ID +
        "?autoplay=1&loop=1&playlist=" + YT_MUSIC_ID +
        "&controls=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1";
      ytMount.replaceChildren(frame);
      ytFrame = frame;
    } else {
      sendYTCommand("playVideo");
    }

    ytDock.classList.add("show");
    state.musicStarted = true;
    setMusicButton(true);
  }

  function pauseMusic() {
    sendYTCommand("pauseVideo");
    try { music.pause(); } catch {}
    setMusicButton(false);
  }

  function startMusic() {
    // Debe ejecutarse dentro de un click/tap; así el navegador autoriza audio.
    createAndPlayYouTube();
  }

  const gateState = {
    stage: 1,
    aliasSolved: new Set(),
    selectedAlias: null,
    aliasMistakes: 0,
    triviaQueue: [],
    triviaCorrect: 0,
    triviaMistakes: 0,
    chronologyIndex: 0,
    chronologyMistakes: 0
  };

  const gateStage = $("#gateStage");
  const gateStatus = $("#gateStatus");
  const gateProgressBar = $("#gateProgressBar");
  const gateProgressText = $("#gateProgressText");

  function setGateProgress(stage, fraction = 0) {
    const safeStage = clamp(stage, 1, 3);
    gateProgressText.textContent = `PRUEBA ${safeStage} / 3`;
    const pct = ((safeStage - 1) + clamp(fraction, 0, 1)) / 3 * 100;
    gateProgressBar.style.width = `${pct}%`;
  }

  function gateMessage(text, tone = "") {
    gateStatus.className = `gate-status ${tone}`.trim();
    gateStatus.textContent = text;
  }

  function swapGateView(from, to) {
    from.hidden = true;
    to.hidden = false;
    to.animate([
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "none" }
    ], { duration: 420, fill: "both", easing: "ease-out" });
  }

  $("#startGateBtn").addEventListener("click", () => {
    startMusic();
    swapGateView($("#gateIntro"), $("#gateGame"));
    renderAliasStage();
  });

  function renderAliasStage() {
    gateState.stage = 1;
    gateState.aliasSolved = new Set();
    gateState.selectedAlias = null;
    setGateProgress(1, 0);
    gateMessage("Un emparejamiento mal y reinicio todo. A ver cuánto te acordás.");

    const aliases = shuffle(C.unlockGame.aliases.map((x, i) => ({ ...x, id: i })));
    const identities = shuffle(C.unlockGame.aliases.map((x, i) => ({ ...x, id: i })));

    gateStage.innerHTML = `
      <div class="gate-stage-head">
        <span class="gate-stage-number">01</span>
        <div>
          <div class="gate-eyebrow">IDENTIFICACIÓN DE SOSPECHOSOS</div>
          <h2>Uní alias y nombre.</h2>
          <p>Elegí un alias y después su identidad real. Si hacés una pareja mal, se borra todo.</p>
        </div>
      </div>
      <div class="alias-board">
        <div class="alias-column">
          <div class="case-column-label">ALIAS</div>
          <div id="aliasList" class="alias-list"></div>
        </div>
        <div class="alias-strings" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="alias-column">
          <div class="case-column-label">IDENTIDAD</div>
          <div id="identityList" class="alias-list"></div>
        </div>
      </div>
    `;

    const aliasList = $("#aliasList", gateStage);
    const identityList = $("#identityList", gateStage);
    aliases.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "case-chip alias-chip";
      btn.dataset.id = item.id;
      btn.innerHTML = `<small>AKA</small><strong>${escapeHTML(item.alias)}</strong>`;
      btn.addEventListener("click", () => selectAlias(item.id, btn));
      aliasList.appendChild(btn);
    });
    identities.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "case-chip identity-chip";
      btn.dataset.id = item.id;
      btn.innerHTML = `<small>FICHA</small><strong>${escapeHTML(item.identity)}</strong>`;
      btn.addEventListener("click", () => selectIdentity(item.id, btn));
      identityList.appendChild(btn);
    });
  }

  function selectAlias(id, btn) {
    if (gateState.aliasSolved.has(id)) return;
    gateState.selectedAlias = id;
    $$(".alias-chip", gateStage).forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    gateMessage("Alias seleccionado. Ahora elegí la identidad.");
  }

  function selectIdentity(id, btn) {
    if (gateState.selectedAlias === null || gateState.aliasSolved.has(id)) {
      gateMessage(gateState.selectedAlias === null ? "Primero elegí un alias." : "Esa ficha ya está cerrada.");
      return;
    }
    const aliasId = Number(gateState.selectedAlias);
    if (Number(id) === aliasId) {
      gateState.aliasSolved.add(aliasId);
      const aliasBtn = $(`.alias-chip[data-id="${aliasId}"]`, gateStage);
      aliasBtn?.classList.remove("selected");
      aliasBtn?.classList.add("solved");
      aliasBtn && (aliasBtn.disabled = true);
      btn.classList.add("solved");
      btn.disabled = true;
      gateState.selectedAlias = null;
      const done = gateState.aliasSolved.size;
      setGateProgress(1, done / C.unlockGame.aliases.length);
      gateMessage(done === C.unlockGame.aliases.length ? "Listo. Primera prueba superada.": `${done}/${C.unlockGame.aliases.length}. Bien. Seguí.`, "good");
      if (done === C.unlockGame.aliases.length) setTimeout(renderTriviaStage, 850);
      return;
    }

    gateState.aliasMistakes++;
    btn.classList.add("wrong");
    gateStage.classList.remove("gate-shake");
    void gateStage.offsetWidth;
    gateStage.classList.add("gate-shake");
    gateMessage("No. Expediente contaminado. Se reinicia la prueba completa.", "bad");
    $$(".case-chip", gateStage).forEach(b => b.disabled = true);
    setTimeout(renderAliasStage, 760);
  }

  function renderTriviaStage() {
    gateState.stage = 2;
    gateState.triviaQueue = shuffle(C.unlockGame.trivia.map((q, i) => ({ ...q, id: i })));
    gateState.triviaCorrect = 0;
    gateState.triviaMistakes = 0;
    setGateProgress(2, 0);
    renderTriviaQuestion();
  }

  function renderTriviaQuestion() {
    const q = gateState.triviaQueue[0];
    if (!q) {
      gateMessage("Perfecto. Te queda una sola prueba.", "good");
      setGateProgress(2, 1);
      setTimeout(renderChronologyStage, 900);
      return;
    }

    gateStage.innerHTML = `
      <div class="gate-stage-head">
        <span class="gate-stage-number">02</span>
        <div>
          <div class="gate-eyebrow">SIN GOOGLE</div>
          <h2>A ver qué tanto sabés.</h2>
          <p>Tenés que acertar las ${C.unlockGame.trivia.length}. Si fallás una, te vuelve a aparecer después.</p>
        </div>
      </div>
      <div class="trivia-counter"><span>${gateState.triviaCorrect}</span> / ${C.unlockGame.trivia.length} resueltas</div>
      <div class="trivia-question">${escapeHTML(q.question)}</div>
      <div class="trivia-options" id="triviaOptions"></div>
    `;

    gateMessage("Sin Google. Confío en vos.");
    const options = shuffle([...q.options]);
    const wrap = $("#triviaOptions", gateStage);
    options.forEach(option => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-option";
      btn.textContent = option;
      btn.addEventListener("click", () => handleTrivia(btn, option, q));
      wrap.appendChild(btn);
    });
  }

  function handleTrivia(btn, option, q) {
    $$(".trivia-option", gateStage).forEach(b => b.disabled = true);
    if (option === q.answer) {
      btn.classList.add("correct");
      gateState.triviaCorrect++;
      gateState.triviaQueue.shift();
      setGateProgress(2, gateState.triviaCorrect / C.unlockGame.trivia.length);
      gateMessage("Correcto. Eso salió demasiado rápido.", "good");
      setTimeout(renderTriviaQuestion, 620);
      return;
    }

    btn.classList.add("wrong");
    gateState.triviaMistakes++;
    const missed = gateState.triviaQueue.shift();
    gateState.triviaQueue.push(missed);
    gateMessage("Incorrecto. Esa pregunta vuelve. El expediente tiene memoria.", "bad");
    setTimeout(renderTriviaQuestion, 850);
  }

  function crimeCaseIcon(item) {
    const icon = item.icon || "search";
    if (icon === "yellow-car") {
      return '<span class="crime-icon crime-car" aria-hidden="true"><i></i><b></b></span>';
    }
    const symbols = { letter: "✉", footprints: "👣", city: "▥", river: "≋", disk: "▣", search: "⌕" };
    return `<span class="crime-icon crime-icon-${escapeHTML(icon)}" aria-hidden="true">${symbols[icon] || symbols.search}</span>`;
  }

  function renderChronologyStage() {
    gateState.stage = 3;
    gateState.chronologyIndex = 0;
    setGateProgress(3, 0);
    gateMessage("Ordenalos del más antiguo al más reciente. Si fallás, esta parte empieza de nuevo.");

    const shuffled = shuffle([...C.unlockGame.chronology]);
    gateStage.innerHTML = `
      <div class="gate-stage-head">
        <span class="gate-stage-number">03</span>
        <div>
          <div class="gate-eyebrow">ÚLTIMA PRUEBA</div>
          <h2>Ordená los casos.</h2>
          <p>Tocalos según el año de arresto o captura, del más viejo al más reciente. Los años aparecen cuando acertás.</p>
        </div>
      </div>
      <div class="saga-picked" id="chronologyPicked" aria-label="Progreso de la línea temporal"></div>
      <div class="saga-grid chronology-grid" id="chronologyGrid"></div>
    `;

    const grid = $("#chronologyGrid", gateStage);
    shuffled.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "saga-card chronology-card";
      btn.dataset.label = item.label;
      btn.innerHTML = `${crimeCaseIcon(item)}<strong>${escapeHTML(item.label)}</strong><small class="chronology-year">AÑO BLOQUEADO</small>`;
      btn.addEventListener("click", () => handleChronologyPick(btn, item));
      grid.appendChild(btn);
    });
    updateChronologyPicked();
  }

  function updateChronologyPicked() {
    const picked = $("#chronologyPicked", gateStage);
    if (!picked) return;
    picked.innerHTML = C.unlockGame.chronology.map((_, i) => `<span class="${i < gateState.chronologyIndex ? "done" : i === gateState.chronologyIndex ? "current" : ""}">${i + 1}</span>`).join("");
    setGateProgress(3, gateState.chronologyIndex / C.unlockGame.chronology.length);
  }

  function handleChronologyPick(btn, item) {
    const expected = C.unlockGame.chronology[gateState.chronologyIndex];
    if (item.label === expected.label) {
      btn.classList.add("correct");
      btn.disabled = true;
      const year = $(".chronology-year", btn);
      if (year) year.textContent = expected.year;
      gateState.chronologyIndex++;
      updateChronologyPicked();
      gateMessage(gateState.chronologyIndex < C.unlockGame.chronology.length ? `${expected.year}. Bien. Siguiente.` : "Sí, eras vos. Sabía que ibas a poder.", "good");
      if (gateState.chronologyIndex === C.unlockGame.chronology.length) {
        $$(".chronology-card", gateStage).forEach(card => card.disabled = true);
        setTimeout(finishGate, 900);
      }
      return;
    }

    gateState.chronologyMistakes++;
    btn.classList.add("wrong");
    $$(".chronology-card", gateStage).forEach(card => card.disabled = true);
    gateMessage("Cronología incorrecta. Borramos la pizarra y arrancamos esta etapa de nuevo.", "bad");
    gateStage.classList.remove("gate-shake");
    void gateStage.offsetWidth;
    gateStage.classList.add("gate-shake");
    setTimeout(renderChronologyStage, 760);
  }

  function finishGate() {
    setGateProgress(3, 1);
    burstHearts(24);
    swapGateView($("#gateGame"), $("#gateSuccess"));
  }

  $("#openGiftBtn").addEventListener("click", () => {
    state.opened = true;
    document.body.classList.remove("locked");
    $("#opening").classList.add("is-gone");
    startMusic();
    burstHearts(36);
    setTimeout(() => $("#inicio").scrollIntoView({ behavior: "smooth" }), 300);
  });

  $("#musicBtn").addEventListener("click", () => {
    if (!musicPlaying) {
      startMusic();
      toast("Música: ON 🎵");
    } else {
      pauseMusic();
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

  const imageExtensions = new Set(["jpg","jpeg","png","webp","gif","avif"]);
  const videoExtensions = new Set(["mp4","webm","mov","m4v","ogg"]);

  function galleryKind(path) {
    const ext = String(path).split(".").pop().toLowerCase();
    if (imageExtensions.has(ext)) return "image";
    if (videoExtensions.has(ext)) return "video";
    return null;
  }

  function rawGithubUrl(path) {
    return "https://raw.githubusercontent.com/valeveig15/Feliz-Cumple-Antooo/main/" +
      path.split("/").map(encodeURIComponent).join("/");
  }

  function renderGalleryItems(items) {
    gallery.replaceChildren();
    const mixed = shuffle([...items]);

    mixed.forEach((item, index) => {
      const src = item.src || rawGithubUrl(item.path);
      const kind = item.kind || galleryKind(item.path || item.src || "");
      if (!kind) return;

      if (kind === "video") {
        const card = document.createElement("article");
        card.className = `gallery-card gallery-shape-${index % 7} gallery-video-card`;
        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("aria-label", `Video ${index + 1} de la galería`);
        card.appendChild(video);
        gallery.appendChild(card);
        return;
      }

      const card = document.createElement("button");
      card.className = `gallery-card gallery-shape-${index % 7}`;
      card.type = "button";
      card.setAttribute("aria-label", `Abrir foto ${index + 1}`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Foto de Anto y sus amigos";
      img.loading = "lazy";
      card.appendChild(img);

      card.addEventListener("click", () => openDialog({ photo: src }));
      gallery.appendChild(card);
    });
  }

  const fallbackGallery = (C.gallery || []).map(item => ({ src: item.src, kind: galleryKind(item.src) }));
  renderGalleryItems(fallbackGallery);

  async function loadAllRepoMedia() {
    try {
      const response = await fetch("https://api.github.com/repos/valeveig15/Feliz-Cumple-Antooo/git/trees/main?recursive=1", {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if (!response.ok) return;
      const data = await response.json();
      const media = (data.tree || [])
        .filter(entry => entry.type === "blob" && entry.path.startsWith("assets/photos/"))
        .map(entry => ({ path: entry.path, kind: galleryKind(entry.path) }))
        .filter(entry => entry.kind);
      if (media.length) renderGalleryItems(media);
    } catch (error) {
      console.warn("No pude actualizar automáticamente la galería; uso la lista local.", error);
    }
  }
  loadAllRepoMedia();

  const dialog = $("#memoryDialog");
  const dialogContent = $("#dialogContent");
  function openDialog(item) {
    const hasPhoto = Boolean(item.photo);
    const hasTitle = Boolean(item.title);
    const hasText = Boolean(item.text);
    const modeClass = hasPhoto && !hasTitle && !hasText ? "media-only" : (!hasTitle ? "text-only" : "");
    dialogContent.innerHTML = `<div class="dialog-inner ${modeClass}">${hasPhoto ? `<img src="${item.photo}" alt="Recuerdo de Anto">` : ""}${hasTitle ? `<h4>${escapeHTML(item.title)}</h4>` : ""}${hasText ? `<p>${escapeHTML(item.text)}</p>` : ""}</div>`;
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
    btn.setAttribute("aria-label", `Abrir corazón ${i + 1}`);
    btn.addEventListener("click", () => {
      state.visitedHearts.add(i);
      btn.classList.add("visited");
      openDialog(item);
      if (state.visitedHearts.size === C.constellation.length) {
        setTimeout(() => toast("Abriste todos los corazones ❤️✨", 3500), 400);
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
  const candleTopRow = document.createElement("div");
  const candleBottomRow = document.createElement("div");
  candleTopRow.className = "candle-row candle-row-top";
  candleBottomRow.className = "candle-row candle-row-bottom";
  candlesEl.append(candleTopRow, candleBottomRow);

  for (let i = 0; i < C.age; i++) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.innerHTML = `<span class="flame"></span>`;
    (i < 8 ? candleTopRow : candleBottomRow).appendChild(candle);
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
    fireworks(3400);
    burstHearts(40);
    setTimeout(showAuroraExperience, 700);
  }

  // -----------------------------
  // Full-screen aurora
  // -----------------------------
  const auroraExperience = $("#auroraExperience");
  const auroraCanvas = $("#auroraCanvas");
  const auroraCtx = auroraCanvas.getContext("2d");
  let auroraStars = [];
  let auroraSize = { w: 0, h: 0, dpr: 1 };
  let auroraTimeStart = 0;

  function resizeAurora() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    auroraCanvas.width = Math.max(1, Math.floor(w * dpr));
    auroraCanvas.height = Math.max(1, Math.floor(h * dpr));
    auroraCanvas.style.width = `${w}px`;
    auroraCanvas.style.height = `${h}px`;
    auroraCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    auroraSize = { w, h, dpr };

    const rng = mulberry32(170117);
    auroraStars = Array.from({ length: Math.min(320, Math.floor(w * h / 4300)) }, () => ({
      x: rng() * w,
      y: rng() * h * .76,
      r: .25 + rng() * 1.25,
      a: .18 + rng() * .72,
      tw: rng() * Math.PI * 2,
      sp: .35 + rng() * .9
    }));
  }

  function auroraWave(x, w, t, layer) {
    const nx = x / Math.max(1, w);
    return (
      Math.sin(nx * (4.4 + layer * .65) + t * (.13 + layer * .018) + layer * 1.7) * .54 +
      Math.sin(nx * (10.5 + layer) - t * (.085 + layer * .012) + layer * .9) * .27 +
      Math.sin(nx * 2.15 + t * .055 + layer * 2.4) * .19
    );
  }

  function drawAuroraCurtain(ctx, cfg, t, w, h) {
    const step = Math.max(4, Math.round(w / 245));
    const baseY = h * cfg.y;
    const amp = h * cfg.amp;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    // broad luminous body
    ctx.filter = `blur(${Math.max(8, h * .013)}px)`;
    for (let x = -step; x <= w + step; x += step) {
      const n = auroraWave(x, w, t * cfg.speed, cfg.layer);
      const y = baseY + n * amp;
      const shimmer = .45 + .55 * Math.sin(x * .035 + t * .72 + cfg.layer);
      const height = h * (cfg.depth + .04 * shimmer);
      const top = y - height * .15;
      const bottom = y + height;

      const g = ctx.createLinearGradient(0, top, 0, bottom);
      const [r,gc,b] = cfg.color;
      g.addColorStop(0, `rgba(${r},${gc},${b},0)`);
      g.addColorStop(.18, `rgba(${r},${gc},${b},${cfg.alpha * .72})`);
      g.addColorStop(.48, `rgba(${r},${gc},${b},${cfg.alpha})`);
      g.addColorStop(.78, `rgba(${r},${gc},${b},${cfg.alpha * .22})`);
      g.addColorStop(1, `rgba(${r},${gc},${b},0)`);

      ctx.strokeStyle = g;
      ctx.lineWidth = step * 1.45;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.quadraticCurveTo(x + Math.sin(t + x * .02) * 5, y + height * .42, x, bottom);
      ctx.stroke();
    }

    // crisp inner folds
    ctx.filter = "blur(1.2px)";
    for (let x = 0; x <= w; x += step * 2) {
      const n = auroraWave(x, w, t * cfg.speed, cfg.layer);
      const y = baseY + n * amp;
      const fold = .5 + .5 * Math.sin(x * .058 + t * .96 + cfg.layer * 2.2);
      const height = h * (cfg.depth * (.55 + fold * .42));
      const [r,gc,b] = cfg.color;
      const g = ctx.createLinearGradient(0, y, 0, y + height);
      g.addColorStop(0, `rgba(${Math.min(255,r+42)},${Math.min(255,gc+28)},${Math.min(255,b+30)},${cfg.alpha * .9})`);
      g.addColorStop(.45, `rgba(${r},${gc},${b},${cfg.alpha * .25})`);
      g.addColorStop(1, `rgba(${r},${gc},${b},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(1, step * .44);
      ctx.beginPath();
      ctx.moveTo(x, y - h * .006);
      ctx.lineTo(x + Math.sin(t * .7 + x * .015) * 5, y + height);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMountainLayer(ctx, pts, fill, w, h) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, pts[0][1] * h);
    pts.forEach(([px, py]) => ctx.lineTo(px * w, py * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  function drawAuroraFrame(now) {
    const { w, h } = auroraSize;
    if (!w || !h || auroraExperience.hidden) return;
    const t = (now - auroraTimeStart) / 1000;
    const ctx = auroraCtx;

    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#01040d");
    sky.addColorStop(.34, "#04101d");
    sky.addColorStop(.68, "#081725");
    sky.addColorStop(1, "#02050a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // faint airglow near horizon
    const horizon = ctx.createRadialGradient(w * .52, h * .72, 0, w * .52, h * .72, w * .72);
    horizon.addColorStop(0, "rgba(83,136,143,.17)");
    horizon.addColorStop(.32, "rgba(39,79,102,.10)");
    horizon.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, w, h);

    // stars
    for (const star of auroraStars) {
      const pulse = .67 + .33 * Math.sin(t * star.sp + star.tw);
      ctx.globalAlpha = star.a * pulse;
      ctx.fillStyle = star.r > 1.15 ? "#ffffff" : "#ddecff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
      if (star.r > 1.05 && pulse > .86) {
        ctx.globalAlpha = star.a * .23;
        ctx.fillRect(star.x - star.r * 3, star.y - .35, star.r * 6, .7);
        ctx.fillRect(star.x - .35, star.y - star.r * 3, .7, star.r * 6);
      }
    }
    ctx.globalAlpha = 1;

    const curtains = [
      { layer:0, y:.12, amp:.085, depth:.33, speed:1.00, alpha:.22, color:[63,255,172] },
      { layer:1, y:.16, amp:.105, depth:.37, speed:.82, alpha:.18, color:[72,230,197] },
      { layer:2, y:.12, amp:.075, depth:.30, speed:1.13, alpha:.13, color:[121,132,255] },
      { layer:3, y:.21, amp:.082, depth:.30, speed:.72, alpha:.15, color:[76,255,190] }
    ];
    curtains.forEach(cfg => drawAuroraCurtain(ctx, cfg, t, w, h));

    // soft magenta fringe, common at high-energy edges
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${Math.max(15, h*.02)}px)`;
    const fringe = ctx.createRadialGradient(w*.66,h*.19,0,w*.66,h*.19,w*.42);
    fringe.addColorStop(0,"rgba(183,72,184,.075)");
    fringe.addColorStop(.5,"rgba(128,72,180,.03)");
    fringe.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=fringe;
    ctx.fillRect(0,0,w,h*.62);
    ctx.restore();

    // distant + near mountains for depth
    drawMountainLayer(ctx,[
      [0,.85],[.07,.80],[.13,.83],[.20,.73],[.27,.81],[.34,.76],[.41,.84],
      [.49,.75],[.56,.82],[.64,.72],[.71,.80],[.79,.75],[.87,.82],[.94,.77],[1,.84]
    ],"rgba(7,14,19,.78)",w,h);

    drawMountainLayer(ctx,[
      [0,.91],[.08,.84],[.17,.90],[.25,.79],[.34,.88],[.44,.82],[.55,.90],
      [.64,.77],[.73,.88],[.83,.82],[.92,.90],[1,.84]
    ],"rgba(1,4,7,.96)",w,h);

    // subtle foreground haze and vignette
    const fog = ctx.createLinearGradient(0,h*.72,0,h);
    fog.addColorStop(0,"rgba(83,139,139,0)");
    fog.addColorStop(.72,"rgba(42,77,82,.08)");
    fog.addColorStop(1,"rgba(4,8,10,.22)");
    ctx.fillStyle=fog;
    ctx.fillRect(0,h*.7,w,h*.3);

    const vignette = ctx.createRadialGradient(w*.5,h*.42,w*.18,w*.5,h*.45,w*.72);
    vignette.addColorStop(0,"rgba(0,0,0,0)");
    vignette.addColorStop(.7,"rgba(0,0,0,.10)");
    vignette.addColorStop(1,"rgba(0,0,0,.52)");
    ctx.fillStyle=vignette;
    ctx.fillRect(0,0,w,h);

    state.auroraRAF = requestAnimationFrame(drawAuroraFrame);
  }

  function showAuroraExperience() {
    auroraExperience.hidden = false;
    document.body.classList.add("locked");
    resizeAurora();
    auroraTimeStart = performance.now();
    requestAnimationFrame(() => auroraExperience.classList.add("show"));
    if (state.auroraRAF) cancelAnimationFrame(state.auroraRAF);
    state.auroraRAF = requestAnimationFrame(drawAuroraFrame);
  }

  function closeAuroraExperience() {
    auroraExperience.classList.remove("show");
    if (state.auroraRAF) cancelAnimationFrame(state.auroraRAF);
    state.auroraRAF = null;
    setTimeout(() => {
      auroraExperience.hidden = true;
      document.body.classList.remove("locked");
      $("#recibo").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 620);
  }

  $("#closeAuroraBtn").addEventListener("click", closeAuroraExperience);
  addEventListener("resize", debounce(() => {
    if (!auroraExperience.hidden) resizeAurora();
  }, 160));

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
  // Easter egg de la grandiosa tirana
  // -----------------------------
  let chaosClicks = 0;
  let chaosTimer = null;
  $("#chaosBtn").addEventListener("click", () => {
    chaosClicks++;
    clearTimeout(chaosTimer);
    chaosTimer = setTimeout(() => chaosClicks = 0, 4600);
    const messages = [
      "¿Qué esperabas que hiciera? 🤨",
      "Anto, obviamente ibas a apretarlo.",
      "Esto confirma mis sospechas.",
      "Nivel de curiosidad: peligrosamente alto.",
      "CERTIFICADO DESBLOQUEADO: GRANDIOSA TIRANA 👑"
    ];
    toast(messages[Math.min(chaosClicks, 5) - 1], chaosClicks >= 5 ? 3600 : 2400);
    if (chaosClicks >= 5) {
      burstHearts(27);
      fireworks(1800);
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
