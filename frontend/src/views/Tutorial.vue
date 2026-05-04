<template>
  <div class="tutorial-container">
    <div class="header">
      <button @click="goBack" class="grey-btn">
        <i class="pi pi-arrow-left" style="margin-right:5px;"> </i> Kembali
      </button>
      <h1>Tutorial: Belajar Huruf</h1>
      <div class="progress-info">
        Level: {{ currentTutorialLevel }} | Huruf: {{ currentLetter }}
      </div>
    </div>

    <div class="content">
      <div class="left-panel">
        <div class="instruction">
          Tirukan isyarat huruf <strong>{{ currentLetter }}</strong>
          <div class="counter">{{ repeatCount }}/3</div>
        </div>
        <div class="sign-image">
          <img :src="`/assets/signs/${currentLetter}.png`" :alt="currentLetter" @error="handleImgError">
          <div v-if="imgError" class="placeholder-letter">{{ currentLetter }}</div>
        </div>
      </div>

      <div class="right-panel">
        <div class="camera-wrapper">
          <video ref="videoRef" class="camera-feed" autoplay playsinline></video>
          <canvas ref="canvasRef" class="overlay"></canvas>
          <div v-if="!isReady" class="loading">Memuat Kamera...</div>
          <div class="detected-badge" v-if="detectedGesture">
            Terdeteksi: {{ detectedGesture }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useGameState } from '../composables/useGameState';
  import { useHandTracking } from '../composables/useHandTracking';

  const { state, completeTutorial, setView, goBack } = useGameState();
  const { isReady, detectedGesture, startTracking, stopTracking } = useHandTracking();

  const videoRef = ref<HTMLVideoElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);

  const getTutorialLetters = (gameLevel: number) => {
    const mapping: Record<number, string[]> = {
      1: ['A', 'B', 'C'],
      2: ['D', 'E', 'F'],
      3: ['A', 'B', 'C', 'D', 'E', 'F'],
      4: ['G', 'H', 'I'],
      5: ['J', 'K', 'L'],
      6: ['G', 'H', 'I', 'J', 'K', 'L'],
      7: ['M', 'N', 'O'],
      8: ['P', 'Q', 'R', 'S'],
      9: ['M', 'N', 'O', 'P', 'Q', 'R', 'S'],
      10: ['T', 'U', 'V'],
      11: ['W', 'X', 'Y', 'Z'],
      12: ['T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      13: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    };
    return mapping[gameLevel] || mapping[1];
  };

  let targetLevel = state.currentLevel;
  const activeTutorialLetters = getTutorialLetters(targetLevel);
  
  const currentTutorialLevel = ref(targetLevel);
  const currentLetterIndex = ref(0);
  const repeatCount = ref(0);
  const imgError = ref(false);

  const currentLetter = ref(activeTutorialLetters[0]);

  const handleImgError = () => { imgError.value = true; };

  onMounted(async () => {
    if (videoRef.value && canvasRef.value) {
      await startTracking(videoRef.value, canvasRef.value);
    }
  });

  onUnmounted(() => {
    stopTracking();
  });

  watch(detectedGesture, (newGesture) => {
    if (newGesture === currentLetter.value) {
      repeatCount.value++;
      if (repeatCount.value >= 3) {
        nextLetter();
      }
    }
  });

  const nextLetter = () => {
    repeatCount.value = 0;
    currentLetterIndex.value++;
    
    if (currentLetterIndex.value >= activeTutorialLetters.length) {
      completeTutorial();
      return;
    }
    
    currentLetter.value = activeTutorialLetters[currentLetterIndex.value];
    imgError.value = false;
  };
</script>

<style scoped>
.tutorial-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #e4f6fff4;
  background-image: url("../../asset/game-bg.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  flex: 1;
}

.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 20px;
  padding: 20px;
}

.instruction {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
}

.counter {
  font-size: 3rem;
  color: var(--primary);
  font-weight: bold;
}

.sign-image {
  width: 300px;
  height: 300px;
  background: #f8f8f8;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px dashed var(--primary);
}

.sign-image img {
  max-width: 100%;
  max-height: 100%;
}

.placeholder-letter {
  font-size: 8rem;
  font-weight: bold;
  color: #ddd;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.detected-badge {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
}

.grey-btn {
  background-color:  #9f9e9e;
  color: white;
  font-size: 1rem;
  border-bottom-color: #7f7f7f;
}

</style>
