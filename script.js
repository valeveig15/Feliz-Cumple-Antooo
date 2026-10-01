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
    auroraStars = Array.from({ length: Math.min(240, Math.floor(w * h / 6000)) }, () => ({
      x: rng() * w,
      y: rng() * h * .74,
      r: .35 + rng() * 1.2,
      a: .22 + rng() * .72,
      tw: rng() * Math.PI * 2
    }));
  }

  function drawAuroraFrame(now) {
    const { w, h } = auroraSize;
    if (!w || !h || auroraExperience.hidden) return;
    const t = (now - auroraTimeStart) / 1000;
    const ctx = auroraCtx;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#020615");
    sky.addColorStop(.52, "#071326");
    sky.addColorStop(1, "#02050c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // subtle horizon glow
    const horizon = ctx.createRadialGradient(w * .5, h * .72, 0, w * .5, h * .72, w * .72);
    horizon.addColorStop(0, "rgba(34,70,85,.20)");
    horizon.addColorStop(.42, "rgba(20,43,70,.08)");
    horizon.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, w, h);

    // stars
    for (const star of auroraStars) {
      const pulse = .72 + .28 * Math.sin(t * .8 + star.tw);
      ctx.globalAlpha = star.a * pulse;
      ctx.fillStyle = "#eaf6ff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const ribbons = [
      { y: .18, amp: .075, speed: .17, phase: .0, color: [73, 255, 184], width: .10 },
      { y: .25, amp: .105, speed: -.12, phase: 1.7, color: [83, 221, 208], width: .13 },
      { y: .31, amp: .085, speed: .10, phase: 3.2, color: [128, 118, 255], width: .11 },
      { y: .22, amp: .055, speed: -.19, phase: 4.8, color: [107, 255, 203], width: .075 }
    ];

    for (let r = 0; r < ribbons.length; r++) {
      const rb = ribbons[r];
      const pts = [];
      const step = Math.max(9, w / 120);
      for (let x = -40; x <= w + 40; x += step) {
        const nx = x / Math.max(w, 1);
        const wave = Math.sin(nx * 7.2 + t * rb.speed * 5 + rb.phase) * rb.amp * h
          + Math.sin(nx * 17.4 - t * rb.speed * 2.3 + rb.phase * .7) * rb.amp * h * .32
          + Math.sin(nx * 2.7 + t * .11) * rb.amp * h * .25;
        pts.push([x, h * rb.y + wave]);
      }

      const [cr, cg, cb] = rb.color;
      const grad = ctx.createLinearGradient(0, h * .04, 0, h * .62);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
      grad.addColorStop(.24, `rgba(${cr},${cg},${cb},.26)`);
      grad.addColorStop(.58, `rgba(${cr},${cg},${cb},.10)`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

      // wide glow
      ctx.beginPath();
      pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(52, h * rb.width);
      ctx.shadowColor = `rgba(${cr},${cg},${cb},.35)`;
      ctx.shadowBlur = Math.max(34, h * .045);
      ctx.globalAlpha = .85;
      ctx.stroke();

      // brighter core
      ctx.shadowBlur = Math.max(18, h * .018);
      ctx.lineWidth = Math.max(10, h * rb.width * .16);
      ctx.globalAlpha = .68;
      ctx.stroke();

      // vertical curtains
      ctx.shadowBlur = Math.max(22, h * .026);
      ctx.lineWidth = 1;
      for (let i = 1; i < pts.length - 1; i += 3) {
        const [x, y] = pts[i];
        const curtain = h * (.08 + .10 * (0.5 + 0.5 * Math.sin(i * .7 + t * .9 + rb.phase)));
        const cg2 = ctx.createLinearGradient(0, y - curtain * .45, 0, y + curtain);
        cg2.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        cg2.addColorStop(.25, `rgba(${cr},${cg},${cb},.12)`);
        cg2.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.strokeStyle = cg2;
        ctx.globalAlpha = .48;
        ctx.beginPath();
        ctx.moveTo(x, y - curtain * .45);
        ctx.lineTo(x + Math.sin(t + i) * 4, y + curtain);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // distant mountain silhouette
    ctx.fillStyle = "rgba(1,4,8,.88)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * .84);
    const peaks = [
      [0,.84],[.08,.77],[.15,.82],[.23,.70],[.31,.80],[.40,.73],[.48,.81],
      [.57,.68],[.66,.79],[.74,.72],[.82,.80],[.91,.74],[1,.82]
    ];
    peaks.forEach(([px, py]) => ctx.lineTo(px * w, py * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

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
