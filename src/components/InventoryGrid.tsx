/* @refresh reload */
import { For } from "solid-js";
import { gameState } from "../state/gameState";
import { PLAYER_GRID } from "../logic/spatialInventory";
import { getItemColor } from "../state/gameState";

export default function InventoryGrid() {
  const cols = PLAYER_GRID.cols;
  const rows = PLAYER_GRID.rows;
  const cells = () => {
    const arr = [] as number[];
    for (let i = 0; i < cols * rows; i++) arr.push(i);
    return arr;
  };
  const placement = (x: number, y: number) => {
    const id = gameState.inventorySpatial.grid[y * cols + x];
    if (!id) return null;
    const item = gameState.inventory.find(i => i.id === id);
    return item ?? null;
  };
  return (
    <div class="grid" style={`grid-template-columns: repeat(${cols}, 2rem); grid-template-rows: repeat(${rows}, 2rem); gap: 0.25rem;`}>
      <For each={cells()}>{(i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        const item = placement(x, y);
        return (
          <div class="border border-gray-800 flex items-center justify-center" style={{"width": "2rem", "height": "2rem", "background": item ? getItemColor(item) : "transparent"}}>
            {item ? item.name[0] : ""}
          </div>
        );
      }}</For>
    </div>
  );
}
