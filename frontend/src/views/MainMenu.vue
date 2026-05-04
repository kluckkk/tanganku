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
            class="blue-btn"
          >
            Pelajari Huruf
          </button>
          <button @click="startGame" class="green-btn">
            {{ isCurrentLevelFinal ? 'Level Terakhir' : 'Langsung Main' }}
          </button>
        </div>
        <p v-if="isCurrentLevelFinal" class="instruction-text">Semua huruf akan ditampilkan!</p>
        <button class="grey-btn" @click="showPlayOptions = false">
          <i class="pi pi-arrow-left" style="margin-right:5px;"> </i> Kembali
        </button>
        </div>
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
  background-color: #e4f6fff4;
  background-image: url("../../asset/main-menu-bg.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 4px;
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
  border-bottom-color: #16a34a;
}

.btn-kamus {
  background-color: var(--secondary);
  color: white;
  font-size: 2rem;
  border-bottom-color: #2563eb;
}

.stats {
  font-size: 1.2rem;
  color: white;
  margin: 0;
}

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

.overlay-content h2,
.overlay-content p {
  margin: 0;
}

.overlay-content h2 {
  font-size: 2.5rem;
  color: #004a9e;
}

.option-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
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
