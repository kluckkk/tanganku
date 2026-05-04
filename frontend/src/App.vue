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
  font-family: 'Baloo Tamma 2','Comic Sans', cursive;
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
  font-family: 'Alan Sans';
  
  background-image: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
  background-color: #e2e8f0; 
  
  border-bottom: 6px solid rgba(0,0,0,0.2);

  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  transition: all 0.1s;
  position: relative;
  top: 0;
}

button:hover {
  filter: brightness(1.05);
}

button:active {
  top: 4px;
  border-bottom-width: 2px;
  box-shadow: 0 2px 3px rgba(0,0,0,0.1);
}
</style>
