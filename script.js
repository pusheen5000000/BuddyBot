// script.js

const STORAGE_KEY = "buddybot_data";

let petData = loadPet();

function loadPet() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    name: "BuddyBot",
    personality: "curious",
    memories: [],
    trust: 0,
    xp: 0,
    stage: "Egg"
  };
}

function savePet() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(petData));
}

function resetPet() {
  localStorage.removeItem(STORAGE_KEY);
  petData = loadPet();
  renderPet();
  clearChat();
  setMessage("Fresh start! Say hi to your new BuddyBot.");
}

function getAvatar() {
  if (petData.stage === "Egg") return "🥚";
  if (petData.stage === "Hatchling") return "🐣";
  if (petData.stage === "Companion") return "🐥";
  return "🦉";
}

function updateStage() {
  if (petData.xp >= 60) petData.stage = "Elder";
  else if (petData.xp >= 35) petData.stage = "Companion";
  else if (petData.xp >= 15) petData.stage = "Hatchling";
  else petData.stage = "Egg";
}

function renderPet() {
  document.getElementById("petName").textContent = petData.name;
  document.getElementById("evolutionStage").textContent = "Stage: " + petData.stage;
  document.getElementById("avatar").textContent = getAvatar();
  document.getElementById("trustValue").textContent = petData.trust;
  document.getElementById("xpValue").textContent = petData.xp;
  document.getElementById("trustBar").style.width = Math.min(petData.trust, 100) + "%";
  document.getElementById("xpBar").style.width = Math.min(petData.xp, 100) + "%";
}

function bounceAvatar() {
  const avatar = document.getElementById("avatar");
  avatar.classList.add("bounce");
  setTimeout(() => avatar.classList.remove("bounce"), 300);
}

function clearChat() {
  const box = document.getElementById("messageBox");
  box.innerHTML = '<p id="message"></p>';
}

function setMessage(text) {
  const box = document.getElementById("messageBox");
  const line = document.createElement("p");
  line.className = "chat-line bot";
  line.textContent = text;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function addUserLine(text) {
  const box = document.getElementById("messageBox");
  const line = document.createElement("p");
  line.className = "chat-line user";
  line.textContent = text;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function addMemory(entry) {
  petData.memories.push(entry);
  if (petData.memories.length > 20) petData.memories.shift();
}

async function askGemini(action, userMessage) {
  // Placeholder for Gemini API integration.
  // Should POST { action, userMessage, petData } to your backend
  // (e.g. /api/gemini) which holds the Gemini API key server-side,
  // and return an AI-generated response string.
  // Do not add API keys here.
  return null;
}

function setButtonsEnabled(enabled) {
  document.getElementById("feedBtn").disabled = !enabled;
  document.getElementById("playBtn").disabled = !enabled;
  document.getElementById("sleepBtn").disabled = !enabled;
  document.getElementById("talkSendBtn").disabled = !enabled;
}

async function handleAction(action, trustGain, xpGain, fallbackMessage, userMessage) {
  petData.trust += trustGain;
  petData.xp += xpGain;
  updateStage();
  addMemory(userMessage ? `${action}: "${userMessage}"` : action);
  savePet();
  renderPet();
  bounceAvatar();

  setButtonsEnabled(false);
  const aiResponse = await askGemini(action, userMessage);
  setMessage(aiResponse || fallbackMessage);
  setButtonsEnabled(true);
}

function feed() {
  handleAction("feed", 3, 5, "Yum! Thanks for feeding me 🍎");
}

function talk() {
  const input = document.getElementById("talkInput");
  const text = input.value.trim();
  if (!text) return;
  addUserLine(text);
  input.value = "";
  handleAction("talk", 6, 4, "I love our little chats 💬", text);
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("talkInput");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") talk();
  });
});

// --- Play mini-game: catch the ball before it disappears ---
function play() {
  setButtonsEnabled(false);
  setMessage("Let's play catch! Get ready...");

  setTimeout(() => {
    const wrap = document.querySelector(".avatar-wrap");
    const ball = document.createElement("button");
    ball.textContent = "🎾";
    ball.className = "ball-target";

    const maxX = wrap.clientWidth - 36;
    const maxY = wrap.clientHeight - 36;
    ball.style.left = Math.floor(Math.random() * maxX) + "px";
    ball.style.top = Math.floor(Math.random() * maxY) + "px";

    let caught = false;
    ball.onclick = () => {
      caught = true;
      ball.remove();
      finishPlay(true);
    };

    wrap.appendChild(ball);

    setTimeout(() => {
      if (!caught && ball.parentNode) {
        ball.remove();
        finishPlay(false);
      }
    }, 1800);
  }, 700);
}

async function finishPlay(success) {
  bounceAvatar();
  if (success) {
    petData.trust += 5;
    petData.xp += 10;
    addMemory("play: caught the ball");
  } else {
    petData.trust += 1;
    petData.xp += 3;
    addMemory("play: missed the ball");
  }
  updateStage();
  savePet();
  renderPet();

  const aiResponse = await askGemini("play", success ? "caught it" : "missed it");
  setMessage(aiResponse || (success ? "Nice catch! That was awesome 🎮" : "Almost got it! Let's try again sometime 🎮"));
  setButtonsEnabled(true);
}

// --- Sleep ---
function sleep() {
  setButtonsEnabled(false);
  const avatar = document.getElementById("avatar");
  const originalEmoji = avatar.textContent;
  avatar.textContent = "😴";
  avatar.classList.add("sleepy");
  setMessage("Zzz... BuddyBot is taking a nap.");

  setTimeout(async () => {
    avatar.classList.remove("sleepy");
    avatar.textContent = originalEmoji;

    petData.trust += 2;
    petData.xp += 4;
    updateStage();
    addMemory("sleep");
    savePet();
    renderPet();
    bounceAvatar();

    const aiResponse = await askGemini("sleep");
    setMessage(aiResponse || "That was a nice nap! Feeling refreshed 😴");
    setButtonsEnabled(true);
  }, 2200);
}

renderPet();
setMessage("Hi! I'm just hatching... talk to me!");