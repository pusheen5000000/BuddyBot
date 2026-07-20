const STORAGE_KEY = 'buddybot-pet-data';

const EGG_TYPES = {
  egg1: {
    names: ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary']
  },
  egg2: {
    names: ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary']
  },
  egg3: {
    names: ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary']
  }
};

const IMAGE_SETS = {
    egg1: [
        "egg1",
        "baby1",
        "teen1",
        "adult1",
        "legendary1"
    ],
    egg2: [
        "egg2",
        "baby2",
        "teen2",
        "adult2",
        "legendary2"
    ],
    egg3: [
        "egg3",
        "baby3",
        "teen3",
        "adult3",
        "legendary3"
    ]
};

const DEFAULT_EGG_TYPE = 'egg1';

function getEvolutionSet(petObj) {
  return EGG_TYPES[petObj.eggType] || EGG_TYPES[DEFAULT_EGG_TYPE];
}

const SOUND_PLACEHOLDERS = {
  feed: '🔊 *nom nom nom*',
  play: '🔊 *boing boing*',
  talk: '🔊 *chirp chirp*',
  sleep: '🔊 *yaaawn*',
  wake: '🔊 *stretch stretch*',
  evolve: '🔊 *TA-DA sparkle jingle*'
};

let pet = null;
let sleepTimer = null;

const eggSelectScreen = document.getElementById('egg-select-screen');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const petNameInput = document.getElementById('pet-name-input');
const startBtn = document.getElementById('start-btn');
const backToEggBtn = document.getElementById('back-to-egg-btn');
const resetBtn = document.getElementById('reset-btn');
const eggCards = document.querySelectorAll('.egg-card');
const setupEggEmojiHeading = document.getElementById('setup-egg-emoji-heading');

let selectedEggType = null;

const petNameDisplay = document.getElementById('pet-name-display');
const stageBadge = document.getElementById('stage-badge');
const trustBar = document.getElementById('trust-bar');
const trustNum = document.getElementById('trust-num');
const xpBar = document.getElementById('xp-bar');
const xpNum = document.getElementById('xp-num');
const personalityDisplay = document.getElementById('personality-display');

const petImage = document.getElementById('pet-image');
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

// async function createNewPet(name, eggType) {

//   const response = await fetch('/create-personality', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       name,
//       eggType
//     })
//   });

//   const personalityData = await response.json();

//   pet = {
//     name: name,
//     eggType: eggType || DEFAULT_EGG_TYPE,

//     personality: personalityData.personality,
//     favoriteThing: personalityData.favoriteThing,
//     backstory: personalityData.backstory,

//     memories: [],
//     trust: 50,
//     xp: 0,
//     evolutionStage: 0,
//     sleepUntil: null
//   };

//   savePet();
// }

async function createNewPet(name, eggType) {

  // Temporary fake Gemini response
  const personalities = [
    {
      personality: "playful and curious",
      favoriteThing: "collecting shiny stars",
      backstory: "A tiny BuddyBot that hatched from a magical egg!"
    },
    {
      personality: "silly and energetic",
      favoriteThing: "playing games",
      backstory: "A cheerful BuddyBot ready for adventures!"
    },
    {
      personality: "gentle and thoughtful",
      favoriteThing: "making new friends",
      backstory: "A sweet BuddyBot who loves helping others!"
    }
  ];

  const personalityData = personalities[
    Math.floor(Math.random() * personalities.length)
  ];

  pet = {
    name: name,
    eggType: eggType || DEFAULT_EGG_TYPE,

    personality: personalityData.personality,
    favoriteThing: personalityData.favoriteThing,
    backstory: personalityData.backstory,

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
    petImage.className = `stage-${stage}`;
    if (pet.sleepUntil && pet.sleepUntil > Date.now()) {
      enterSleep(pet.sleepUntil - Date.now());
    }
  } else {
    showEggSelectScreen();
  }
}

function showEggSelectScreen() {
  eggSelectScreen.classList.remove('hidden');
  setupScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
}

function showSetupScreen() {
  eggSelectScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
}

function showGameScreen() {
  eggSelectScreen.classList.add('hidden');
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

function renderPet() {
  petNameDisplay.textContent = pet.name;

  const evoSet = getEvolutionSet(pet);

  const images = IMAGE_SETS[pet.eggType];
  const stage = Math.min(pet.evolutionStage, images.length - 1);

  petImage.src = `images/${images[stage]}.png`;

  petImage.className = "";
  petImage.classList.add(`stage-${stage}`);

  if (pet.eggType === "egg1" && stage === 4) {
    petImage.classList.add("legendary1");
  }
  petImage.className = images[stage];

  stageBadge.textContent = `🌱 ${evoSet.names[stage]}`;

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
  sleepTimer = setInterval(updateCountdown, 15000);
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

function celebrateEvolution() {
  playSound('evolve');

  const images = IMAGE_SETS[pet.eggType];
  const stage = Math.min(pet.evolutionStage, images.length - 1);

  evolutionPetEmoji.innerHTML =
    `<img src="images/${images[stage]}.png" width="120">`;

  evolutionText.textContent =
    `${pet.name} evolved into a ${getEvolutionSet(pet).names[stage]}!`;

  evolutionOverlay.classList.remove('hidden');
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
  const evoSet = getEvolutionSet(pet);
  if (data.evolution === true && pet.evolutionStage < IMAGE_SETS[pet.eggType].length - 1) {
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

eggCards.forEach(card => {
  card.addEventListener('click', () => {
    selectedEggType = card.getAttribute('data-egg');

    eggCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    setupEggEmojiHeading.textContent = `🥚 Adopt Your BuddyBot!`;

    showSetupScreen();
    petNameInput.value = '';
    petNameInput.focus();
  });
});

backToEggBtn.addEventListener('click', () => {
  showEggSelectScreen();
});

startBtn.addEventListener('click', async () => {
  const name = petNameInput.value.trim();
  if (!name) {
    petNameInput.style.borderColor = '#ff3d81';
    petNameInput.placeholder = 'Please enter a name!';
    return;
  }
startBtn.textContent = "✨ Creating your BuddyBot...";

await createNewPet(name, selectedEggType);

showGameScreen();

startBtn.textContent = "✨ Hatch BuddyBot! ✨";
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

