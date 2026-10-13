// ==========================================
// MAIN SETTINGS (MAX & HANNAH)
// ==========================================
const SECRET_PIN = "2909"; 
// Месяц 8 = Сентябрь (так как в JS отсчет месяцев идет с 0)
const START_DATE = new Date(2026, 8, 29, 0, 0, 0);

// ==========================================
// 1. LOCK SCREEN
// ==========================================
let currentPin = "";
const pinSpans = document.querySelectorAll("#pin-display span");
const pinDisplay = document.querySelector("#pin-display");
const lockScreen = document.querySelector("#lock-screen");

document.querySelectorAll(".key[data-val]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentPin.length < 4) {
      currentPin += btn.dataset.val;
      updatePinDots();
      if (currentPin.length === 4) checkPin();
    }
  });
});

document.getElementById("clear-btn").addEventListener("click", () => {
  currentPin = currentPin.slice(0, -1);
  updatePinDots();
});

document.getElementById("hint-btn").addEventListener("click", () => {
  document.getElementById("hint-text").classList.toggle("visible");
});

function updatePinDots() {
  pinSpans.forEach((span, idx) => {
    span.classList.toggle("filled", idx < currentPin.length);
  });
}

function checkPin() {
  if (currentPin === SECRET_PIN) {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 18);
    setTimeout(() => {
      lockScreen.classList.add("unlocked");
      flyToWorldCoord(1500, 980, window.innerWidth < 700 ? 0.72 : 0.92);
    }, 200);
  } else {
    pinDisplay.classList.add("error");
    setTimeout(() => {
      pinDisplay.classList.remove("error");
      currentPin = "";
      updatePinDots();
    }, 450);
  }
}

// ==========================================
// 2. STATIC GIANT SAKURA TREE (DRAWN ONCE = 0% LAG!)
// ==========================================
const treeCanvas = document.getElementById("tree-canvas");
const tCtx = treeCanvas.getContext("2d");

function drawStaticGiantSakuraTree() {
  const treeBranches = [];
  const blossomClusters = [];

  let seed = 42;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function growBranch(x1, y1, len, angle, depth) {
    if (depth === 0) return;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    const cx = (x1 + x2) / 2 + (rand() - 0.5) * len * 0.25;
    const cy = (y1 + y2) / 2 + (rand() - 0.5) * len * 0.25;

    treeBranches.push({ x1, y1, cx, cy, x2, y2, depth });

    if (depth <= 4) {
      const count = depth === 1 ? 5 : 3;
      for (let i = 0; i < count; i++) {
        blossomClusters.push({
          x: x2 + (rand() - 0.5) * 95,
          y: y2 + (rand() - 0.5) * 75,
          r: rand() * 34 + 16,
          color: rand() > 0.45 ? "rgba(255, 154, 195, 0.34)" : "rgba(236, 72, 153, 0.28)",
          core: rand() > 0.5 ? "#ffdde1" : "#ff6b9d"
        });
      }
    }

    const nextLen = len * (0.74 + rand() * 0.08);
    growBranch(x2, y2, nextLen, angle - (0.26 + rand() * 0.22), depth - 1);
    growBranch(x2, y2, nextLen, angle + (0.26 + rand() * 0.22), depth - 1);
    if (depth >= 6 && rand() > 0.35) {
      growBranch(x2, y2, nextLen * 0.85, angle + (rand() - 0.5) * 0.2, depth - 1);
    }
  }

  growBranch(1500, 2050, 340, -Math.PI / 2, 8);
  growBranch(1500, 1710, 290, -Math.PI / 2 - 0.65, 7);
  growBranch(1500, 1710, 290, -Math.PI / 2 + 0.65, 7);

  tCtx.clearRect(0, 0, 3000, 2400);

  // 1. Glowing ground aura under the roots
  const rootGrad = tCtx.createRadialGradient(1500, 2040, 20, 1500, 2040, 520);
  rootGrad.addColorStop(0, "rgba(255, 107, 157, 0.45)");
  rootGrad.addColorStop(0.5, "rgba(124, 58, 237, 0.2)");
  rootGrad.addColorStop(1, "transparent");
  tCtx.fillStyle = rootGrad;
  tCtx.beginPath();
  tCtx.ellipse(1500, 2040, 520, 140, 0, 0, Math.PI * 2);
  tCtx.fill();

  // 2. Draw all tree branches
  treeBranches.forEach(b => {
    tCtx.beginPath();
    tCtx.moveTo(b.x1, b.y1);
    tCtx.quadraticCurveTo(b.cx, b.cy, b.x2, b.y2);
    tCtx.strokeStyle = b.depth > 4 ? "#2e1065" : (b.depth > 2 ? "#701a75" : "#f472b6");
    tCtx.lineWidth = Math.pow(b.depth, 1.55) * 1.5;
    tCtx.lineCap = "round";
    tCtx.stroke();

    if (b.depth >= 4) {
      tCtx.beginPath();
      tCtx.moveTo(b.x1, b.y1);
      tCtx.quadraticCurveTo(b.cx, b.cy, b.x2, b.y2);
      tCtx.strokeStyle = "rgba(255, 154, 195, 0.25)";
      tCtx.lineWidth = b.depth * 0.8;
      tCtx.stroke();
    }
  });

  // 3. Draw glowing Sakura Blossom Clouds
  blossomClusters.forEach(c => {
    tCtx.fillStyle = c.color;
    tCtx.beginPath();
    tCtx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    tCtx.fill();

    tCtx.fillStyle = c.core;
    tCtx.beginPath();
    tCtx.arc(c.x, c.y, c.r * 0.22, 0, Math.PI * 2);
    tCtx.fill();
  });

  // 4. Draw constellation lines connecting the 4 Art Branches
  const nodes = [[920, 1120], [1500, 980], [2080, 1060], [1500, 520]];
  tCtx.save();
  tCtx.setLineDash([8, 10]);
  tCtx.strokeStyle = "rgba(94, 234, 212, 0.4)";
  tCtx.lineWidth = 2;
  tCtx.beginPath();
  tCtx.moveTo(nodes[0][0], nodes[0][1] - 70);
  tCtx.lineTo(nodes[1][0], nodes[1][1] - 70);
  tCtx.lineTo(nodes[2][0], nodes[2][1] - 70);
  tCtx.moveTo(nodes[1][0], nodes[1][1] - 70);
  tCtx.lineTo(nodes[3][0], nodes[3][1] - 70);
  tCtx.stroke();
  tCtx.restore();
}

// Рисуем гигантское дерево ОДИН раз при загрузке!
drawStaticGiantSakuraTree();

document.querySelectorAll(".tree-node").forEach(node => {
  node.style.left = node.dataset.wx + "px";
  node.style.top = node.dataset.wy + "px";
});

// ==========================================
// 3. SMART CAMERA (ONLY UPDATES WHEN MOVING)
// ==========================================
const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const zoomLabel = document.getElementById("zoom-level");

let camX = 0, camY = 0, camScale = 0.5;
let targetCamX = 0, targetCamY = 0, targetScale = 0.5;
let isCameraAnimating = false;

function flyToWorldCoord(wx, wy, scale = 0.9) {
  targetScale = Math.max(0.32, Math.min(1.4, scale));
  targetCamX = window.innerWidth / 2 - wx * targetScale;
  targetCamY = window.innerHeight / 2 - wy * targetScale;
  startCameraLoop();
}

function startCameraLoop() {
  if (!isCameraAnimating) {
    isCameraAnimating = true;
    requestAnimationFrame(updateCameraLoop);
  }
}

function updateCameraLoop() {
  const dx = targetCamX - camX;
  const dy = targetCamY - camY;
  const ds = targetScale - camScale;

  if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15 && Math.abs(ds) < 0.001) {
    camX = targetCamX;
    camY = targetCamY;
    camScale = targetScale;
    world.style.transform = `translate3d(${camX.toFixed(1)}px, ${camY.toFixed(1)}px, 0) scale(${camScale.toFixed(4)})`;
    zoomLabel.textContent = Math.round(camScale * 100) + "%";
    isCameraAnimating = false;
    return;
  }

  camX += dx * 0.12;
  camY += dy * 0.12;
  camScale += ds * 0.12;

  world.style.transform = `translate3d(${camX.toFixed(1)}px, ${camY.toFixed(1)}px, 0) scale(${camScale.toFixed(4)})`;
  zoomLabel.textContent = Math.round(camScale * 100) + "%";

  requestAnimationFrame(updateCameraLoop);
}

// Initial camera setup
flyToWorldCoord(1500, 1150, 0.45);
camX = targetCamX;
camY = targetCamY;
camScale = targetScale;
world.style.transform = `translate3d(${camX}px, ${camY}px, 0) scale(${camScale})`;

// Dragging / Panning
let isPanning = false;
let startPanX = 0, startPanY = 0;

viewport.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button") || e.target.closest("input")) return;
  isPanning = true;
  startPanX = e.clientX - targetCamX;
  startPanY = e.clientY - targetCamY;
  viewport.setPointerCapture(e.pointerId);
});

viewport.addEventListener("pointermove", (e) => {
  if (!isPanning) return;
  targetCamX = e.clientX - startPanX;
  targetCamY = e.clientY - startPanY;
  startCameraLoop();
});

viewport.addEventListener("pointerup", () => { isPanning = false; });
viewport.addEventListener("pointercancel", () => { isPanning = false; });

// Wheel Zoom
viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
  const newScale = Math.max(0.32, Math.min(1.45, targetScale * zoomFactor));

  const wx = (e.clientX - targetCamX) / targetScale;
  const wy = (e.clientY - targetCamY) / targetScale;

  targetScale = newScale;
  targetCamX = e.clientX - wx * targetScale;
  targetCamY = e.clientY - wy * targetScale;
  startCameraLoop();
}, { passive: false });

document.getElementById("zoom-in-btn").addEventListener("click", () => {
  const wx = (window.innerWidth / 2 - targetCamX) / targetScale;
  const wy = (window.innerHeight / 2 - targetCamY) / targetScale;
  targetScale = Math.min(1.45, targetScale * 1.2);
  targetCamX = window.innerWidth / 2 - wx * targetScale;
  targetCamY = window.innerHeight / 2 - wy * targetScale;
  startCameraLoop();
});

document.getElementById("zoom-out-btn").addEventListener("click", () => {
  const wx = (window.innerWidth / 2 - targetCamX) / targetScale;
  const wy = (window.innerHeight / 2 - targetCamY) / targetScale;
  targetScale = Math.max(0.32, targetScale * 0.82);
  targetCamX = window.innerWidth / 2 - wx * targetScale;
  targetCamY = window.innerHeight / 2 - wy * targetScale;
  startCameraLoop();
});

const navPills = document.querySelectorAll(".nav-pill[data-target]");
navPills.forEach(pill => {
  pill.addEventListener("click", () => {
    navPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    const targetNode = document.getElementById(pill.dataset.target);
    if (targetNode) {
      flyToWorldCoord(parseFloat(targetNode.dataset.wx), parseFloat(targetNode.dataset.wy), window.innerWidth < 700 ? 0.75 : 0.95);
    }
  });
});

document.getElementById("full-tree-btn").addEventListener("click", () => {
  navPills.forEach(p => p.classList.remove("active"));
  flyToWorldCoord(1500, 1180, window.innerWidth < 700 ? 0.34 : 0.46);
});

document.getElementById("reset-camera-btn").addEventListener("click", () => {
  flyToWorldCoord(1500, 980, window.innerWidth < 700 ? 0.75 : 0.95);
});

document.querySelectorAll(".tree-node").forEach(node => {
  node.addEventListener("dblclick", () => {
    flyToWorldCoord(parseFloat(node.dataset.wx), parseFloat(node.dataset.wy), 1.0);
  });
});

// ==========================================
// 4. LIGHTWEIGHT SCREEN-SIZED STARS & SAKURA PETALS
// ==========================================
const starsCanvas = document.getElementById("stars-canvas");
const sCtx = starsCanvas.getContext("2d");
const stars = [];
const screenPetals = [];

function resizeStars() {
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeStars);
resizeStars();

for (let i = 0; i < 70; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.6 + 0.5,
    alpha: Math.random() * Math.PI
  });
}

for (let i = 0; i < 28; i++) {
  screenPetals.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 7 + 4,
    vx: Math.random() * 0.8 - 0.2,
    vy: Math.random() * 1.0 + 0.4,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.03
  });
}

function animateOverlay() {
  const w = starsCanvas.width;
  const h = starsCanvas.height;
  sCtx.clearRect(0, 0, w, h);

  // Stars
  sCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fill();
  }

  // Falling Petals (Screen-space = super fast)
  sCtx.fillStyle = "rgba(255, 195, 220, 0.75)";
  for (let i = 0; i < screenPetals.length; i++) {
    const p = screenPetals[i];
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.spin;

    if (p.y > h + 15) { p.y = -15; p.x = Math.random() * w; }
    if (p.x > w + 15) p.x = -15;
    if (p.x < -15) p.x = w + 15;

    sCtx.save();
    sCtx.translate(p.x, p.y);
    sCtx.rotate(p.angle);
    sCtx.beginPath();
    sCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.restore();
  }

  requestAnimationFrame(animateOverlay);
}
animateOverlay();

// ==========================================
// 5. 3D TILT & FLIP ON MAIN ART CARD
// ==========================================
const polaroidInner = document.getElementById("main-polaroid-inner");
const tiltCard = document.querySelector(".tilt-element");
const glare = document.querySelector(".glare");

document.getElementById("flip-btn").addEventListener("click", () => {
  polaroidInner.classList.add("is-flipped");
});

document.getElementById("unflip-btn").addEventListener("click", () => {
  polaroidInner.classList.remove("is-flipped");
});

tiltCard.addEventListener("mousemove", (e) => {
  if (isPanning || polaroidInner.classList.contains("is-flipped")) return;
  const rect = tiltCard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
  const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;

  tiltCard.style.transform = `rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`;
  glare.style.opacity = "1";
});

tiltCard.addEventListener("mouseleave", () => {
  tiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  glare.style.opacity = "0";
});

// ==========================================
// 6. MODALS: INSPECT SLIDER & LOVE LETTER
// ==========================================
const lightbox = document.getElementById("lightbox");
const compRange = document.getElementById("comp-range");
const compOverlay = document.getElementById("comp-overlay");
const compLine = document.getElementById("comp-line");

document.getElementById("zoom-btn").addEventListener("click", () => {
  lightbox.classList.remove("hidden");
});

[document.getElementById("close-lightbox"), document.getElementById("close-lightbox-btn")].forEach(el => {
  el.addEventListener("click", () => lightbox.classList.add("hidden"));
});

compRange.addEventListener("input", (e) => {
  const val = e.target.value + "%";
  compOverlay.style.width = val;
  compLine.style.left = val;
});

const letterModal = document.getElementById("letter-modal");
document.getElementById("letter-btn").addEventListener("click", (e) => {
  spawnParticles(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 18);
  letterModal.classList.remove("hidden");
});

[document.getElementById("close-letter"), document.getElementById("close-letter-btn")].forEach(el => {
  el.addEventListener("click", () => letterModal.classList.add("hidden"));
});

function spawnParticles(x, y, count = 16) {
  const container = document.getElementById("particles-container");
  const symbols = ["🌸", "✨", "💖", "🪐"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.setProperty("--tx", (Math.random() - 0.5) * 240 + "px");
    p.style.setProperty("--ty", (Math.random() - 0.8) * 240 + "px");
    p.style.setProperty("--rot", (Math.random() - 0.5) * 90 + "deg");
    container.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

// ==========================================
// 7. ENGLISH TIMER & "WITH YOU" MUSIC PLAYER
// ==========================================
function updateTimer() {
  const now = new Date();
  const diff = Math.abs(now - START_DATE);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  document.getElementById("together-timer").textContent = `${days}d ${hours}h ${mins}m`;
}
updateTimer();
setInterval(updateTimer, 30000);

const audio = document.getElementById("audio-player");
const playBtn = document.getElementById("play-btn");
const vinyl = document.getElementById("vinyl");
let isPlaying = false;
let synthInterval = null;

playBtn.addEventListener("click", () => {
  if (!isPlaying) {
    audio.play().then(() => {
      setPlayingState(true);
    }).catch(() => {
      startWithYouSynth();
      setPlayingState(true);
    });
  } else {
    audio.pause();
    stopWithYouSynth();
    setPlayingState(false);
  }
});

function setPlayingState(state) {
  isPlaying = state;
  vinyl.classList.toggle("playing", state);
  playBtn.textContent = state ? "⏸ Pause" : "▶ Play";
}

function startWithYouSynth() {
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const melody = [329.63, 392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 392.00];
  let step = 0;

  const playNote = () => {
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    osc.type = "sine";
    osc.frequency.value = melody[step % melody.length];
    step++;

    gain.gain.setValueAtTime(0.01, ctxAudio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctxAudio.currentTime + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 2.4);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);
    osc.start();
    osc.stop(ctxAudio.currentTime + 2.5);
  };
  playNote();
  synthInterval = setInterval(playNote, 950);
}

function stopWithYouSynth() {
  if (synthInterval) clearInterval(synthInterval);
}