const giftBox = document.getElementById("giftBox");
const surpriseMessage = document.getElementById("surpriseMessage");
const openGiftTop = document.getElementById("openGiftTop");
const celebrateButton = document.getElementById("celebrateButton");
const toast = document.getElementById("toast");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const musicClose = document.getElementById("musicClose");
const musicControls = document.getElementById("musicControls");
let musicClosed = false;

let giftOpened = false;
let toastTimer;
let audioContext = null;
let musicTimer = null;
let musicPlaying = false;
let noteIndex = 0;

// A fresh, cheerful birthday-style melody generated in the browser.
const melody = [
  [659.25, 0.18], [659.25, 0.18], [783.99, 0.36], [659.25, 0.36],
  [880.00, 0.36], [830.61, 0.58], [659.25, 0.18], [659.25, 0.18],
  [783.99, 0.36], [659.25, 0.36], [987.77, 0.36], [880.00, 0.58],
  [659.25, 0.18], [659.25, 0.18], [1318.51, 0.36], [1046.50, 0.36],
  [880.00, 0.36], [783.99, 0.36], [698.46, 0.36], [1174.66, 0.18],
  [1174.66, 0.18], [1046.50, 0.36], [880.00, 0.36], [987.77, 0.36], [880.00, 0.58]
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openGift() {
  document.getElementById("gift").scrollIntoView({ behavior: "smooth", block: "center" });
  if (giftOpened) {
    showToast("Your little birthday wish is right here. ♡");
    return;
  }
  giftOpened = true;
  giftBox.classList.add("opening");
  setTimeout(() => {
    surpriseMessage.hidden = false;
    giftBox.querySelector(".gift-tap").textContent = "A LITTLE WISH FOR YOU ♡";
    launchConfetti(90);
    surpriseMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 450);
}
giftBox.addEventListener("click", openGift);
openGiftTop.addEventListener("click", openGift);

function launchConfetti(amount = 35) {
  const mobile = window.matchMedia("(max-width: 700px), (hover: none) and (pointer: coarse)").matches;
  amount = Math.min(amount, mobile ? 24 : 55);
  document.querySelectorAll(".confetti").forEach((piece) => piece.remove());
  const symbols = ["✦", "♡", "✧", "♥", "·"];
  const colors = ["#f4a2bb", "#c7a9f3", "#fff5f4", "#e96e9b", "#f6d98b"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.fontSize = `${10 + Math.random() * 18}px`;
    piece.style.setProperty("--duration", `${2.1 + Math.random() * 2.6}s`);
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5200);
  }
}

celebrateButton.addEventListener("click", () => {
  launchConfetti(70);
  showToast("A little sparkle, just for you. ✨");
});

function playNextNote() {
  if (!musicPlaying || !audioContext) return;
  const [frequency, duration] = melody[noteIndex % melody.length];
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  noteIndex++;
  musicTimer = setTimeout(playNextNote, duration * 1000 + 90);
}

async function toggleMusic() {
  if (!musicPlaying) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        showToast("This browser doesn't support generated music.");
        return;
      }
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === "suspended") await audioContext.resume();
      musicPlaying = true;
      musicClosed = false;
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Music on · Pause";
      musicToggle.setAttribute("aria-label", "Pause birthday music");
      musicToggle.classList.add("is-playing");
      playNextNote();
    } catch (error) {
      showToast("Please try playing the music again.");
    }
  } else {
    musicPlaying = false;
    clearTimeout(musicTimer);
    if (audioContext && audioContext.state === "running") await audioContext.suspend();
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play music";
    musicToggle.setAttribute("aria-label", "Play birthday music");
    musicToggle.classList.remove("is-playing");
  }
}
musicToggle.addEventListener("click", toggleMusic);

musicClose.addEventListener("click", async () => {
  musicClosed = true;
  if (musicPlaying) {
    musicPlaying = false;
    clearTimeout(musicTimer);
    if (audioContext && audioContext.state === "running") await audioContext.suspend();
  }
  musicControls.classList.add("music-hidden");
  showToast("Birthday music turned off.");
});

// Music starts only after a deliberate tap, so phones stay quiet and lightweight.
if (musicLabel) musicLabel.textContent = "Tap for music";

// Small entrance reveal for sections as the visitor scrolls.
if ("IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(".note-card, .gift-section .section-title, .closing-section h2");
  revealTargets.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(16px)";
    element.style.transition = "opacity .8s ease, transform .8s ease";
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element) => observer.observe(element));
}


// Interactive cake: tap individual candles or blow them all out.
const candleButtons = [...document.querySelectorAll(".candle")];
const blowCandlesButton = document.getElementById("blowCandles");
const relightCandlesButton = document.getElementById("relightCandles");
const candlesStatus = document.getElementById("candlesStatus");
const wishReveal = document.getElementById("wishReveal");

function updateCandleStatus(celebrate = true) {
  const remaining = candleButtons.filter((candle) => !candle.classList.contains("out")).length;
  if (remaining === 0) {
    candlesStatus.textContent = "Wish made! ✨ Your birthday magic is on its way.";
    wishReveal.hidden = false;
    if (celebrate) launchConfetti(35);
  } else {
    candlesStatus.textContent = `${remaining} candle${remaining === 1 ? "" : "s"} still glowing — keep going!`;
  }
}

candleButtons.forEach((candle) => {
  candle.addEventListener("click", () => {
    candle.classList.add("out");
    updateCandleStatus();
  });
});

blowCandlesButton.addEventListener("click", () => {
  candleButtons.forEach((candle, index) => {
    setTimeout(() => {
      candle.classList.add("out");
      updateCandleStatus(index === candleButtons.length - 1);
    }, index * 90);
  });
  showToast("Take a breath… wish made! 💗");
});

relightCandlesButton.addEventListener("click", () => {
  candleButtons.forEach((candle) => candle.classList.remove("out"));
  wishReveal.hidden = true;
  candlesStatus.textContent = "Candles are glowing again. Make another wish! 🎂";
});

// A lighthearted birthday mini-game.
const quizOptions = [...document.querySelectorAll(".quiz-option")];
const quizResult = document.getElementById("quizResult");
const quizMessages = {
  adventure: "Then may this year take you to beautiful places and unexpected adventures. ✨",
  laughter: "Wishing you belly laughs, silly memories, and a hundred reasons to smile. 😂",
  love: "May you always be surrounded by people who see how special you are. 💗",
  everything: "The perfect answer! You deserve every beautiful thing life has to offer. 🌈"
};
quizOptions.forEach((option) => {
  option.addEventListener("click", () => {
    quizOptions.forEach((item) => item.classList.remove("selected"));
    option.classList.add("selected");
    quizResult.textContent = quizMessages[option.dataset.answer];
    quizResult.hidden = false;
  });
});


// Romantic shayari reveal for Ananya.
const openShayariButton = document.getElementById("openShayari");
const closeShayariButton = document.getElementById("closeShayari");
const shayariCard = document.getElementById("shayariCard");

if (openShayariButton && shayariCard) {
  openShayariButton.addEventListener("click", () => {
    shayariCard.hidden = false;
    openShayariButton.textContent = "TAREEF KHUL GAYI ♡";
    launchConfetti(28);
    shayariCard.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (closeShayariButton && shayariCard && openShayariButton) {
  closeShayariButton.addEventListener("click", () => {
    shayariCard.hidden = true;
    openShayariButton.innerHTML = 'KUCH TAREEF HO JAE ✨ <span>♡</span>';
    openShayariButton.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}


// Second interactive shayari reveal for Ananya.
const openShayariTwoButton = document.getElementById("openShayariTwo");
const closeShayariTwoButton = document.getElementById("closeShayariTwo");
const shayariCardTwo = document.getElementById("shayariCardTwo");

if (openShayariTwoButton && shayariCardTwo) {
  openShayariTwoButton.addEventListener("click", () => {
    shayariCardTwo.hidden = false;
    openShayariTwoButton.innerHTML = 'SHAYARI KHUL GAYI ♡';
    launchConfetti(28);
    shayariCardTwo.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (closeShayariTwoButton && shayariCardTwo && openShayariTwoButton) {
  closeShayariTwoButton.addEventListener("click", () => {
    shayariCardTwo.hidden = true;
    openShayariTwoButton.innerHTML = 'EK AUR SHAYARI SUNOGI? 🌷 <span>♡</span>';
    openShayariTwoButton.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
