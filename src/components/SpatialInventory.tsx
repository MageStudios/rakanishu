import { For, createMemo, Component } from 'solid-js';
import { gameState, getItemColor } from '../state/gameState';

const SpatialInventory: Component = () => {
  const cols = 10;
  const rows = 4;

  // Reactively calculate placement visually (bypasses deep mutate reactivity issues of backend grid)
  const visualGrid = createMemo(() => {
    const grid = new Array(cols * rows).fill(null);
    for (const item of gameState.inventory) {
      if (item.type === 'rune') continue; // Skip runes to avoid bloating grid for the slice, or place them
      
      const w = item.w || 1;
      const h = item.h || 1;
      
      let placed = false;
      for (let y = 0; y <= rows - h; y++) {
        for (let x = 0; x <= cols - w; x++) {
           let overlap = false;
           for (let dy=0; dy<h; dy++) {
             for (let dx=0; dx<w; dx++) {
               if (grid[(y+dy)*cols + (x+dx)]) overlap = true;
             }
           }
           if (!overlap) {
             for (let dy=0; dy<h; dy++) {
               for (let dx=0; dx<w; dx++) {
                 grid[(y+dy)*cols + (x+dx)] = { id: item.id, item, isRoot: dy===0 && dx===0 };
               }
             }
             placed = true;
             break;
           }
        }
        if (placed) break;
      }
    }
    return grid;
  });

  return (
    <div class="panel p-4" style={{ "background-color": "#0a0a0a", "border": "1px solid #8a0000" }}>
      <h2 class="text-xl uppercase mb-4 tracking-widest" style={{ color: "#e2dac2" }}>Grid Inventory</h2>
      <div 
        style={{ 
          display: 'grid', 
          "grid-template-columns": `repeat(${cols}, 40px)`, 
          "grid-template-rows": `repeat(${rows}, 40px)`, 
          gap: "2px"
        }}
      >
        <For each={visualGrid()}>{(cell, i) => {
          if (!cell) {
             // Empty slot
             return <div style={{ "background-color": "#1a1a1a", border: "1px solid #333", width: '100%', height: '100%' }} />;
          }
          if (cell.isRoot) {
            const w = cell.item.w || 1;
            const h = cell.item.h || 1;
            return (
              <div 
                class="flex items-center justify-center p-1 text-center text-xs overflow-hidden"
                style={{
                  "grid-column": `span ${w}`,
                  "grid-row": `span ${h}`,
                  "background-color": getItemColor(cell.item),
                  color: "#0a0a0a",
                  border: "2px solid #000",
                  "font-weight": "bold",
                  "box-shadow": "inset 0 0 10px rgba(0,0,0,0.5)"
                }}
              >
                {cell.item.name}
              </div>
            );
          }
          // Display nothing for non-root spanned slots, CSS grid span covers them.
          return <span style={{ display: 'none' }} />;
        }}</For>
      </div>
    </div>
  );
}

export default SpatialInventory;
