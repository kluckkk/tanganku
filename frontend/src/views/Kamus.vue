<template>
  <div class="kamus-container">
    <div class="header">
      <button @click="setView('MainMenu')" class="back-btn">Kembali</button>
      <h1>Kamus BISINDO</h1>
    </div>

    <div class="grid">
      <div v-for="letter in alphabets" :key="letter" class="card">
        <div class="letter-img">
          <!-- Placeholder for actual sign images -->
          <img :src="`/assets/signs/${letter}.png`" :alt="letter" @error="handleImgError">
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
  background: white;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
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

.back-btn {
  background: var(--accent);
  color: var(--text);
}
</style>
