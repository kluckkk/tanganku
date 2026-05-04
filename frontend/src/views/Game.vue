<template>
  <div class="game-container">
    <div class="game-header">
      <div class="hearts">
        <span v-for="i in 5" :key="i" class="heart">
          {{ i <= state.hearts ? '❤️' : '🖤' }}
        </span>
      </div>
      <div class="score">Skor: {{ state.score }}</div>
      <div class="level">Level: {{ state.currentLevel }}</div>
      <button class="grey-btn" @click="setView('MainMenu')">
        <i class="pi pi-home" style="margin-right:5px;"> </i> Keluar
      </button>
    </div>

    <div class="game-area" ref="gameAreaRef">
      <!-- Falling Letters -->
      <div 
        v-for="letter in activeLetters" 
        :key="letter.id" 
        class="falling-letter"
        :style="{ left: letter.x + 'px', top: letter.y + 'px' }"
      >
        <div class="letter-circle" :style="{ '--ball-color': letter.color.base, '--ball-dark': letter.color.dark }">{{ letter.char }}</div>
      </div>

      <!-- Camera Feed (Bottom Right) -->
      <div class="mini-camera">
        <video ref="videoRef" autoplay playsinline></video>
        <canvas ref="canvasRef"></canvas>
        <div class="feedback" v-if="detectedGesture">
          {{ detectedGesture }}
        </div>
      </div>

      <!-- Overlays -->
      <div v-if="gameOver" class="overlay">
        <h2>Ayo Coba Lagi!</h2>
        <button @click="restartGame" class="green-btn">Main Lagi</button>
      </div>

      <div v-if="levelSuccess" class="overlay success">
        <h2>Kamu Berhasil!</h2>
        <p>Siap untuk Level {{ state.currentLevel }}?</p>
        <div class="button-group">
          <button
            v-if="!isNextLevelFinal"
            @click="goToTutorial"
            class="blue-btn"
          >
            {{ isRecapNext ? 'Pelajari Huruf' : 'Pelajari Huruf Baru' }}
          </button>
          <button @click="startNextLevel" class="green-btn">
            {{ isNextLevelFinal ? 'Level Terakhir' : 'Langsung Main' }}
          </button>
          <p v-if="isNextLevelFinal" class="instruction-text">Semua huruf akan ditampilkan!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { useGameState } from '../composables/useGameState';
import { useHandTracking } from '../composables/useHandTracking';

const MAX_LEVEL = 13;

const { state, loseHeart, addScore, nextLevel, setView, resetGame } = useGameState();
const { startTracking, stopTracking, detectedGesture } = useHandTracking();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const gameAreaRef = ref<HTMLElement | null>(null);

const activeLetters = ref<any[]>([]);
const gameOver = ref(false);
const levelSuccess = ref(false);
const gameIsActive = ref(false);
let gameLoop: number;
let spawnInterval: any;

const isRecapNext = computed(() => {
  return [3, 6, 9, 12, MAX_LEVEL].includes(state.currentLevel);
});

const isNextLevelFinal = computed(() => {
  return state.currentLevel + 1 === MAX_LEVEL;
});

const goToTutorial = () => {
  console.log("goToTutorial called. currentLevel:", state.currentLevel);
  setView('Tutorial');
};

const colorPool = [
  { base: '#4ade80', dark: '#16a34a' }, 
  { base: '#60a5fa', dark: '#2563eb' }, 
  { base: '#facc15', dark: '#ca8a04' }, 
  { base: '#ef4444', dark: '#b91c1c' }  
];

const getLettersPool = () => {
  const gameLevels = [
    ['A', 'B', 'C'], // L1
    ['D', 'E', 'F'], // L2
    ['A', 'B', 'C', 'D', 'E', 'F'], // L3 (Recap A-F)
    ['G', 'H', 'I'], // L4
    ['J', 'K', 'L'], // L5
    ['G', 'H', 'I', 'J', 'K', 'L'], // L6 (Recap G-L)
    ['M', 'N', 'O'], // L7
    ['P', 'Q', 'R', 'S'], // L8
    ['M', 'N', 'O', 'P', 'Q', 'R', 'S'], // L9 (Recap M-S)
    ['T', 'U', 'V'], // L10
    ['W', 'X', 'Y', 'Z'], // L11
    ['T', 'U', 'V', 'W', 'X', 'Y', 'Z'], // L12 (Recap T-Z)
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] // L13 (Grand Recap)
  ];

  const levelIndex = Math.min(state.currentLevel - 1, gameLevels.length - 1);
  return gameLevels[levelIndex >= 0 ? levelIndex : 0];
};

const getTargetScore = (level: number) => {
  if (level <= 2) return 10;
  if (level === 3) return 20;
  if (level <= 5) return 20;
  if (level === 6) return 25;
  if (level <= 8) return 25;
  if (level === 9) return 30;
  if (level <= 11) return 30;
  return 35; // L12 and L13
};

const spawnLetter = () => {
  if (gameOver.value || levelSuccess.value || !gameIsActive.value) return;
  
  const pool = getLettersPool();
  const char = pool[Math.floor(Math.random() * pool.length)];
  const x = 50 + Math.random() * (window.innerWidth - 150);

  const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];

  activeLetters.value.push({
    id: Date.now() + Math.random(),
    char,
    x,
    y: -50,
    speed: 1.2 + state.currentLevel * 0.25, // Balanced speed progression
    color: randomColor
  });
};

const updateGame = () => {
  if (!gameIsActive.value || gameOver.value || levelSuccess.value) return;

  let heartLostThisFrame = false;

  for (let i = activeLetters.value.length - 1; i >= 0; i--) {
    const letter = activeLetters.value[i];
    letter.y += letter.speed;
    
    // Check if letter reached bottom
    if (letter.y > window.innerHeight - 150) {
      activeLetters.value.splice(i, 1);
      loseHeart();
      heartLostThisFrame = true;
      if (state.hearts <= 0) {
        gameOver.value = true;
        gameIsActive.value = false;
        break;
      }
    }
  }

  // Check for success ONLY if we haven't lost a heart this frame
  if (!heartLostThisFrame && !gameOver.value) {
    const targetScore = getTargetScore(state.currentLevel);
    if (state.score >= targetScore && levelSuccess.value==false) {
      console.log("game won. currentLevel before nextLevel:", state.currentLevel);
      levelSuccess.value = true;
      nextLevel();
      gameIsActive.value = false;
    }
  }

  if (gameIsActive.value) {
    gameLoop = requestAnimationFrame(updateGame);
  }
};

// Check if detected gesture matches the LOWEST falling letter of that type
watch(detectedGesture, (newGesture) => {
  if (!newGesture || !gameIsActive.value) return;
  
  // Find all matching letters
  const matches = activeLetters.value
    .map((l, index) => ({ ...l, index }))
    .filter(l => l.char === newGesture);

  if (matches.length > 0) {
    // Sort by Y (descending) to find the lowest one
    matches.sort((a, b) => b.y - a.y);
    const lowestMatchIndex = matches[0].index;

    activeLetters.value.splice(lowestMatchIndex, 1);
    addScore(1);
  }
});

// Function to start or restart a game round
const initializeGameRound = (resetLevel = false) => {
  cancelAnimationFrame(gameLoop); // Stop previous game loop if any
  clearInterval(spawnInterval); // Stop previous spawn interval if any

  resetGame(resetLevel); // Resets score, hearts, and currentLevel if resetLevel is true
  
  activeLetters.value = [];
  gameOver.value = false;
  levelSuccess.value = false;
  gameIsActive.value = true; // Mark game as active

  updateGame(); // Start game loop
  spawnInterval = setInterval(spawnLetter, 2000 / (1 + state.currentLevel * 0.2));
};

const restartGame = () => {
  initializeGameRound(true); // Reset level to 1
};

const startNextLevel = () => {
  initializeGameRound(false); // Do not reset level (level already incremented on success)
};

onMounted(async () => {
  if (videoRef.value && canvasRef.value) {
    await startTracking(videoRef.value, canvasRef.value);
  }
  
  // Decide what to display/do based on global game state when Game.vue mounts
  if (state.hearts <= 0) { // Game is over
    gameOver.value = true;
    gameIsActive.value = false;
    cancelAnimationFrame(gameLoop);
    clearInterval(spawnInterval);
  } else if (state.currentLevel > 1 && state.score > 0) { // A level was just won, display success overlay
    levelSuccess.value = true;
    gameIsActive.value = false;
    cancelAnimationFrame(gameLoop);
    clearInterval(spawnInterval);
  } else { // Otherwise, it's a fresh start for Level 1, or explicitly starting a game
    initializeGameRound(false);
  }
});

onUnmounted(() => {
  gameIsActive.value = false;
  stopTracking(); // Ensure tracking is stopped when component unmounts
  cancelAnimationFrame(gameLoop);
  clearInterval(spawnInterval);
});
</script>

<style scoped>
.game-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-size: 1.5rem;
  z-index: 110;
}

.game-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #e4f6fff4;
  background-image: url("../../asset/game-bg.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.falling-letter {
  position: absolute;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;

 background: radial-gradient(
    circle at 30% 30%, 
    #ffffff 5%, 
    var(--ball-color) 40%, 
    var(--ball-dark) 100%
  );

  box-shadow: 
    0 8px 15px rgba(0,0,0,0.3), 
    inset -4px -6px 10px rgba(0,0,0,0.4), 
    inset 4px 6px 10px rgba(255,255,255,0.4);
}

.mini-camera {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 240px;
  height: 180px;
  background: #000;
  border-radius: 15px;
  border: 4px solid var(--primary);
  overflow: hidden;
}

.mini-camera video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
}

.mini-camera canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
}

.feedback {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--accent);
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 100;
}

.overlay h2 {
  font-size: 4rem;
  color: var(--danger);
  margin: 0;
}

.overlay p {
  font-size: 1.5rem;
  margin: 10px 0 20px 0;
}

.overlay.success h2 {
  color: var(--primary);
}

.overlay button {
  color: white;
}

.button-group {
  display: flex;
  gap: 20px;
}

.green-btn {
  background-color: var(--primary);
  font-size: 1.5rem;
  border-bottom-color: #16a34a;
  color: white;
}

.blue-btn {
  background-color: var(--secondary);
  font-size: 1.5rem;
  border-bottom-color: #2563eb;
  color: white;
}

.grey-btn {
  background-color:  #9f9e9e;
  color: white;
  font-size: 1rem;
  border-bottom-color: #7f7f7f;
}
</style>
