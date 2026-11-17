"use strict";

/* =========================================================
   STAGES + STATE
   ========================================================= */
var STAGES = ["intro", "balloons", "cake", "bouquet", "envelope", "letter", "gift", "final"];
var current = "intro";
var stageEl = document.getElementById("stage");
var mainTimer = null;

/* =========================================================
   HELPERS
   ========================================================= */
function el(tag, cls, html) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function clearTimers() {
  if (mainTimer) { clearTimeout(mainTimer); mainTimer = null; }
  var t = window.__timers;
  if (t) { for (var i = 0; i < t.length; i++) clearTimeout(t[i]); t.length = 0; }
}
function later(fn, ms) {
  var id = setTimeout(fn, ms);
  if (!window.__timers) window.__timers = [];
  window.__timers.push(id);
  return id;
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

/* replaces {name} in config.js texts with the name from config.js */
function fmt(s) {
  return String(s == null ? "" : s).replace(/\{name\}/g, esc(NAME));
}
function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

var ICONS = {
  arrowLeft: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>',
  smile: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>'
};
var ICON_BY_NAME = { heart: ICONS.heart, sparkles: ICONS.sparkles, smile: ICONS.smile, star: ICONS.star };

/* =========================================================
   NAVIGATION
   ========================================================= */
function goTo(stage, opts) {
  if (STAGES.indexOf(stage) === -1) return;
  opts = opts || {};
  clearTimers();
  var old = stageEl.firstElementChild;
  if (old) { old.classList.add("is-leaving"); }
  var mount = RENDER[stage];
  var view = mount();
  current = stage;
  if (!opts.instant) view.style.animationDelay = "0s";
  if (old) {
    old.remove();
    // keep DOM light
  }
  stageEl.appendChild(view);
  onEnter(stage, view);
}
function goNext() {
  var i = STAGES.indexOf(current);
  if (i < STAGES.length - 1) goTo(STAGES[i + 1]);
}
function goBack() {
  var i = STAGES.indexOf(current);
  if (i > 0) goTo(STAGES[i - 1]);
}
function replay() { goTo("intro"); }

function screen(cls) {
  var s = el("section", "screen" + (cls ? " " + cls : ""));
  s.setAttribute("role", "group");
  return s;
}
function backBtn() {
  var b = el("button", "btn-back", ICONS.arrowLeft);
  b.type = "button";
  b.setAttribute("aria-label", "Go back");
  b.title = "Go back";
  b.addEventListener("click", goBack);
  return b;
}
function shine() { return '<span class="shine" aria-hidden="true"></span>'; }

/* =========================================================
   SCREEN RENDERERS (return unmounted DOM nodes)
   ========================================================= */
var RENDER = {};

/* ---------- INTRO ---------- */
RENDER.intro = function () {
  var s = screen();
  var title = el("h1", "intro-title", fmt(TEXT.introTitle));
  title.style.animationDelay = "0.4s";

  var hero = el("div", "intro-hero");
  var glow = el("div", "intro-glow");
  var photo = document.createElement("img");
  photo.className = "intro-photo";
  photo.src = IMG.intro;
  photo.alt = "Portrait of " + NAME;
  hero.appendChild(glow);
  hero.appendChild(photo);
  hero.style.animationDelay = "0.6s";

  var copy = el("p", "intro-copy",
    TEXT.introCopy);
  copy.style.animationDelay = "1.1s";

  var actions = el("div", "intro-actions");
  var yesWrap = el("div", "no-wrap");
  var yes = el("button", "btn btn-primary btn-shine intro-yes", TEXT.introYes + shine());
  yes.type = "button";
  yes.id = "btnYes";
  var no = el("button", "btn btn-ghost intro-no", TEXT.introNo);
  no.type = "button";
  no.id = "btnNo";
  yesWrap.appendChild(yes);
  actions.appendChild(yesWrap);
  actions.appendChild(no);
  actions.style.animationDelay = "1.5s";

  s.appendChild(title);
  s.appendChild(hero);
  s.appendChild(copy);
  s.appendChild(actions);
  return s;
};

/* ---------- BALLOONS ---------- */
RENDER.balloons = function () {
  var s = screen("screen--top-sm");
  s.appendChild(backBtn());
  var note = el("p", "balloon-note", TEXT.balloonNote);
  var title = el("h2", "balloon-title", fmt(TEXT.balloonTitle));
  var sub = el("p", "balloon-sub", TEXT.balloonSub);

  var grid = el("div", "balloon-grid");
  var colors = ["hsl(350,50%,55%)", "hsl(38,70%,55%)", "hsl(345,40%,48%)", "hsl(350,40%,72%)"];
  var darks = ["hsl(350,55%,42%)", "hsl(38,75%,42%)", "hsl(345,50%,36%)", "hsl(350,45%,58%)"];
  for (var i = 0; i < 4; i++) {
    var cell = el("div", "balloon-cell");
    var slot = el("div", "balloon-slot");
    var btn = el("button", "balloon-btn");
    btn.type = "button";
    btn.setAttribute("aria-label", "Pop balloon " + (i + 1));
    btn.dataset.idx = String(i);
    var delay = (i * 0.13) + "s";
    var svg =
      '<span class="balloon-float" style="animation-delay:' + delay + '">' +
      '<svg viewBox="0 0 60 90" aria-hidden="true">' +
      '<ellipse cx="30" cy="30" rx="21" ry="27" fill="' + colors[i] + '"/>' +
      '<ellipse cx="22" cy="21" rx="6" ry="8" fill="rgba(255,255,255,0.45)"/>' +
      '<path d="M30 57 l-4 6 h8 z" fill="' + darks[i] + '"/>' +
      '<path d="M30 63 C 34 70, 26 76, 30 88" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" fill="none"/>' +
      "</svg></span>";
    btn.innerHTML = svg;
    slot.appendChild(btn);
    var wordSlot = el("div", "word-slot");
    cell.appendChild(slot);
    cell.appendChild(wordSlot);
    grid.appendChild(cell);
  }
  var btnWrap = el("div");
  var cont = el("button", "btn btn-primary btn-continue-sm", TEXT.balloonContinue);
  cont.type = "button";
  cont.disabled = true;
  cont.style.opacity = "0.5";
  cont.addEventListener("click", goNext);
  btnWrap.appendChild(cont);
  btnWrap.style.display = "none";

  s.appendChild(note);
  s.appendChild(title);
  s.appendChild(sub);
  s.appendChild(grid);
  s.appendChild(btnWrap);
  s.dataset.popped = "0";
  s.__cont = cont;
  s.__btnWrap = btnWrap;
  return s;
};

/* ---------- CAKE ---------- */
RENDER.cake = function () {
  var s = screen();
  s.appendChild(backBtn());
  s.appendChild(el("div", "blur-blob"));

  var title = el("h2", "cake-title", fmt(TEXT.cakeTitle));
  title.style.animationDelay = "0.4s";
  var sub = el("p", "cake-sub", TEXT.cakeSub);
  sub.style.animationDelay = "0.6s";

  var stageBox = el("div", "cake-stage");
  var shadow = el("div", "cake-shadow");
  var floatBox = el("div", "cake-float");
  var img = document.createElement("img");
  img.className = "cake-img";
  img.src = IMG.cake;
  img.alt = "Birthday cake with five lit candles";
  img.style.animationDelay = "0.6s, 1.2s";
  floatBox.appendChild(img);
  stageBox.appendChild(shadow);
  stageBox.appendChild(floatBox);

  var hint = el("p", "cake-sub", TEXT.cakeHint);
  hint.style.animationDelay = "0.9s";
  hint.style.marginBottom = "0";

  s.appendChild(title);
  s.appendChild(sub);
  s.appendChild(stageBox);
  s.appendChild(hint);
  s.__blown = 0;
  s.__hint = hint;
  return s;
};

/* ---------- BOUQUET ---------- */
RENDER.bouquet = function () {
  var s = screen("screen--top");
  s.appendChild(backBtn());
  s.appendChild(el("div", "bq-glow"));
  var title = el("h2", "bq-title", fmt(TEXT.bouquetTitle));
  title.style.animationDelay = "0.3s";
  var sub = el("p", "bq-sub", TEXT.bouquetSub);
  sub.style.animationDelay = "0.45s";

  var icons = el("div", "bq-icons");
  for (var i = 0; i < REASONS.length; i++) {
    var r = REASONS[i];
    var b = el("button", "bq-icon");
    b.type = "button";
    b.dataset.idx = String(i);
    b.style.setProperty("--btn-gradient", r.color);
    b.style.setProperty("--btn-shadow", "0 6px 20px " + r.bg);
    b.setAttribute("aria-label", "Reveal reason: " + r.title);
    b.innerHTML =
      '<span style="color:' + r.color + ';display:flex">' + ICON_BY_NAME[r.icon] + "</span>" +
      '<span class="bq-ping" style="color:' + r.color + '"><span class="dot"></span><span class="ring"></span></span>';
    icons.appendChild(b);
  }

  var slot = el("div", "bq-card-slot");
  slot.appendChild(el("p", "bq-prompt", TEXT.bouquetPrompt));

  var wrap = el("div", "bq-bouquet-wrap");
  wrap.appendChild(el("div", "bq-bouquet-shadow"));
  var bq = document.createElement("img");
  bq.className = "bq-bouquet";
  bq.src = IMG.bouquet;
  bq.alt = "Bouquet of red roses";
  bq.style.animationDelay = "0.5s, 1s";
  wrap.appendChild(bq);
  var petalLayer = el("div", "petal-layer");

  var cont = el("button", "btn btn-primary btn-continue", TEXT.bouquetContinue + shine());
  cont.type = "button";
  cont.addEventListener("click", goNext);

  s.appendChild(title);
  s.appendChild(sub);
  s.appendChild(icons);
  s.appendChild(slot);
  s.appendChild(wrap);
  s.appendChild(cont);
  s.appendChild(petalLayer);
  s.__seen = {};
  s.__slot = slot;
  s.__glow = s.querySelector(".bq-glow");
  s.__petals = petalLayer;
  return s;
};

/* ---------- ENVELOPE ---------- */
RENDER.envelope = function () {
  var s = screen();
  s.appendChild(backBtn());
  s.appendChild(el("div", "blur-blob"));
  var h = el("h2", "env-heading", fmt(TEXT.envelopeTitle));
  h.style.animationDelay = "0.4s";

  var btn = el("button", "env-btn");
  btn.type = "button";
  btn.setAttribute("aria-label", "Open the envelope");
  var bob = el("span", "env-bob");
  bob.innerHTML =
    '<div class="env-body">' +
      '<div class="env-base"><div class="env-trim"></div></div>' +
      '<div class="env-letter"><span>' + TEXT.envelopeForYou + '</span></div>' +
      '<div class="env-flap"><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 60 L100 0 L200 60 Z" fill="#ffd9e2" stroke="#f9c6d3"/><path d="M0 60 L100 12 L200 60" fill="none" stroke="#fbd0dc" stroke-width="2"/></svg></div>' +
      '<div class="env-seal">💌</div>' +
    "</div>";
  btn.appendChild(bob);

  var hint = el("p", "env-hint", TEXT.envelopeHint);
  hint.style.animationDelay = "0.8s";

  s.appendChild(h);
  s.appendChild(btn);
  s.appendChild(hint);
  s.__btn = btn;
  return s;
};

/* ---------- LETTER ---------- */
RENDER.letter = function () {
  var s = screen("screen--top");
  s.appendChild(backBtn());
  s.appendChild(el("h2", "sr-only", fmt(TEXT.letterTitle)));
  var card = el("div", "letter-card");
  card.appendChild(el("div", "letter-badge", "❤"));
  var text = el("p", "letter-text");
  var sticker = document.createElement("img");
  sticker.className = "letter-sticker";
  sticker.src = IMG.letterSticker;
  sticker.alt = "";
  sticker.setAttribute("aria-hidden", "true");
  card.appendChild(text);
  card.appendChild(sticker);

  var cont = el("button", "btn btn-primary btn-continue", TEXT.letterContinue + shine());
  cont.type = "button";
  cont.style.display = "none";
  cont.addEventListener("click", goNext);

  s.appendChild(card);
  s.appendChild(cont);
  s.__text = text;
  s.__cont = cont;
  return s;
};

/* ---------- GIFT ---------- */
RENDER.gift = function () {
  var s = screen();
  s.appendChild(backBtn());
  s.appendChild(el("div", "blur-blob"));
  var t = el("h2", "gift-title", TEXT.giftTitle);
  t.style.animationDelay = "0.3s";
  var sub = el("p", "gift-sub", TEXT.giftSub);
  sub.style.animationDelay = "0.45s";

  var btn = el("button", "gift-btn");
  btn.type = "button";
  btn.setAttribute("aria-label", "Open the gift");
  var img = document.createElement("img");
  img.src = IMG.gift;
  img.alt = "A wrapped gift box";
  btn.appendChild(img);

  var hint = el("p", "env-hint", TEXT.giftHint);
  hint.style.animationDelay = "0.7s";

  s.appendChild(t);
  s.appendChild(sub);
  s.appendChild(btn);
  s.appendChild(hint);
  s.__btn = btn;
  s.__hint = hint;
  return s;
};

/* ---------- FINAL ---------- */
RENDER.final = function () {
  var s = screen("screen--top screen--clip");
  var t = el("h2", "final-title", fmt(TEXT.finalTitle));
  t.style.animationDelay = "0.2s";

  var card = el("div", "final-card");
  var img = document.createElement("img");
  img.src = IMG.final;
  img.alt = "Happy Birthday illustration";
  card.appendChild(img);

  var line = el("p", "final-line", fmt(TEXT.finalLine));
  line.style.animationDelay = "0.5s";
  var line2 = el("p", "final-line", TEXT.finalLine2);
  line2.style.animationDelay = "0.65s";

  var replayBtn = el("button", "btn-replay", TEXT.replayBtn);
  replayBtn.type = "button";
  replayBtn.addEventListener("click", replay);

  s.appendChild(card);
  s.appendChild(t);
  s.appendChild(line);
  s.appendChild(line2);
  s.appendChild(replayBtn);
  return s;
};


/* =========================================================
   PER-STAGE BEHAVIOUR (after the view is in the DOM)
   ========================================================= */
function onEnter(stage, view) {
  if (stage === "intro") enterIntro(view);
  else if (stage === "balloons") enterBalloons(view);
  else if (stage === "cake") enterCake(view);
  else if (stage === "bouquet") enterBouquet(view);
  else if (stage === "envelope") enterEnvelope(view);
  else if (stage === "letter") enterLetter(view);
  else if (stage === "gift") enterGift(view);
  else if (stage === "final") enterFinal(view);

  // stage 1 (intro) has no back button — same as reference
  if (stage !== "intro" && stage !== "final" && !view.querySelector(".btn-back")) {
    view.appendChild(backBtn());
  }
}

/* ---------- INTRO: Yes dodges the cursor 4 times, No flees the cursor ---------- */
function enterIntro(view) {
  var yes = view.querySelector("#btnYes");
  var no = view.querySelector("#btnNo");
  var noWrap = no ? no.parentNode : null;
  var dodges = 0;
  var targets = [
    { x: 80, y: -30 },
    { x: -90, y: 20 },
    { x: 60, y: 40 },
    { x: -75, y: -40 }
  ];
  var lastDodge = 0;

  function dodge() {
    if (dodges >= targets.length) return false;
    var t = targets[dodges];
    var vw = window.innerWidth;
    var margin = 12;
    var tx = clamp(t.x, -vw / 2 + margin, vw / 2 - margin);
    yes.style.setProperty("--tx", tx + "px");
    yes.style.setProperty("--ty", t.y + "px");
    dodges++;
    lastDodge = Date.now();
    return true;
  }

  /* the button hops away as the cursor comes near it — four times */
  var approach = function (e) {
    if (dodges >= targets.length) return;
    if (Date.now() - lastDodge < 350) return;
    var r = yes.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var dx = cx - (e.clientX || cx);
    var dy = cy - (e.clientY || cy);
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < Math.max(r.width, r.height) / 2 + 54) dodge();
  };
  document.addEventListener("mousemove", approach);
  document.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches[0]) approach(e.touches[0]);
  }, { passive: true });

  yes.addEventListener("click", function () {
    if (dodge()) return;
    yes.disabled = true;
    no.disabled = true;
    burst(view);
    later(function () { goNext(); }, 450);
  });

  if (no) {
    var jitter = function (e) {
      var r = no.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = cx - (e.clientX || cx);
      var dy = cy - (e.clientY || cy);
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var range = 110;
      if (d < range + 40) {
        var push = ((range + 40 - d) / (range + 40)) * range;
        var nx = (dx / d) * push;
        var ny = (dy / d) * push;
        var maxX = window.innerWidth / 2 - no.offsetWidth / 2 - 12;
        var maxY = window.innerHeight / 2 - no.offsetHeight / 2 - 12;
        if (noWrap) {
          noWrap.style.setProperty("--tx", clamp(nx, -maxX, maxX) + "px");
          noWrap.style.setProperty("--ty", clamp(ny, -maxY, maxY) + "px");
        }
      }
    };
    document.addEventListener("mousemove", jitter);
    document.addEventListener("touchmove", function (e) {
      if (e.touches && e.touches[0]) jitter(e.touches[0]);
    }, { passive: true });
    no.addEventListener("click", function () {
      // sneaky: "no" eventually agrees
      if (!no.dataset.tried) {
        no.dataset.tried = "1";
        no.textContent = TEXT.introNoConfirm;
        return;
      }
      yes.click();
    });
  }
}

/* ---------- BALLOONS ---------- */
function enterBalloons(view) {
  var slots = view.querySelectorAll(".balloon-btn");
  Array.prototype.forEach.call(slots, function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      btn.disabled = true;
      var i = parseInt(btn.dataset.idx, 10);
      var slot = btn.closest(".balloon-slot");
      var cell = btn.closest(".balloon-cell");
      slot.classList.add("is-popped");
      later(function () { slot.classList.add("is-empty"); }, 260);
      burst(btn, { particles: 10 });
      var word = el("span", "word", esc(BALLOON_WORDS[i]));
      cell.querySelector(".word-slot").appendChild(word);
      var popped = parseInt(view.dataset.popped, 10) + 1;
      view.dataset.popped = String(popped);
      if (popped >= 4) {
        view.__btnWrap.style.display = "block";
        view.__cont.style.opacity = "1";
        view.__cont.disabled = false;
        confetti(60);
      }
    });
  });
}

/* ---------- CAKE: tap candles to blow them out ---------- */
function enterCake(view) {
  var img = view.querySelector(".cake-img");
  var box = view.querySelector(".cake-stage");
  var blown = 0;
  var total = 3;

  // candle positions are percentage-based over the cake image
  var pos = [
    { x: 43, y: 14 }, { x: 51, y: 11 }, { x: 60, y: 15 }
  ];
  var flames = [];
  pos.forEach(function (p, idx) {
    var wick = el("div", "wick");
    wick.style.left = p.x + "%";
    wick.style.top = (p.y + 2.4) + "%";
    var flame = el("div", "flame");
    flame.style.left = p.x + "%";
    flame.style.top = (p.y - 1.2) + "%";
    flame.style.animationDelay = (idx * 0.17) + "s";
    flame.setAttribute("role", "button");
    flame.setAttribute("tabindex", "0");
    flame.setAttribute("aria-label", "Blow out candle " + (idx + 1));
    flame.style.cursor = "pointer";
    var hit = function () {
      if (flame.dataset.out) return;
      flame.dataset.out = "1";
      flame.style.animation = "none";
      flame.style.opacity = "0";
      wick.style.opacity = "0.3";
      blown++;
      view.__hint.textContent = "That's " + blown + " of " + total + " 🕯️";
      burst(flame, { particles: 6, emoji: ["💨", "✨"] });
      if (blown >= total) {
        view.__hint.textContent = TEXT.cakeWishMade;
        confetti(120);
        later(function () { burst(view); }, 400);
        later(goNext, 1700);
      }
    };
    flame.addEventListener("click", hit);
    flame.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(); }
    });
    box.appendChild(wick);
    box.appendChild(flame);
    flames.push(flame);
  });

  // clicking the cake itself blows one random candle (fallback)
  img.addEventListener("click", function () {
    var lit = flames.filter(function (f) { return !f.dataset.out; });
    if (lit.length) lit[0].click();
  });
}

/* ---------- BOUQUET ---------- */
function enterBouquet(view) {
  var icons = view.querySelectorAll(".bq-icon");
  var seen = view.__seen;
  var count = 0;
  Array.prototype.forEach.call(icons, function (b) {
    b.addEventListener("click", function () {
      var i = parseInt(b.dataset.idx, 10);
      var r = REASONS[i];
      Array.prototype.forEach.call(icons, function (o) { o.classList.remove("is-active"); });
      b.classList.add("is-active");

      var slot = view.__slot;
      slot.innerHTML = "";
      var card = el("div", "bq-card");
      card.style.setProperty("--card-color", r.color);
      card.innerHTML =
        '<div class="bq-card-lines"></div>' +
        '<span class="bq-card-badge" style="background:' + r.color + '">' + (i + 1) + "</span>" +
        "<h4 style=\"color:" + r.color + "\">" + esc(r.title) + "</h4>" +
        "<p>" + esc(r.text) + "</p>";
      slot.appendChild(card);
      view.__glow.style.background = r.color;

      if (!seen[i]) { seen[i] = true; count++; }
      burst(b, { particles: 8, emoji: ["🌸", "💐", "🌷"] });
      if (count >= REASONS.length) spawnPetals(view);
    });
  });
}
function spawnPetals(view) {
  var layer = view.__petals;
  for (var i = 0; i < 16; i++) {
    var p = el("span", "petal");
    p.style.setProperty("--x0", rand(-30, 30) + "px");
    p.style.setProperty("--x1", rand(-140, -40) + "px");
    p.style.setProperty("--x2", rand(-220, -80) + "px");
    p.style.setProperty("--x3", rand(-300, -120) + "px");
    p.style.setProperty("--r0", rand(0, 360) + "deg");
    p.style.left = rand(35, 65) + "%";
    p.style.background = pick(["#e11d48", "#fb7185", "#fda4af", "#f43f5e"]);
    p.style.animationDelay = (i * 0.12) + "s";
    layer.appendChild(p);
  }
  confetti(40);
}

/* ---------- ENVELOPE ---------- */
function enterEnvelope(view) {
  var btn = view.__btn;
  var opened = false;
  btn.addEventListener("click", function () {
    if (opened) return;
    opened = true;
    btn.classList.add("is-open");
    burst(btn, { particles: 12, emoji: ["💌", "✉️", "💕"] });
    view.querySelector(".env-hint").textContent = TEXT.envelopeOpening;
    later(function () { goNext(); }, 1600);
  });
}

/* ---------- LETTER: typewriter ---------- */
function enterLetter(view) {
  var text = view.__text;
  var cont = view.__cont;
  var full = LETTER_TEXT;
  var i = 0;
  var cursor = '<span class="letter-cursor">|</span>';
  var step = function () {
    if (current !== "letter") return;
    i = Math.min(full.length, i + 2);
    var shown = esc(full.slice(0, i));
    text.innerHTML = shown + (i < full.length ? cursor : "");
    if (i < full.length) {
      later(step, 18);
    } else {
      cont.style.display = "inline-flex";
      confetti(50);
    }
  };
  text.innerHTML = cursor;
  later(step, 600);
}

/* ---------- GIFT ---------- */
function enterGift(view) {
  var btn = view.__btn;
  var opened = false;
  btn.addEventListener("click", function () {
    if (opened) return;
    opened = true;
    btn.classList.add("is-opening");
    btn.disabled = true;
    view.__hint.textContent = TEXT.giftOpening;
    burst(btn, { particles: 24, emoji: ["🎉", "✨", "🎀", "💖"] });
    confetti(90);
    later(function () { goNext(); }, 900);
  });
}

/* ---------- FINAL ---------- */
function enterFinal(view) {
  confetti(160, 4000);
  burst(view, { particles: 30, emoji: ["🎉", "💕", "🎂", "✨", "🌷", "🎈"] });
  // one more celebratory wave
  later(function () { confetti(80, 3000); }, 700);
  later(function () { burst(view, { particles: 20, emoji: ["❤️", "✨"] }); }, 1400);
}

/* =========================================================
   EFFECTS
   ========================================================= */
var bgHearts = document.getElementById("bgHearts");
var confettiLayer = document.getElementById("confettiLayer");
var burstLayer = document.getElementById("burstLayer");
var CONFETTI_COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fbbf24", "#fde68a", "#a78bfa", "#f9a8d4"];
var HEARTS = ["🌸", "💕", "🌷", "✨", "🌹", "🤍", "💫", "🎠"];
var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildHearts() {
  if (reduced) return;
  for (var i = 0; i < 14; i++) {
    var h = el("span", "float-heart");
    h.style.left = rand(0, 100).toFixed(1) + "%";
    h.style.setProperty("--dur", rand(9, 17).toFixed(1) + "s");
    h.style.setProperty("--delay", (-rand(0, 16)).toFixed(1) + "s");
    h.style.setProperty("--sway", rand(3, 6).toFixed(1) + "s");
    var inner = el("span", "float-heart-inner", pick(HEARTS));
    inner.style.fontSize = rand(14, 30).toFixed(0) + "px";
    inner.style.opacity = rand(0.35, 0.8).toFixed(2);
    h.appendChild(inner);
    bgHearts.appendChild(h);
  }
}

function confetti(count, duration) {
  if (reduced) return;
  count = count || 60;
  duration = duration || 2600;
  for (var i = 0; i < count; i++) {
    var piece = el("span", "confetti-piece");
    var isDot = Math.random() < 0.4;
    var w = isDot ? rand(5, 9) : rand(6, 12);
    var h = isDot ? w : rand(8, 16);
    piece.style.left = rand(0, 100).toFixed(1) + "%";
    piece.style.width = w.toFixed(0) + "px";
    piece.style.height = h.toFixed(0) + "px";
    piece.style.borderRadius = isDot ? "9999px" : pick(["2px", "6px", "50%"]);
    piece.style.background = pick(CONFETTI_COLORS);
    piece.style.setProperty("--dur", (duration / 1000).toFixed(2) + "s");
    piece.style.setProperty("--delay", rand(0, 1.6).toFixed(2) + "s");
    confettiLayer.appendChild(piece);
    (function (node) {
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); },
        duration + 1600);
    })(piece);
  }
}

function burst(anchor, opts) {
  if (!anchor) return;
  opts = opts || {};
  var r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  var cx = r.left + r.width / 2;
  var cy = r.top + r.height / 2;
  var x = (cx / window.innerWidth) * 100;
  var y = (cy / window.innerHeight) * 100;

  var circle = el("div", "burst-circle");
  circle.style.left = x + "%";
  circle.style.top = y + "%";
  burstLayer.appendChild(circle);
  setTimeout(function () { if (circle.parentNode) circle.parentNode.removeChild(circle); }, 600);

  var n = opts.particles || 14;
  var emojis = opts.emoji || ["💕", "✨", "🎉"];
  for (var i = 0; i < n; i++) {
    var ang = (i / n) * Math.PI * 2 + rand(-0.25, 0.25);
    var dist = rand(40, 120);
    var p = el("span", "burst-p");
    p.style.left = x + "%";
    p.style.top = y + "%";
    p.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
    p.style.setProperty("--dy", (Math.sin(ang) * dist - 40).toFixed(1) + "px");
    p.style.setProperty("--delay", rand(0, 0.12).toFixed(2) + "s");
    if (opts.emoji) {
      p.textContent = pick(emojis);
      p.style.fontSize = rand(14, 24).toFixed(0) + "px";
    } else {
      var dot = document.createElement("i");
      var sz = rand(6, 11);
      dot.style.width = sz.toFixed(0) + "px";
      dot.style.height = sz.toFixed(0) + "px";
      dot.style.background = pick(CONFETTI_COLORS);
      p.appendChild(dot);
    }
    burstLayer.appendChild(p);
    (function (node) {
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 700);
    })(p);
  }
}

/* =========================================================
   MUSIC — external file if AUDIO_SRC is set, else a tiny
   Web-Audio music-box rendition of "Happy Birthday"
   ========================================================= */
var Music = (function () {
  var audio = null;
  var ctx = null, master = null, timer = null;
  var playing = false;
  var usingSynth = false;

  var MELODY = [ // [beatOffset, midi, beats]
    [0, 60, 1], [1, 60, 1], [2, 62, 1.5], [3.5, 60, 1.5], [5, 65, 1.5], [6.5, 64, 3],
    [0, 60, 1], [1, 60, 1], [2, 62, 1.5], [3.5, 60, 1.5], [5, 67, 1.5], [6.5, 65, 3],
    [0, 60, 1], [1, 60, 1], [2, 72, 1.5], [3.5, 69, 1.5], [5, 65, 1.5], [6.5, 64, 1.5], [8, 62, 3],
    [0, 70, 1], [1, 70, 1], [2, 69, 1.5], [3.5, 65, 1.5], [5, 67, 1.5], [6.5, 65, 3]
  ];
  var BARS = 11.5; // full melody length in beats

  function ensureCtx() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    return true;
  }
  function note(midi, t, dur) {
    var freq = 440 * Math.pow(2, (midi - 69) / 12);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    var o2 = ctx.createOscillator();
    o.type = "triangle";
    o2.type = "sine";
    o.frequency.value = freq;
    o2.frequency.value = freq * 2;
    var peak = 0.16;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o2.connect(g);
    var g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o2.connect(g2); g2.connect(g);
    g.connect(master);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function playLoop() {
    if (!playing || !usingSynth) return;
    var beat = 60 / 96; // ~96 bpm
    var t0 = ctx.currentTime + 0.08;
    for (var i = 0; i < MELODY.length; i++) {
      var b = MELODY[i][0];
      var m = MELODY[i][1];
      var d = MELODY[i][2];
      note(m, t0 + b * beat, Math.min(d * beat, 1.4));
      // soft bass every bar
      if (b === 0 || b === 2) note(m - 24, t0 + b * beat, beat * 1.5);
    }
    timer = setTimeout(playLoop, BARS * beat * 1000);
  }

  function start() {
    if (playing) return true;
    if (AUDIO_SRC) {
      if (!audio) {
        audio = new Audio(AUDIO_SRC);
        audio.loop = true;
        audio.volume = 0;
        audio.addEventListener("ended", function () { if (playing) audio.play().catch(function(){}); });
      }
      if (ctx) { try { ctx.resume(); } catch (e) {} }
      audio.play().then(function () {
        fadeTo(MUSIC_GAIN, 600);
      }).catch(function () { return false; });
      playing = true;
      usingSynth = false;
      UI.sync();
      return true;
    }
    if (!ensureCtx()) { playing = true; UI.sync(); return false; }
    if (ctx.state === "suspended") ctx.resume();
    usingSynth = true;
    playing = true;
    fadeTo(MUSIC_GAIN, 600);
    playLoop();
    UI.sync();
    return true;
  }
  function stop() {
    if (!playing) return;
    playing = false;
    fadeTo(0, 400, function () {
      if (usingSynth && timer) { clearTimeout(timer); timer = null; }
      if (audio) audio.pause();
    });
    UI.sync();
  }
  function toggle() { playing ? stop() : start(); }
  function fadeTo(v, ms, cb) {
    if (usingSynth && master && ctx) {
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.linearRampToValueAtTime(v, t + ms / 1000);
      if (cb) setTimeout(cb, ms);
      return;
    }
    if (audio) {
      var from = audio.volume, startT = Date.now();
      var iv = setInterval(function () {
        var k = Math.min(1, (Date.now() - startT) / ms);
        audio.volume = clamp(from + (v - from) * k, 0, 1);
        if (k >= 1) { clearInterval(iv); if (cb) cb(); }
      }, 16);
    } else if (cb) cb();
  }
  function fadeOut(ms) { fadeTo(0, ms || 400, function () { if (usingSynth && timer) { clearTimeout(timer); timer = null; } if (audio) audio.pause(); }); playing = false; UI.sync(); }

  var UI = {
    sync: function () {
      var btn = document.getElementById("musicBtn");
      var label = document.getElementById("brandMusicLabel");
      if (btn) {
        btn.classList.toggle("is-playing", playing);
        btn.setAttribute("aria-pressed", playing ? "true" : "false");
        btn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      }
      if (label) label.textContent = playing ? "Pause the music" : "Play the music";
      if (playing) UI.hideTip();
    },
    hideTip: function () {
      var tip = document.getElementById("musicTip");
      if (tip && !tip.classList.contains("is-hidden")) tip.classList.add("is-hidden");
    }
  };

  return { start: start, stop: stop, toggle: toggle, fadeOut: fadeOut, isPlaying: function () { return playing; }, UI: UI };
})();

function bindMusic() {
  var btn = document.getElementById("musicBtn");
  var tip = document.getElementById("musicTip");
  var tipPlay = document.getElementById("musicTipPlay");
  if (btn) btn.addEventListener("click", function () { Music.toggle(); });
  if (tipPlay) tipPlay.addEventListener("click", function (e) { e.stopPropagation(); Music.start(); });
  if (tip) tip.addEventListener("click", function () { Music.toggle(); });
  // the prompt disappears after a while anyway
  setTimeout(function () { Music.UI.hideTip(); }, 6000);

  // first interaction with the page starts the music (browser autoplay policy);
  // clicks that target the music controls are handled by those controls only
  var kick = function (e) {
    if (e && e.target && e.target.closest && e.target.closest("#musicBtn, #musicTip, #musicTipPlay, #brandMusic")) return;
    if (!Music.isPlaying()) Music.start();
    document.removeEventListener("pointerdown", kick);
    document.removeEventListener("keydown", kick);
  };
  document.addEventListener("pointerdown", kick);
  document.addEventListener("keydown", kick);
}

/* =========================================================
   CORNER WIDGET
   ========================================================= */
function bindBrand() {
  var panel = document.getElementById("brandPanel");
  var btn = document.getElementById("brandBtn");
  var replayBtn = document.getElementById("brandReplay");
  var musicBtn = document.getElementById("brandMusic");
  if (!panel || !btn) return;
  var open = false;
  function setOpen(v) {
    open = v;
    panel.hidden = !open;
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close quick actions" : "Open quick actions");
    if (open) {
      // re-trigger the enter animation
      panel.style.animation = "none";
      void panel.offsetWidth;
      panel.style.animation = "";
    }
  }
  btn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!open); });
  document.addEventListener("click", function (e) {
    if (open && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) setOpen(false); });
  replayBtn.addEventListener("click", function () { setOpen(false); replay(); });
  musicBtn.addEventListener("click", function () { Music.toggle(); });
}

/* =========================================================
   BOOT
   ========================================================= */
buildHearts();
bindMusic();
bindBrand();
document.title = fmt(TEXT.pageTitle);
goTo("intro", { instant: true });
