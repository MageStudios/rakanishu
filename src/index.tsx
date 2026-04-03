// src/index.tsx

import { createSignal, createEffect, onCleanup } from 'solid-js';
import { render } from 'solid-js/web';

// Import the GameShell component
import { GameShell } from './App';

// Define the Gothic UI theme
const theme = {
  background: '#0a0a0c',
  accent: '#4a0404',
  ironGray: '#1a1a1a',
  fontFamily: 'Serif, Monospace'
};

// Initialize game state (module-level)
import { gameState } from '../state/gameState';

// Start the game loop (ticker-driven)
createEffect(() => {
  const intervalId = setInterval(() => {
    // Advance game tick
    gameState.tick();
  }, 100); // Tick every 100ms

  onCleanup(() => {
    clearInterval(intervalId);
  });
});

// Render root component
const Root = () => {
  return (
    <div style={{ background: theme.background, color: '#e2dac2', "font-family": theme.fontFamily }}>
      <GameShell />
    </div>
  );
};

render(<Root />, document.getElementById('root')!);
