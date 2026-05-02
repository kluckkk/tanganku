# Tanganku App - Project Documentation

## Project Architecture
This project is structured as a **Monorepo** using **NPM Workspaces**.

- **Root Folder**: Manages shared dependencies and orchestration scripts.
- **`/backend`**: NestJS application (API, logic).
- **`/frontend`**: Vue 3 + Vite application (UI, Mediapipe, TensorFlow.js).
- **`/ml`**: Python scripts for data extraction, model training, and visualization.

## AI Model & Tracking (April 2026 Update)

### 1. Training & Export
- **Dataset**: **~7,985 samples** across the full BISINDO alphabet.
- **Architecture**: 126 inputs -> 128 (BN/Dropout) -> 64 (BN/Dropout) -> 32 -> Softmax.
- **Manual Export**: `ml/manual_export.py` generates a single `model_data.json` with patched `batch_input_shape`.
- **Robust Loading**: Frontend uses a layer-by-layer weight assignment to handle complex architectures (BatchNormalization).

### 2. Real-Time Normalization
- **Selfie Mode Fix**: MediaPipe runs in `selfieMode: true`. Frontend "un-mirrors" X-coordinates before prediction to match the non-mirrored training data.
- **Combined Normalization**: Both hands share a global origin (Right Wrist or Left Wrist) for consistent feature mapping.
- **Canvas Sync**: Canvas resolution is dynamically synced with the video stream to prevent skeletal misalignment (`object-fit: contain`).

## Game Mechanics & Progression

### 1. Level Structure (A-Z)
The game now consists of **13 levels** covering the full alphabet with a revised periodic recap structure:
- **L1-2**: ABC, DEF
- **L3**: **Recap (A-F)**
- **L4-5**: GHI, JKL
- **L6**: **Recap (G-L)**
- **L7-8**: MNO, PQRS
- **L9**: **Recap (M-S)**
- **L10-11**: TUV, WXYZ
- **L12**: **Recap (T-Z)**
- **L13**: **Grand Recap (A-Z)**

### 2. Scoring & Difficulty
- **Target Scores**: 10 (L1-2), 20 (L3-5), 30 (L6-8), 40 (L9-11), 50 (L12-13).
- **Lives**: Player starts with **5 Hearts**.
- **Lowest Priority**: In a group of identical falling letters, the gesture only clears the one closest to the bottom.

### 3. User Flow
- **Play Options**: Main Menu allows users to "Pelajari Huruf" (Tutorial) or "Langsung Main" (Game).
- **Contextual Tutorial**: Finishing a level offers a "Pelajari Huruf" or "Pelajari Huruf Baru" button that loads the appropriate upcoming letters/recaps.
- **Navigation**: Tutorial "Batal" button is context-aware (returns to Game success screen if applicable).

## Key Fixes & Improvements (April 2026 Update)
-   **Forced Level Reset on Game Over**: Players now always restart from Level 1 upon losing all hearts, with progress persistently reset in the backend and local storage.
-   **Synchronized Tutorial Progression**: Tutorial content and button labels ("Pelajari Huruf" vs "Pelajari Huruf Baru") now dynamically adjust to the player's `currentLevel` and `tutorialDone` status, ensuring correct tutorials for new levels and recaps.
-   **Robust Game Initialization**: Refactored game startup logic to prevent double increments of `state.currentLevel` and ensure correct display of success/game over overlays, eliminating lag and state inconsistencies upon returning from tutorials or main menu.

## Backend & Persistence

### 1. Database Integration
- **Database**: PostgreSQL (Running on port `4000`).
- **ORM**: TypeORM with NestJS.
- **Persistence Logic**:
  - Each user is assigned a unique `userId` (generated via `crypto.randomUUID()`) saved in `localStorage`.
  - Frontend automatically syncs `highScore`, `currentLevel`, and `tutorialDone` status to the backend whenever progress changes.
  - On application startup, the frontend fetches the latest progress from PostgreSQL to ensure data consistency.

### 2. Technical Stack
- **NestJS**: Configured with `TypeOrmModule` and `ConfigModule`.
- **Environment**: Credentials managed via `backend/.env` (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME).

## Current Project Status
- [x] Full A-Z landmark extraction and robust NN training.
- [x] Selfie-mode perspective correction (X-axis un-mirroring).
- [x] Heart system and 12-level A-Z progression with recaps.
- [x] Integrated learning flow (Learn -> Play -> Recap).
- [x] **Backend Integration**: PostgreSQL persistence for high scores and levels.
- [x] Automatic canvas/video skeletal alignment and "BindingError" fixes.

## Next Steps
1.  **Sound Effects**: Add feedback sounds for correct gestures, life loss, and level success.
2.  **Leaderboard**: (Optional) Add a global top-10 leaderboard if a username system is implemented.
3.  **UI Polish**: Enhance the "Kamu Berhasil" and "Game Over" overlays with animations.

---
*Last Updated: Monday, April 20, 2026*
