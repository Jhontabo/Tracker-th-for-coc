# TH17 Clash of Clans Tracker & Optimizer

This is a community-ready tool for TH17 players to track their progress and optimize their upgrade path.

## How to Run

### 1. Backend Setup
1. Go to the `backend` folder: `cd backend`
2. Get an API Key from the [Official Clash of Clans Developer Portal](https://developer.clashofclans.com/).
3. Create a `.env` file (or edit the existing one) and add your key:
   ```
   COC_API_KEY=your_key_here
   PORT=5000
   ```
4. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```

### 2. Frontend Setup
1. Go to the `frontend` folder: `cd frontend`
2. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Features
- **Profile Search:** Enter your player tag to see your current levels.
- **Progress Bars:** Visual representation of how close you are to Max TH17 for Heroes, Pets, and Troops.
- **Smart Optimizer:** Recommends which upgrade to prioritize next based on current progress.
- **Game-Inspired UI:** A premium look designed to feel like it belongs in the Clash universe.

## Security & Privacy
- Your API key is stored only on the backend and is never exposed to the frontend or other users.
- No player password or sensitive data is required; only the public player tag.
