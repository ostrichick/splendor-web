import { DevelopmentCard } from '../types';

export const ALL_CARDS: DevelopmentCard[] = [
  // --- TIER 1 (40 cards) ---
  // Diamond
  { id: 't1-d-1', tier: 1, gem: 'diamond', points: 0, cost: { sapphire: 1, emerald: 1, ruby: 1, onyx: 1 } },
  { id: 't1-d-2', tier: 1, gem: 'diamond', points: 0, cost: { sapphire: 1, emerald: 2, ruby: 1, onyx: 1 } },
  { id: 't1-d-3', tier: 1, gem: 'diamond', points: 0, cost: { sapphire: 2, ruby: 2, onyx: 1 } },
  { id: 't1-d-4', tier: 1, gem: 'diamond', points: 0, cost: { sapphire: 2, emerald: 2 } },
  { id: 't1-d-5', tier: 1, gem: 'diamond', points: 0, cost: { onyx: 3 } },
  { id: 't1-d-6', tier: 1, gem: 'diamond', points: 0, cost: { sapphire: 3 } },
  { id: 't1-d-7', tier: 1, gem: 'diamond', points: 0, cost: { ruby: 2, emerald: 1, onyx: 1, sapphire: 1 } },
  { id: 't1-d-8', tier: 1, gem: 'diamond', points: 1, cost: { sapphire: 4 } },

  // Sapphire
  { id: 't1-s-1', tier: 1, gem: 'sapphire', points: 0, cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1 } },
  { id: 't1-s-2', tier: 1, gem: 'sapphire', points: 0, cost: { diamond: 1, emerald: 1, ruby: 2, onyx: 1 } },
  { id: 't1-s-3', tier: 1, gem: 'sapphire', points: 0, cost: { diamond: 2, emerald: 2 } },
  { id: 't1-s-4', tier: 1, gem: 'sapphire', points: 0, cost: { emerald: 2, ruby: 2, onyx: 1 } },
  { id: 't1-s-5', tier: 1, gem: 'sapphire', points: 0, cost: { diamond: 3 } },
  { id: 't1-s-6', tier: 1, gem: 'sapphire', points: 0, cost: { onyx: 3 } },
  { id: 't1-s-7', tier: 1, gem: 'sapphire', points: 0, cost: { diamond: 1, ruby: 2, emerald: 1, onyx: 1 } },
  { id: 't1-s-8', tier: 1, gem: 'sapphire', points: 1, cost: { ruby: 4 } },

  // Emerald
  { id: 't1-e-1', tier: 1, gem: 'emerald', points: 0, cost: { diamond: 1, sapphire: 1, ruby: 1, onyx: 1 } },
  { id: 't1-e-2', tier: 1, gem: 'emerald', points: 0, cost: { diamond: 1, sapphire: 1, ruby: 1, onyx: 2 } },
  { id: 't1-e-3', tier: 1, gem: 'emerald', points: 0, cost: { sapphire: 2, ruby: 2 } },
  { id: 't1-e-4', tier: 1, gem: 'emerald', points: 0, cost: { diamond: 2, sapphire: 1, onyx: 2 } },
  { id: 't1-e-5', tier: 1, gem: 'emerald', points: 0, cost: { ruby: 3 } },
  { id: 't1-e-6', tier: 1, gem: 'emerald', points: 0, cost: { diamond: 3 } },
  { id: 't1-e-7', tier: 1, gem: 'emerald', points: 0, cost: { diamond: 2, sapphire: 1, ruby: 1, onyx: 1 } },
  { id: 't1-e-8', tier: 1, gem: 'emerald', points: 1, cost: { onyx: 4 } },

  // Ruby
  { id: 't1-r-1', tier: 1, gem: 'ruby', points: 0, cost: { diamond: 1, sapphire: 1, emerald: 1, onyx: 1 } },
  { id: 't1-r-2', tier: 1, gem: 'ruby', points: 0, cost: { diamond: 2, sapphire: 1, emerald: 1, onyx: 1 } },
  { id: 't1-r-3', tier: 1, gem: 'ruby', points: 0, cost: { diamond: 2, onyx: 2 } },
  { id: 't1-r-4', tier: 1, gem: 'ruby', points: 0, cost: { diamond: 1, emerald: 2, onyx: 2 } },
  { id: 't1-r-5', tier: 1, gem: 'ruby', points: 0, cost: { sapphire: 3 } },
  { id: 't1-r-6', tier: 1, gem: 'ruby', points: 0, cost: { emerald: 3 } },
  { id: 't1-r-7', tier: 1, gem: 'ruby', points: 0, cost: { diamond: 1, sapphire: 2, emerald: 1, onyx: 1 } },
  { id: 't1-r-8', tier: 1, gem: 'ruby', points: 1, cost: { diamond: 4 } },

  // Onyx
  { id: 't1-o-1', tier: 1, gem: 'onyx', points: 0, cost: { diamond: 1, sapphire: 1, emerald: 1, ruby: 1 } },
  { id: 't1-o-2', tier: 1, gem: 'onyx', points: 0, cost: { diamond: 1, sapphire: 2, emerald: 1, ruby: 1 } },
  { id: 't1-o-3', tier: 1, gem: 'onyx', points: 0, cost: { emerald: 2, ruby: 2 } },
  { id: 't1-o-4', tier: 1, gem: 'onyx', points: 0, cost: { sapphire: 2, emerald: 2, ruby: 1 } },
  { id: 't1-o-5', tier: 1, gem: 'onyx', points: 0, cost: { emerald: 3 } },
  { id: 't1-o-6', tier: 1, gem: 'onyx', points: 0, cost: { ruby: 3 } },
  { id: 't1-o-7', tier: 1, gem: 'onyx', points: 0, cost: { diamond: 1, sapphire: 1, emerald: 2, ruby: 1 } },
  { id: 't1-o-8', tier: 1, gem: 'onyx', points: 1, cost: { emerald: 4 } },

  // --- TIER 2 (30 cards) ---
  // Diamond
  { id: 't2-d-1', tier: 2, gem: 'diamond', points: 1, cost: { emerald: 3, ruby: 2, onyx: 2 } },
  { id: 't2-d-2', tier: 2, gem: 'diamond', points: 1, cost: { diamond: 2, sapphire: 3, ruby: 3 } },
  { id: 't2-d-3', tier: 2, gem: 'diamond', points: 2, cost: { ruby: 5 } },
  { id: 't2-d-4', tier: 2, gem: 'diamond', points: 2, cost: { sapphire: 4, emerald: 2, ruby: 1 } },
  { id: 't2-d-5', tier: 2, gem: 'diamond', points: 2, cost: { ruby: 5, onyx: 3 } },
  { id: 't2-d-6', tier: 2, gem: 'diamond', points: 3, cost: { diamond: 6 } },

  // Sapphire
  { id: 't2-s-1', tier: 2, gem: 'sapphire', points: 1, cost: { diamond: 2, emerald: 2, onyx: 3 } },
  { id: 't2-s-2', tier: 2, gem: 'sapphire', points: 1, cost: { sapphire: 2, emerald: 3, ruby: 3 } },
  { id: 't2-s-3', tier: 2, gem: 'sapphire', points: 2, cost: { sapphire: 5 } },
  { id: 't2-s-4', tier: 2, gem: 'sapphire', points: 2, cost: { diamond: 1, emerald: 4, ruby: 2 } },
  { id: 't2-s-5', tier: 2, gem: 'sapphire', points: 2, cost: { diamond: 5, sapphire: 3 } },
  { id: 't2-s-6', tier: 2, gem: 'sapphire', points: 3, cost: { sapphire: 6 } },

  // Emerald
  { id: 't2-e-1', tier: 2, gem: 'emerald', points: 1, cost: { diamond: 3, sapphire: 2, ruby: 2 } },
  { id: 't2-e-2', tier: 2, gem: 'emerald', points: 1, cost: { diamond: 3, emerald: 2, onyx: 3 } },
  { id: 't2-e-3', tier: 2, gem: 'emerald', points: 2, cost: { emerald: 5 } },
  { id: 't2-e-4', tier: 2, gem: 'emerald', points: 2, cost: { diamond: 4, sapphire: 2, onyx: 1 } },
  { id: 't2-e-5', tier: 2, gem: 'emerald', points: 2, cost: { sapphire: 5, emerald: 3 } },
  { id: 't2-e-6', tier: 2, gem: 'emerald', points: 3, cost: { emerald: 6 } },

  // Ruby
  { id: 't2-r-1', tier: 2, gem: 'ruby', points: 1, cost: { sapphire: 3, emerald: 2, onyx: 2 } },
  { id: 't2-r-2', tier: 2, gem: 'ruby', points: 1, cost: { diamond: 2, ruby: 2, onyx: 3 } },
  { id: 't2-r-3', tier: 2, gem: 'ruby', points: 2, cost: { onyx: 5 } },
  { id: 't2-r-4', tier: 2, gem: 'ruby', points: 2, cost: { sapphire: 1, emerald: 4, onyx: 2 } },
  { id: 't2-r-5', tier: 2, gem: 'ruby', points: 2, cost: { emerald: 5, ruby: 3 } },
  { id: 't2-r-6', tier: 2, gem: 'ruby', points: 3, cost: { ruby: 6 } },

  // Onyx
  { id: 't2-o-1', tier: 2, gem: 'onyx', points: 1, cost: { diamond: 2, sapphire: 3, emerald: 2 } },
  { id: 't2-o-2', tier: 2, gem: 'onyx', points: 1, cost: { sapphire: 3, ruby: 3, onyx: 2 } },
  { id: 't2-o-3', tier: 2, gem: 'onyx', points: 2, cost: { diamond: 5 } },
  { id: 't2-o-4', tier: 2, gem: 'onyx', points: 2, cost: { emerald: 1, ruby: 4, onyx: 2 } },
  { id: 't2-o-5', tier: 2, gem: 'onyx', points: 2, cost: { onyx: 5, diamond: 3 } },
  { id: 't2-o-6', tier: 2, gem: 'onyx', points: 3, cost: { onyx: 6 } },

  // --- TIER 3 (20 cards) ---
  // Diamond
  { id: 't3-d-1', tier: 3, gem: 'diamond', points: 3, cost: { sapphire: 3, emerald: 3, ruby: 5, onyx: 3 } },
  { id: 't3-d-2', tier: 3, gem: 'diamond', points: 4, cost: { ruby: 7 } },
  { id: 't3-d-3', tier: 3, gem: 'diamond', points: 4, cost: { diamond: 3, ruby: 6, onyx: 3 } },
  { id: 't3-d-4', tier: 3, gem: 'diamond', points: 5, cost: { diamond: 7, sapphire: 3 } },

  // Sapphire
  { id: 't3-s-1', tier: 3, gem: 'sapphire', points: 3, cost: { diamond: 3, emerald: 3, ruby: 3, onyx: 5 } },
  { id: 't3-s-2', tier: 3, gem: 'sapphire', points: 4, cost: { diamond: 7 } },
  { id: 't3-s-3', tier: 3, gem: 'sapphire', points: 4, cost: { diamond: 6, sapphire: 3, ruby: 3 } },
  { id: 't3-s-4', tier: 3, gem: 'sapphire', points: 5, cost: { sapphire: 7, emerald: 3 } },

  // Emerald
  { id: 't3-e-1', tier: 3, gem: 'emerald', points: 3, cost: { diamond: 5, sapphire: 3, ruby: 3, onyx: 3 } },
  { id: 't3-e-2', tier: 3, gem: 'emerald', points: 4, cost: { sapphire: 7 } },
  { id: 't3-e-3', tier: 3, gem: 'emerald', points: 4, cost: { sapphire: 6, emerald: 3, onyx: 3 } },
  { id: 't3-e-4', tier: 3, gem: 'emerald', points: 5, cost: { emerald: 7, ruby: 3 } },

  // Ruby
  { id: 't3-r-1', tier: 3, gem: 'ruby', points: 3, cost: { diamond: 3, sapphire: 5, emerald: 3, onyx: 3 } },
  { id: 't3-r-2', tier: 3, gem: 'ruby', points: 4, cost: { emerald: 7 } },
  { id: 't3-r-3', tier: 3, gem: 'ruby', points: 4, cost: { diamond: 3, emerald: 6, ruby: 3 } },
  { id: 't3-r-4', tier: 3, gem: 'ruby', points: 5, cost: { ruby: 7, onyx: 3 } },

  // Onyx
  { id: 't3-o-1', tier: 3, gem: 'onyx', points: 3, cost: { diamond: 3, sapphire: 3, emerald: 5, ruby: 3 } },
  { id: 't3-o-2', tier: 3, gem: 'onyx', points: 4, cost: { onyx: 7 } },
  { id: 't3-o-3', tier: 3, gem: 'onyx', points: 4, cost: { sapphire: 3, ruby: 3, onyx: 6 } },
  { id: 't3-o-4', tier: 3, gem: 'onyx', points: 5, cost: { onyx: 7, diamond: 3 } },
];
