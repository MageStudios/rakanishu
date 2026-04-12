import { For, Component } from 'solid-js';
import { gameState } from '../state/gameState';

const PartyRoster: Component = () => {
  return (
    <div class="panel p-4" style={{ "background-color": "#0a0a0a", "border": "1px solid #8a0000" }}>
      <h2 class="text-xl uppercase mb-4 tracking-widest" style={{ color: "#e2dac2", "border-bottom": "1px solid #8a0000" }}>
        Party Roster ({gameState.party.length}/8)
      </h2>
      <div class="flex flex-col gap-2">
        <For each={gameState.party}>{(id) => {
          if (id === 'player') {
             const hpPct = Math.max(0, Math.min(100, (gameState.player.hp / gameState.player.maxHp) * 100));
             return (
               <div class="flex flex-col gap-1">
                 <div class="flex justify-between text-xs" style={{ color: "#e2dac2" }}>
                   <span>Player (Lv. {gameState.player.level})</span>
                   <span>{Math.floor(gameState.player.hp)} / {gameState.player.maxHp} HP</span>
                 </div>
                 <div class="w-full h-2 bg-obsidian border border-blood-red">
                   <div class="h-full bg-blood-red transition-all duration-200" style={{ width: `${hpPct}%` }} />
                 </div>
               </div>
             );
          }

          const comp = (gameState as any).roster[id];
          if (!comp) return null;
          const hpPct = Math.max(0, Math.min(100, (comp.hp / comp.maxHp) * 100));
          
          return (
            <div class="flex flex-col gap-1 mt-2">
               <div class="flex justify-between text-xs" style={{ color: "#8a8a8a" }}>
                 <span>{comp.name}</span>
                 <span>{Math.floor(comp.hp)} / {comp.maxHp} HP</span>
               </div>
               <div class="w-full h-2 bg-obsidian border border-[#550000]">
                 <div class="h-full bg-[#cc0000] transition-all duration-200" style={{ width: `${hpPct}%` }} />
               </div>
            </div>
          );
        }}</For>
        
        {/* Render empty slots placeholders */}
        <For each={new Array(8 - gameState.party.length).fill(0)}>{(_, i) => (
           <div class="w-full h-4 border border-[#333] mt-2 flex items-center justify-center opacity-50" style={{ "background-color": "#111" }}>
             <span class="text-[10px]" style={{ color: "#555" }}>Empty Slot</span>
           </div>
        )}</For>
      </div>
    </div>
  );
}

export default PartyRoster;
