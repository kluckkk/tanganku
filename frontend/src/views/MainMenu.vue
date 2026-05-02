<template>
  <div class="menu-container">
    <img src="../../asset/logo TANGANKU.png" alt="" class="title">
    
    <div class="button-group">
      <button class="btn-main" @click="handlePlay">Main</button>
      <button class="btn-kamus" @click="setView('Kamus')">Kamus</button>
    </div>

    <div class="stats">
      <p>High Score: Level {{ state.highScore || 1 }}</p>
    </div>

    <!-- Selection Overlay -->
    <div v-if="showPlayOptions" class="overlay">
      <div class="overlay-content">
        <h2>Siap Bermain?</h2>
        <p>Level saat ini: {{ state.currentLevel }}</p>
        <div class="option-buttons">
          <button
            v-if="!isCurrentLevelFinal"
            @click="startTutorial"
            class="btn-learn"
          >
            Pelajari Huruf
          </button>
          <button @click="startGame" class="btn-play">
            {{ isCurrentLevelFinal ? 'Level Terakhir' : 'Langsung Main' }}
          </button>
        </div>
        <p v-if="isCurrentLevelFinal" class="instruction-text">Semua huruf akan ditampilkan!</p>
        <button @click="showPlayOptions = false" class="btn-close">Kembali</button>      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useGameState } from '../composables/useGameState';

  const { state, setView, resetGame, goBack } = useGameState();
  const showPlayOptions = ref(false);

  const isCurrentLevelFinal = computed(() => {
    return state.currentLevel + 1 === 13;//final level
  });

  const handlePlay = () => {
    showPlayOptions.value = true;
  };

  const startGame = () => {
    resetGame();
    setView('Game');
    showPlayOptions.value = false;
  };

  const startTutorial = () => {
    setView('Tutorial');
    showPlayOptions.value = false;
  };
</script>

<style scoped>
.menu-container {
  background-color: #e9ddbaf4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
}

.title {
  margin-top: 10px;
  margin-bottom: 20px;
  height: 50%;
}

.subtitle {
  font-size: 1.5rem;
  color: var(--text);
  margin-top: 0;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
}

.btn-main {
  background-color: var(--primary);
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 0 #16a34a;
}

.btn-kamus {
  background-color: var(--secondary);
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 0 #2563eb;
}

.stats {
  font-size: 1.2rem;
}

/* Overlay Styles */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.overlay-content {
  background: white;
  padding: 40px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 500px;
  width: 90%;
}

.overlay-content h2 {
  font-size: 2.5rem;
  color: #004a9e;
  margin: 0;
}

.option-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.btn-learn {
  background-color: var(--secondary);
  color: white;
  font-size: 1.5rem;
}

.btn-play {
  background-color: var(--primary);
  color: white;
  font-size: 1.5rem;
}

.btn-close {
  background-color: #cbd5e1;
  color: #334155;
  font-size: 1rem;
  margin-top: 10px;
}
</style>
