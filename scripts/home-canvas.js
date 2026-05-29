const LETTER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];
const BRAND_LETTERS = ["Z", "e", "r", "o", "W", "a", "l", "k"];
const SLOGAN_TEXT = "Walk in. Make AI work.";
const SLOGAN_CHARS = [...SLOGAN_TEXT].filter((ch) => ch !== " ");
const EDGE = 80;
const NAV_SAFE_TOP = 80;
const TRAIL_MAX = 4;
const TRAIL_INTERVAL = 3;
const PARTICLE_COUNT = 32;
const ASSEMBLE_MS = 650;
const IDLE_MS = 5000;
const DISPERSE_MS = 1200;
const MAX_DPR = 2;
const LOGO_SRC = window.ZeroWalk.home.logoSrc;
const LOGO_FALLBACK = window.ZeroWalk.home.logoFallback;
const QR_SRC = window.ZeroWalk.home.qrSrc;
const ui = window.ZeroWalkHomeUI;
const FONT_FAMILY = "'Fraunces', Georgia, 'Times New Roman', serif";
const BRAND_COLOR = "#111111";
const SLOGAN_COLOR = "#b5b3ad";
const SLOGAN_TRACKING = 0.06;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerpColor(fromHex, toHex, t) {
  const a = hexToRgb(fromHex);
  const b = hexToRgb(toHex);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `rgb(${r},${g},${bl})`;
}

function getAssembledFontSize() {
  if (window.innerWidth < 768) {
    return window.innerWidth * 0.12;
  }
  return Math.min(window.innerWidth * 0.105, 128);
}

function getSloganFontSize(brandSize) {
  return Math.max(11, brandSize * 0.22);
}

function getLogoAspect() {
  if (!logoImg || !logoImg.naturalWidth) return 1.26;
  return logoImg.naturalWidth / logoImg.naturalHeight;
}

function getLogoWidthFromHeight(h) {
  return h * getLogoAspect();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function wanderBrandSize() {
  return rand(92, 118);
}

function wanderSloganSize() {
  return rand(52, 72);
}

function fontAt(size, group) {
  if (group === "slogan") {
    return `italic 400 ${size}px ${FONT_FAMILY}`;
  }
  return `600 ${size}px ${FONT_FAMILY}`;
}

function colorAt(index) {
  return LETTER_COLORS[index % LETTER_COLORS.length];
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
const hint = document.getElementById("hint");

let state = "wander";
let width = 0;
let height = 0;
let objects = [];
let particles = [];
let logoImg = null;
let rafId = null;
let startTime = performance.now();
let assembleStart = 0;
let colorFadeStart = 0;
let disperseStart = 0;
let assembledFontSize = 48;
let sloganFontSize = 18;
let logoTargetSize = 48;
let idleTimer = null;
let colorIndex = 0;
let frameId = 0;
let sloganCacheKey = "";
let brandCacheKey = "";
let cachedSloganLayout = null;
let brandWidthCache = null;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleTimer() {
  clearIdleTimer();
  if (state !== "hold" || ui.isModalOpen()) return;
  idleTimer = setTimeout(startDisperse, IDLE_MS);
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sloganCacheKey = "";
  brandCacheKey = "";
  if (
    state === "assemble" ||
    state === "colorFade" ||
    state === "hold" ||
    state === "disperse"
  ) {
    computeTargets();
  }
}

function randomPosition(halfSize) {
  const minX = EDGE + halfSize;
  const minY = NAV_SAFE_TOP + halfSize;
  const maxX = width - EDGE - halfSize;
  const maxY = height - EDGE - halfSize;
  return {
    x: rand(minX, Math.max(minX, maxX)),
    y: rand(minY, Math.max(minY, maxY)),
  };
}

function makeWanderVelocity() {
  return {
    vx: randSign() * rand(0.15, 0.35),
    vy: randSign() * rand(0.15, 0.35),
    vrot: rand(-0.008, 0.008),
  };
}

function createObjects() {
  objects = [];
  colorIndex = 0;

  const logoPos = randomPosition(28);
  const logoVel = makeWanderVelocity();
  objects.push({
    type: "logo",
    group: "brand",
    letter: null,
    x: logoPos.x,
    y: logoPos.y,
    targetX: 0,
    targetY: 0,
    scatterX: 0,
    scatterY: 0,
    scatterSize: 56,
    scatterRot: 0,
    ...logoVel,
    rotation: rand(0, Math.PI * 2),
    baseColor: null,
    color: null,
    alpha: 0,
    fadeDelay: 0,
    size: wanderBrandSize(),
    targetSize: 56,
    trail: [],
  });

  BRAND_LETTERS.forEach((letter, i) => {
    const size = wanderBrandSize();
    const pos = randomPosition(size / 2);
    const vel = makeWanderVelocity();
    const c = colorAt(colorIndex++);
    objects.push({
      type: "letter",
      group: "brand",
      letter,
      x: pos.x,
      y: pos.y,
      targetX: 0,
      targetY: 0,
      scatterX: 0,
      scatterY: 0,
      scatterSize: size,
      scatterRot: 0,
      ...vel,
      rotation: rand(0, Math.PI * 2),
      baseColor: c,
      color: c,
      alpha: 0,
      fadeDelay: (i + 1) * 100,
      size,
      targetSize: size,
      trail: [],
    });
  });

  SLOGAN_CHARS.forEach((letter, i) => {
    const size = wanderSloganSize();
    const pos = randomPosition(size / 2);
    const vel = makeWanderVelocity();
    const c = colorAt(colorIndex++);
    objects.push({
      type: "letter",
      group: "slogan",
      letter,
      x: pos.x,
      y: pos.y,
      targetX: 0,
      targetY: 0,
      scatterX: 0,
      scatterY: 0,
      scatterSize: size,
      scatterRot: 0,
      ...vel,
      rotation: rand(0, Math.PI * 2),
      baseColor: c,
      color: c,
      alpha: 0,
      fadeDelay: (BRAND_LETTERS.length + i + 2) * 80,
      size,
      targetSize: size,
      trail: [],
    });
  });
}

function createParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];
    particles.push({
      x: rand(EDGE, width - EDGE),
      y: rand(NAV_SAFE_TOP, height - EDGE),
      vx: randSign() * rand(0.05, 0.15),
      vy: randSign() * rand(0.05, 0.15),
      radius: rand(1, 2),
      color,
    });
  }
}

function measureChar(ch, size, group) {
  ctx.font = fontAt(size, group);
  return ctx.measureText(ch).width;
}

function getSloganLayoutCached() {
  const key = `slogan-${sloganFontSize}`;
  if (sloganCacheKey === key && cachedSloganLayout) return cachedSloganLayout;
  ctx.font = fontAt(sloganFontSize, "slogan");
  const spaceW = ctx.measureText(" ").width * 1.08;
  const track = sloganFontSize * SLOGAN_TRACKING;
  const phraseGap = sloganFontSize * 0.55;
  const segments = [];
  let totalWidth = 0;
  let sloganObjIndex = 0;

  for (let i = 0; i < SLOGAN_TEXT.length; i++) {
    const ch = SLOGAN_TEXT[i];
    if (ch === " ") {
      const prev = SLOGAN_TEXT[i - 1];
      const extra = prev === "." ? phraseGap : spaceW;
      totalWidth += extra;
      segments.push({ type: "gap", width: extra });
      continue;
    }
    const w = ctx.measureText(ch).width;
    const next = SLOGAN_TEXT[i + 1];
    totalWidth += w + (next && next !== " " ? track : 0);
    segments.push({
      type: "char",
      ch,
      width: w,
      objIndex: sloganObjIndex++,
      track: next && next !== " " ? track : 0,
    });
  }
  cachedSloganLayout = { segments, totalWidth, spaceW, phraseGap, track };
  sloganCacheKey = key;
  return cachedSloganLayout;
}

function getBrandWidthsCached() {
  const key = `brand-${assembledFontSize}`;
  if (brandCacheKey === key && brandWidthCache) return brandWidthCache;
  ctx.font = fontAt(assembledFontSize, "brand");
  brandWidthCache = BRAND_LETTERS.map((ch) => ctx.measureText(ch).width);
  brandCacheKey = key;
  return brandWidthCache;
}

function computeTargets() {
  assembledFontSize = getAssembledFontSize();
  sloganFontSize = getSloganFontSize(assembledFontSize);
  logoTargetSize = assembledFontSize;
  const logoW = getLogoWidthFromHeight(logoTargetSize);
  const brandCenterY = height * 0.4;
  const sloganCenterY = brandCenterY + assembledFontSize * 0.72 + 10;
  const gap = 12;

  const brandWidths = getBrandWidthsCached();
  const brandTextWidth = brandWidths.reduce((a, b) => a + b, 0);
  const brandTotalWidth = logoW + gap + brandTextWidth;
  let cursorX = width / 2 - brandTotalWidth / 2;

  const logo = objects[0];
  logo.targetX = cursorX + logoW / 2;
  logo.targetY = brandCenterY;
  logo.targetSize = logoTargetSize;
  cursorX += logoW + gap;

  for (let i = 0; i < BRAND_LETTERS.length; i++) {
    const obj = objects[1 + i];
    const w = brandWidths[i];
    obj.targetX = cursorX + w / 2;
    obj.targetY = brandCenterY;
    obj.targetSize = assembledFontSize;
    cursorX += w;
  }

  const layout = getSloganLayoutCached();
  cursorX = width / 2 - layout.totalWidth / 2;
  const sloganStart = 1 + BRAND_LETTERS.length;

  layout.segments.forEach((seg) => {
    if (seg.type === "gap") {
      cursorX += seg.width;
      return;
    }
    const obj = objects[sloganStart + seg.objIndex];
    obj.targetX = cursorX + seg.width / 2;
    obj.targetY = sloganCenterY;
    obj.targetSize = sloganFontSize;
    cursorX += seg.width + (seg.track || 0);
  });
}

function handleBoundary(obj) {
  const half =
    obj.type === "logo"
      ? getLogoWidthFromHeight(obj.size) / 2
      : obj.size * (obj.group === "slogan" ? 0.3 : 0.38);
  if (obj.x < EDGE + half) {
    obj.x = EDGE + half;
    obj.vx = Math.abs(obj.vx) + rand(0, 0.05);
    obj.vy += rand(-0.04, 0.04);
  }
  if (obj.x > width - EDGE - half) {
    obj.x = width - EDGE - half;
    obj.vx = -Math.abs(obj.vx) - rand(0, 0.05);
    obj.vy += rand(-0.04, 0.04);
  }
  if (obj.y < NAV_SAFE_TOP + half) {
    obj.y = NAV_SAFE_TOP + half;
    obj.vy = Math.abs(obj.vy) + rand(0, 0.05);
    obj.vx += rand(-0.04, 0.04);
  }
  if (obj.y > height - EDGE - half) {
    obj.y = height - EDGE - half;
    obj.vy = -Math.abs(obj.vy) - rand(0, 0.05);
    obj.vx += rand(-0.04, 0.04);
  }
}

function updateFadeIn(obj, now) {
  const elapsed = now - startTime - obj.fadeDelay;
  if (elapsed <= 0) {
    obj.alpha = 0;
    return;
  }
  obj.alpha = Math.min(1, elapsed / 400);
}

function updateWander(now) {
  objects.forEach((obj) => {
    if (!obj.skipFade) updateFadeIn(obj, now);
    else obj.alpha = 1;
    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.rotation += obj.vrot;
    handleBoundary(obj);
  });

}

function updateAssemble() {
  const elapsed = performance.now() - assembleStart;
  const t = Math.min(1, elapsed / ASSEMBLE_MS);
  const ease = easeOutCubic(t);
  const recordTrail = frameId % TRAIL_INTERVAL === 0;

  objects.forEach((obj) => {
    obj.x = lerp(obj.asmFromX, obj.targetX, ease);
    obj.y = lerp(obj.asmFromY, obj.targetY, ease);
    obj.rotation = lerp(obj.asmFromRot, 0, ease);
    obj.size = lerp(obj.asmFromSize, obj.targetSize, ease);
    obj.alpha = Math.max(obj.alpha, ease);

    if (recordTrail) {
      obj.trail.push({
        x: obj.x,
        y: obj.y,
        rotation: obj.rotation,
        size: obj.size,
      });
      if (obj.trail.length > TRAIL_MAX) obj.trail.shift();
    }
  });

  if (t >= 1) {
    state = "colorFade";
    colorFadeStart = performance.now();
    objects.forEach((obj) => {
      obj.x = obj.targetX;
      obj.y = obj.targetY;
      obj.rotation = 0;
      obj.size = obj.targetSize;
      obj.trail = [];
    });
  }
}

function holdColorFor(obj) {
  if (obj.type !== "letter") return null;
  return obj.group === "slogan" ? SLOGAN_COLOR : BRAND_COLOR;
}

function updateColorFade(now) {
  const t = Math.min(1, (now - colorFadeStart) / 400);
  objects.forEach((obj) => {
    if (obj.type !== "letter") return;
    const target = obj.group === "slogan" ? SLOGAN_COLOR : BRAND_COLOR;
    obj.color = lerpColor(obj.baseColor, target, t);
  });
  if (t >= 1) {
    enterHold();
  }
}

function enterHold() {
  state = "hold";
  objects.forEach((obj) => {
    const hc = holdColorFor(obj);
    if (hc) obj.color = hc;
  });
  setTimeout(() => {
    ui.showNav();
    ui.showContact();
  }, 300);
  scheduleIdleTimer();
}

function assignScatterTargets() {
  objects.forEach((obj) => {
    const half =
      obj.type === "logo"
        ? getLogoWidthFromHeight(assembledFontSize) / 2
        : obj.group === "slogan"
          ? 30
          : 52;
    const pos = randomPosition(half);
    obj.scatterX = pos.x;
    obj.scatterY = pos.y;
    obj.scatterRot = rand(-0.35, 0.35);
    obj.physicsOn = false;
    if (obj.type === "logo") {
      obj.scatterSize = rand(88, 108);
    } else if (obj.group === "slogan") {
      obj.scatterSize = wanderSloganSize();
    } else {
      obj.scatterSize = wanderBrandSize();
    }
  });
}

function startDisperse() {
  if (state !== "hold") return;
  clearIdleTimer();
  ui.hideNav();
  ui.hideContact();
  ui.closeModal();
  state = "disperse";
  disperseStart = performance.now();
  assignScatterTargets();
  objects.forEach((obj) => {
    obj.trail = [];
    obj.dispOriginX = obj.x;
    obj.dispOriginY = obj.y;
    obj.dispOriginRot = obj.rotation;
    obj.dispOriginSize = obj.size;
    obj.dispHoldColor = holdColorFor(obj) || BRAND_COLOR;
    obj.physicsOn = false;
    obj.skipFade = true;
  });
}

function updateDisperse() {
  const elapsed = performance.now() - disperseStart;
  const t = Math.min(1, elapsed / DISPERSE_MS);
  const ease = easeOutCubic(t);

  objects.forEach((obj) => {
    obj.x = lerp(obj.dispOriginX, obj.scatterX, ease);
    obj.y = lerp(obj.dispOriginY, obj.scatterY, ease);
    obj.rotation = lerp(obj.dispOriginRot, obj.scatterRot, ease);
    obj.size = lerp(obj.dispOriginSize, obj.scatterSize, ease);

    if (obj.type === "letter" && t > 0.38) {
      const ct = easeOutCubic(Math.min(1, (t - 0.38) / 0.62));
      obj.color = lerpColor(obj.dispHoldColor, obj.baseColor, ct);
    }

    if (t >= 0.9 && !obj.physicsOn) {
      obj.physicsOn = true;
      const vel = makeWanderVelocity();
      obj.vx = vel.vx;
      obj.vy = vel.vy;
      obj.vrot = vel.vrot;
    }
  });

  if (t >= 1) {
    state = "wander";
    clearIdleTimer();
    hint.classList.remove("is-hidden");
    objects.forEach((obj) => {
      obj.x = obj.scatterX;
      obj.y = obj.scatterY;
      obj.size = obj.scatterSize;
      obj.rotation = obj.scatterRot;
      obj.trail = [];
      obj.alpha = 1;
      obj.skipFade = true;
      if (obj.type === "letter") obj.color = obj.baseColor;
      if (!obj.physicsOn) {
        const vel = makeWanderVelocity();
        obj.vx = vel.vx;
        obj.vy = vel.vy;
        obj.vrot = vel.vrot;
      }
    });
  }
}

function updateParticles() {
  if (state === "hold" || state === "colorFade") return;
  const speed = state === "wander" ? 1 : 0.35;
  particles.forEach((p) => {
    p.x += p.vx * speed;
    p.y += p.vy * speed;
    if (p.x < EDGE) {
      p.x = EDGE;
      p.vx = Math.abs(p.vx);
    }
    if (p.x > width - EDGE) {
      p.x = width - EDGE;
      p.vx = -Math.abs(p.vx);
    }
    if (p.y < NAV_SAFE_TOP) {
      p.y = NAV_SAFE_TOP;
      p.vy = Math.abs(p.vy);
    }
    if (p.y > height - EDGE) {
      p.y = height - EDGE;
      p.vy = -Math.abs(p.vy);
    }
  });
}

function drawParticles() {
  if (state === "assemble" || state === "disperse") return;
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function syncFont(obj) {
  const key = `${obj.group}-${Math.round(obj.size)}`;
  if (obj.fontKey !== key) {
    obj.fontKey = key;
    obj.fontStr = fontAt(obj.size, obj.group);
  }
  return obj.fontStr;
}

function drawLetterAt(letter, x, y, size, color, alpha, rotation, group, fontStr) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.font = fontStr || fontAt(size, group);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 0, 0);
  ctx.restore();
}

function drawLogoAt(x, y, height, alpha, rotation) {
  if (!logoImg || !logoImg.complete) return;
  const drawH = height;
  const drawW = getLogoWidthFromHeight(height);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.drawImage(logoImg, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawTrail(obj) {
  if (!obj.trail.length || state !== "assemble") return;
  const fontStr = obj.type === "letter" ? syncFont(obj) : null;
  for (let i = 0; i < obj.trail.length; i++) {
    const point = obj.trail[i];
    const progress = (i + 1) / obj.trail.length;
    const alpha = progress * 0.28 * obj.alpha;
    const size = point.size * (0.35 + progress * 0.45);
    if (obj.type === "logo") {
      drawLogoAt(point.x, point.y, size, alpha, point.rotation);
    } else {
      drawLetterAt(
        obj.letter,
        point.x,
        point.y,
        size,
        obj.color,
        alpha,
        point.rotation,
        obj.group,
        fontStr
      );
    }
  }
}

function drawObject(obj) {
  if (state === "assemble") drawTrail(obj);
  if (obj.type === "logo") {
    drawLogoAt(obj.x, obj.y, obj.size, obj.alpha, obj.rotation);
  } else {
    const fontStr = syncFont(obj);
    drawLetterAt(
      obj.letter,
      obj.x,
      obj.y,
      obj.size,
      obj.color,
      obj.alpha,
      obj.rotation,
      obj.group,
      fontStr
    );
  }
}

function drawFrame(now) {
  frameId++;
  ctx.clearRect(0, 0, width, height);

  if (state === "wander") {
    updateWander(now);
    updateParticles();
  } else if (state === "assemble") {
    updateAssemble();
  } else if (state === "colorFade") {
    updateColorFade(now);
  } else if (state === "disperse") {
    updateDisperse();
  } else if (state === "hold") {
    /* static layout */
  }

  drawParticles();
  objects.forEach(drawObject);
  rafId = requestAnimationFrame(drawFrame);
}

function startAssemble() {
  if (state !== "wander") return;
  state = "assemble";
  assembleStart = performance.now();
  hint.classList.add("is-hidden");
  ui.hideNav();
  ui.hideContact();
  clearIdleTimer();
  sloganCacheKey = "";
  brandCacheKey = "";
  computeTargets();
  objects.forEach((obj) => {
    obj.trail = [];
    obj.skipFade = false;
    obj.asmFromX = obj.x;
    obj.asmFromY = obj.y;
    obj.asmFromRot = obj.rotation;
    obj.asmFromSize = obj.size;
  });
}

function onUserClick() {
  if (state === "wander") {
    startAssemble();
    return;
  }
  if (state === "hold") {
    scheduleIdleTimer();
  }
}

document.addEventListener(
  "click",
  (e) => {
    if (ui.handleDocumentClick(e)) return;
    if (e.target.closest(".top-nav-bar a")) return;
    onUserClick();
  },
  true
);

window.addEventListener("resize", resizeCanvas);

window.addEventListener("load", async () => {
  ui.bindIdle({
    getState: () => state,
    schedule: scheduleIdleTimer,
    clear: clearIdleTimer,
  });

  try {
    logoImg = await loadImage(LOGO_SRC);
    loadImage(QR_SRC).catch(() => {});
  } catch (err) {
    console.warn("图片预加载失败，尝试备用路径", err);
    try {
      logoImg = await loadImage(LOGO_FALLBACK);
    } catch (e2) {
      logoImg = new Image();
    }
  }

  resizeCanvas();
  createObjects();
  createParticles();
  startTime = performance.now();
  rafId = requestAnimationFrame(drawFrame);
});
