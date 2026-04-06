/* @refresh reload */
import { Component } from 'solid-js';
import CombatTickers from './components/CombatTickers';

const App: Component = () => (
  <div class="min-h-screen p-4" style="background:#0a0a0a">
    <div class="max-w-2xl mx-auto space-y-3">
      <h1 class="text-xl tracking-widest" style="color:#e2dac2">Rakanishu</h1>
      <CombatTickers />
    </div>
  </div>
);

export default App;
