/* @refresh reload */
import { Component } from "solid-js";
import InventoryGrid from "./components/InventoryGrid";
import Equipment from "./components/Equipment";
import CombatTickers from "./components/CombatTickers";
import Stash from "./components/Stash";
import LootLog from "./components/LootLog";

const App: Component = () => (
  <div class="flex min-h-screen w-full" style="background-color:#0a0a0a">
    {/* LEFT SIDEBAR — 25% */}
    <aside
      class="w-1/4 min-h-screen overflow-y-auto p-3 space-y-3"
      style="background-color:#0a0a0a;border-right:1px solid #8a0000"
    >
      <Stash />
      <InventoryGrid />
    </aside>

    {/* CENTER — 50% */}
    <main
      class="w-1/2 min-h-screen overflow-y-auto p-3 space-y-3"
      style="background-color:#0a0a0a"
    >
      <h1
        class="text-xl tracking-widest text-center py-4 uppercase"
        style="color:#e2dac2;border-bottom:1px solid #8a0000"
      >
        Rakanishu
      </h1>
      <CombatTickers />
    </main>

    {/* RIGHT SIDEBAR — 25% */}
    <aside
      class="w-1/4 min-h-screen overflow-y-auto p-3 space-y-3"
      style="background-color:#0a0a0a;border-left:1px solid #8a0000"
    >
      <Equipment />
      <LootLog />
    </aside>
  </div>
);

export default App;
