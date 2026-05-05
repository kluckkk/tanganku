<template>
  <div class="kamus-container">
    <div class="header">
      <button class="grey-btn" @click="setView('MainMenu')">
        <i class="pi pi-arrow-left" style="margin-right:5px;"> </i> Kembali
      </button>
      <h1>Kamus Abjad BISINDO</h1>
    </div>

    <div class="grid">
      <div v-for="letter in alphabets" :key="letter" class="card">
        <div class="letter-img">
          <img :src="`../asset/diagram/${letter}.png`" :alt="letter" @error="handleImgError">
          <span class="placeholder-text" v-if="imgErrors[letter]">{{ letter }}</span>
        </div>
        <div class="label">{{ letter }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useGameState } from '../composables/useGameState';

const { setView } = useGameState();
const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const imgErrors = reactive<Record<string, boolean>>({});

const handleImgError = (e: any) => {
  const letter = e.target.alt;
  imgErrors[letter] = true;
};
</script>

<style scoped>
.kamus-container {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  background-color: #e4f6fff4;
  background-image: url("../../asset/game-bg.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding-bottom: 50px;
}

.card {
  text-align: center;
  padding: 10px;
  background: linear-gradient(145deg, #ffffff, #ecfffe);
  border-radius: 15px;
  padding: 12px;
  
  box-shadow: 
    0 6px 0 rgba(0,0,0,0.1),   
    0 8px 20px rgba(0,0,0,0.1);

  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-6px) scale(1.03);
  filter: brightness(1.01);
}

.letter-img {
  aspect-ratio: 1;
  background: #f0f0f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  overflow: hidden;
}

.letter-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ccc;
}

.label {
  font-size: 1.5rem;
  font-weight: bold;
}

.grey-btn {
  background-color:  #9f9e9e;
  color: white;
  font-size: 1rem;
  border-bottom-color: #7f7f7f;
}

</style>
