/* @refresh reload */
// src/index.tsx

import { render } from 'solid-js/web';
import { createEffect, onCleanup } from 'solid-js';

import './index.css';
import App from './App';
import { tick } from './state/gameState';

const Root = () => {
  createEffect(() => {
    const intervalId = setInterval(() => {
      tick();
    }, 100);
    onCleanup(() => clearInterval(intervalId));
  });

  return <App />;
};

render(() => <Root />, document.getElementById('root')!);
