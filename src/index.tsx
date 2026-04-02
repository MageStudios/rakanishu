// src/index.tsx

import { createSignal, createEffect, onCleanup } from 'solid-js';
import { render } from 'solid-js/web';

// Define the Gothic UI theme
const theme = {
  background: '#0a0a0c',
  accent: '#4a0404',
  ironGray: '#1a1a1a',
  fontFamily: 'Serif, Monospace'
};

// Create a signal for the count
const [count, setCount] = createSignal(0);

// Create an effect to update the count
createEffect(() => {
  console.log('Count updated:', count());
});

// Cleanup function for setInterval
let intervalId: number | null = null;

onCleanup(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// Set up an interval to update the count
intervalId = setInterval(() => {
  setCount(count() + 1);
}, 1000);

// Render the component
render(() => (
  <div style={{ background: theme.background, color: theme.accent, "font-family": theme.fontFamily, padding: '20px' }}>
    <h1>Gothic UI Example</h1>
    <p>Count: {count()}</p>
  </div>
), document.getElementById('root')!);
