const STORAGE_KEY = 'buddybot-pet-data';

const EVOLUTION_EMOJIS = ['🥚', '🐣', '🐥', '🦄', '🐉'];
const EVOLUTION_NAMES = ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary'];

const SOUND_PLACEHOLDERS = {
  feed: '🔊 *nom nom nom*',
  play: '🔊 *boing boing*',
  talk: '🔊 *chirp chirp*',
  sleep: '🔊 *yaaawn*',
  wake: '🔊 *stretch stretch*',
  evolve: '🔊 *TA-DA sparkle jingle*'
};

let pet = null; // current pet, loaded from localStorage or created fresh
let sleepTimer = null; // interval id for the sleep countdown, so we can clear it

// grabbing all the elements we need up front
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const petNameInput = document.getElementById('pet-name-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

const petNameDisplay = document.getElementById('pet-name-display');
const stageBadge = document.getElementById('stage-badge');
const trustBar = document.getElementById('trust-bar');
const trustNum = document.getElementById('trust-num');
const xpBar = document.getElementById('xp-bar');
const xpNum = document.getElementById('xp-num');
const personalityDisplay = document.getElementById('personality-display');

const petEmoji = document.getElementById('pet-emoji');
const petDisplay = document.getElementById('pet-display');
const speechText = document.getElementById('speech-text');
const petSparkles = document.getElementById('pet-sparkles');
const loadingIndicator = document.getElementById('loading-indicator');
const memoryList = document.getElementById('memory-list');

const actionButtons = document.querySelectorAll('.action-btn');

const evolutionOverlay = document.getElementById('evolution-overlay');
const evolutionPetEmoji = document.getElementById('evolution-pet-emoji');
const evolutionText = document.getElementById('evolution-text');
const evolutionCloseBtn = document.getElementById('evolution-close-btn');
const confettiContainer = document.getElementById('confetti-container');

function loadPet() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      pet = JSON.parse(saved);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

function savePet() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
}

function createNewPet(name) {
  pet = {
    name: name,
    personality: 'curious and friendly',
    memories: [],
    trust: 50,
    xp: 0,
    evolutionStage: 0,
    sleepUntil: null
  };
  savePet();
}

function init() {
  if (loadPet()) {
    showGameScreen();
    renderPet();
    if (pet.sleepUntil && pet.sleepUntil > Date.now()) {
      enterSleep(pet.sleepUntil - Date.now());
    }
  } else {
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
  }
}

function showGameScreen() {
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

function renderPet() {
  petNameDisplay.textContent = pet.name;
  const stage = Math.min(pet.evolutionStage, EVOLUTION_EMOJIS.length - 1);
  petEmoji.textContent = EVOLUTION_EMOJIS[stage];
  stageBadge.textContent = `🌱 ${EVOLUTION_NAMES[stage]}`;

  const trustPct = Math.max(0, Math.min(100, pet.trust));
  const xpPct = Math.max(0, Math.min(100, pet.xp % 100));
  trustBar.style.width = trustPct + '%';
  trustNum.textContent = trustPct;
  xpBar.style.width = xpPct + '%';
  xpNum.textContent = pet.xp;

  personalityDisplay.textContent = pet.personality;

  renderMemories();
}

function renderMemories() {
  memoryList.innerHTML = '';
  const recent = pet.memories.slice(-6).reverse();
  if (recent.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No memories yet... make some!';
    memoryList.appendChild(li);
    return;
  }
  recent.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m;
    memoryList.appendChild(li);
  });
}

function setSpeech(text) {
  speechText.textContent = text;
  const bubble = document.getElementById('speech-bubble');
  bubble.style.animation = 'none';
  void bubble.offsetWidth;
  bubble.style.animation = 'pop-in 0.25s ease';
}

function playSound(key) {
  // Placeholder for sound effects - swap with real Audio() calls once files are added
  console.log(SOUND_PLACEHOLDERS[key] || '🔊 *sound*');
}

function spawnSparkles() {
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = ['✨', '💖', '⭐', '🌟'][Math.floor(Math.random() * 4)];
    s.style.left = (30 + Math.random() * 40) + '%';
    s.style.top = '60%';
    s.style.animationDelay = (Math.random() * 0.3) + 's';
    petSparkles.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

function reactPetAnimation() {
  petDisplay.classList.remove('reacting');
  void petDisplay.offsetWidth;
  petDisplay.classList.add('reacting');
}

function setButtonsDisabled(disabled) {
  actionButtons.forEach(btn => btn.disabled = disabled);
}

// puts the pet to bed for `durationMs` - buttons stay locked until it wakes up
function enterSleep(durationMs) {
  setButtonsDisabled(true);
  petDisplay.classList.add('asleep');

  const updateCountdown = () => {
    const msLeft = pet.sleepUntil - Date.now();
    if (msLeft <= 0) {
      wakeUp();
      return;
    }
    const minsLeft = Math.ceil(msLeft / 60000);
    setSpeech(`💤 Zzz... sleeping for ${minsLeft} more min${minsLeft === 1 ? '' : 's'}`);
  };

  updateCountdown();
  clearInterval(sleepTimer);
  sleepTimer = setInterval(updateCountdown, 15000); // refresh the countdown text periodically
}

function wakeUp() {
  clearInterval(sleepTimer);
  sleepTimer = null;
  pet.sleepUntil = null;
  savePet();
  petDisplay.classList.remove('asleep');
  setButtonsDisabled(false);
  playSound('wake');
  setSpeech(`${pet.name} wakes up, stretching! 🌤️`);
}

// confetti + modal when the pet levels up a stage
function celebrateEvolution() {
  playSound('evolve');
  const stage = Math.min(pet.evolutionStage, EVOLUTION_EMOJIS.length - 1);
  evolutionPetEmoji.textContent = EVOLUTION_EMOJIS[stage];
  evolutionText.textContent = `${pet.name} evolved into a ${EVOLUTION_NAMES[stage]}!`;
  evolutionOverlay.classList.remove('hidden');

  confettiContainer.innerHTML = '';
  const confettiEmojis = ['🎉', '✨', '🎊', '⭐', '💖'];
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.animationDelay = (Math.random() * 0.8) + 's';
    piece.style.fontSize = (14 + Math.random() * 14) + 'px';
    confettiContainer.appendChild(piece);
  }
}

evolutionCloseBtn.addEventListener('click', () => {
  evolutionOverlay.classList.add('hidden');
});

async function performAction(action) {
  setButtonsDisabled(true);
  loadingIndicator.classList.remove('hidden');
  setSpeech('...');

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: pet.name,
        personality: pet.personality,
        memories: pet.memories,
        trust: pet.trust,
        xp: pet.xp,
        evolutionStage: pet.evolutionStage,
        action: action
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Request failed');
    }

    const data = await res.json();
    applyResponse(data, action);

  } catch (err) {
    console.error(err);
    setSpeech("Uh oh, I couldn't think of anything to say. Check your Gemini API key in .env!");
  } finally {
    loadingIndicator.classList.add('hidden');
    if (!pet.sleepUntil) setButtonsDisabled(false);
  }
}

function applyResponse(data, action) {
  const wasStage = pet.evolutionStage;

  pet.trust = Math.max(0, Math.min(100, pet.trust + (data.trustChange || 0)));
  pet.xp = Math.max(0, pet.xp + (data.xpGain || 0));

  if (data.personalityUpdate && data.personalityUpdate.trim() !== '') {
    pet.personality = data.personalityUpdate.trim();
  }

  if (data.newMemory && data.newMemory.trim() !== '') {
    pet.memories.push(data.newMemory.trim());
    if (pet.memories.length > 20) pet.memories = pet.memories.slice(-20);
  }

  let didEvolve = false;
  if (data.evolution === true && pet.evolutionStage < EVOLUTION_EMOJIS.length - 1) {
    pet.evolutionStage += 1;
    didEvolve = true;
  }

  savePet();
  renderPet();
  reactPetAnimation();
  spawnSparkles();

  if (action === 'sleep' && data.sleepMinutes > 0) {
    pet.sleepUntil = Date.now() + data.sleepMinutes * 60000;
    savePet();
    setSpeech(data.message || 'Zzz...');
    setTimeout(() => enterSleep(data.sleepMinutes * 60000), 900);
  } else {
    setSpeech(data.message || '...');
  }

  if (didEvolve) {
    setTimeout(() => celebrateEvolution(), 500);
  }
}

startBtn.addEventListener('click', () => {
  const name = petNameInput.value.trim();
  if (!name) {
    petNameInput.style.borderColor = '#ff3d81';
    petNameInput.placeholder = 'Please enter a name!';
    return;
  }
  createNewPet(name);
  showGameScreen();
  renderPet();
  setSpeech(`Hi, I'm ${name}! Nice to meet you! 🎉`);
});

petNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startBtn.click();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to release your BuddyBot? This cannot be undone!')) {
    localStorage.removeItem(STORAGE_KEY);
    pet = null;
    location.reload();
  }
});

actionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    playSound(action);
    performAction(action);
  });
});

petDisplay.addEventListener('click', () => {
  reactPetAnimation();
  spawnSparkles();
});

init();