import { Noble } from '../types';

export const ALL_NOBLES: Noble[] = [
  {
    id: 'noble-1',
    points: 3,
    requirements: { diamond: 4, sapphire: 4 },
  },
  {
    id: 'noble-2',
    points: 3,
    requirements: { sapphire: 4, emerald: 4 },
  },
  {
    id: 'noble-3',
    points: 3,
    requirements: { emerald: 4, ruby: 4 },
  },
  {
    id: 'noble-4',
    points: 3,
    requirements: { ruby: 4, onyx: 4 },
  },
  {
    id: 'noble-5',
    points: 3,
    requirements: { diamond: 4, onyx: 4 },
  },
  {
    id: 'noble-6',
    points: 3,
    requirements: { diamond: 3, sapphire: 3, emerald: 3 },
  },
  {
    id: 'noble-7',
    points: 3,
    requirements: { sapphire: 3, emerald: 3, ruby: 3 },
  },
  {
    id: 'noble-8',
    points: 3,
    requirements: { emerald: 3, ruby: 3, onyx: 3 },
  },
  {
    id: 'noble-9',
    points: 3,
    requirements: { ruby: 3, onyx: 3, diamond: 3 },
  },
  {
    id: 'noble-10',
    points: 3,
    requirements: { onyx: 3, diamond: 3, sapphire: 3 },
  },
];
