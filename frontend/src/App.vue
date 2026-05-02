<template>
  <div class="app-container">
    <Transition name="fade" mode="out-in">
      <component :is="views[state.currentView]" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { useGameState } from './composables/useGameState';
  import MainMenu from './views/MainMenu.vue';
  import Kamus from './views/Kamus.vue';
  import Tutorial from './views/Tutorial.vue';
  import Game from './views/Game.vue';

  const { state } = useGameState();

  const views = {
    MainMenu,
    Kamus,
    Tutorial,
    Game
  };
</script>

<style>
:root {
  --primary: #4ade80;
  --secondary: #60a5fa;
  --accent: #facc15;
  --danger: #ef4444;
  --bg: #f0fdf4;
  --text: #166534;
}

body {
  margin: 0;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
  background-color: var(--bg);
  color: var(--text);
  overflow: hidden;
}

.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.025);
}

button:active {
  transform: scale(0.95);
}
</style>
