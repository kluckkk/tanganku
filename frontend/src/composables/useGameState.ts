import { reactive, watch } from 'vue';

export interface GameState {
  userId: string;
  currentView: 'MainMenu' | 'Kamus' | 'Tutorial' | 'Game';
  previousView: 'MainMenu' | 'Kamus' | 'Tutorial' | 'Game' | null;
  currentLevel: number;
  highScore: number;
  tutorialDone: boolean;
  hearts: number;
  score: number;
}

const STORAGE_KEY = 'tanganku_progress';

const initialState: GameState = {
  userId: crypto.randomUUID(),
  currentView: 'MainMenu',
  previousView: null,
  currentLevel: 1,
  highScore: 0,
  tutorialDone: false,
  hearts: 5,
  score: 0
};

// Load from localStorage if exists
const savedState = localStorage.getItem(STORAGE_KEY);
const parsedState = savedState ? JSON.parse(savedState) : {};

const state = reactive<GameState>({
  ...initialState,
  ...parsedState
});

// Reset runtime state but keep progress
state.hearts = 5;
state.score = 0;
state.currentView = 'MainMenu';
if (!savedState) state.tutorialDone = false;

// Initial fetch from backend if userId exists
const syncWithBackend = async () => {
  try {
    const response = await fetch(`http://localhost:3000/scores/${state.userId}`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        console.log("Progress loaded from backend:", data);
        if (data.highScore > state.highScore) state.highScore = data.highScore;
        if (data.currentLevel > state.currentLevel) state.currentLevel = data.currentLevel;
        if (data.tutorialDone) state.tutorialDone = true;
      }
    }
  } catch (e) {
    console.warn("Could not fetch from backend, using local data.", e);
  }
};

syncWithBackend();

// Watch for progress changes to save and sync with backend
watch(() => [state.currentLevel, state.highScore, state.tutorialDone], async () => {
  const toSave = {
    userId: state.userId,
    currentLevel: state.currentLevel,
    highScore: state.highScore,
    tutorialDone: state.tutorialDone
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState, ...toSave }));

  // Sync with backend
  try {
    await fetch('http://localhost:3000/scores/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave)
    });
  } catch (e) {
    console.warn("Backend sync failed, saved locally only.", e);
  }
}, { deep: true });

export function useGameState() {
  const setView = (view: GameState['currentView']) => {
    state.previousView = state.currentView;
    state.currentView = view;
  };

  const goBack = () => {
    console.log("goBack called. currentLevel:", state.currentLevel, "previousView:", state.previousView, "currentView:", state.currentView);
    if (state.previousView) {
      state.currentView = state.previousView;
      state.previousView = null;
    } else {
      state.currentView = 'MainMenu';
    }
  };

  const nextLevel = () => {
    console.log("nextLevel called. currentLevel was:", state.currentLevel);
    state.currentLevel++;
    state.tutorialDone = false;
    if (state.currentLevel > state.highScore) {
      state.highScore = state.currentLevel;
    }
    console.log("nextLevel finished. currentLevel is now:", state.currentLevel);
  };

  const loseHeart = () => {
    state.hearts--;
    if (state.hearts <= 0) {
      state.currentLevel = 1;
      state.tutorialDone = false;
    }
  };

  const addScore = (points: number) => {
    state.score += points;
  };

  const completeTutorial = () => {
    state.tutorialDone = true;
    state.hearts = 5;
    state.score = 0;
    state.currentView = 'Game';
    state.previousView = null;
  };

  const resetGame = (resetLevel = false) => {
    state.hearts = 5;
    state.score = 0;
    if (resetLevel) {
      state.currentLevel = 1;
      state.tutorialDone = false;
    }
  };

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    state.userId = crypto.randomUUID();
    state.currentLevel = 1;
    state.highScore = 0;
    state.tutorialDone = false;
    state.hearts = 5;
    state.score = 0;
    state.currentView = 'MainMenu';
  };

  return {
    state,
    setView,
    goBack,
    nextLevel,
    loseHeart,
    addScore,
    completeTutorial,
    resetGame,
    clearProgress
  };
}
