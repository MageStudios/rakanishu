import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <div class="min-h-screen bg-obsidian">
      <header class="flex justify-center items-center h-full">
        <h1 class="text-blood-red text-4xl font-gothic">Welcome to the Ritual</h1>
      </header>
      <button class="bg-blood-red text-silver-mist px-4 py-2">Ritual</button>
    </div>
  );
};

export default App;
