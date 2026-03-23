import { createContext, useContext, JSX } from 'solid-js';
import { gameState } from '../state/gameState';

const LootContext = createContext({});

export function LootProvider(props: { children: JSX.Element }) {
  const gameLoot = gameState.lootDrops;

  return (
    <LootContext.Provider value={{ gameLoot }}>
      {props.children}
    </LootContext.Provider>
  );
}

export function useLootContext() {
  const context = useContext(LootContext);
  if (!context) {
    throw new Error('useLootContext must be used within LootProvider');
  }
  return context;
}