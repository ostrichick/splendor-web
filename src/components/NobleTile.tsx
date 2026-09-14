import React from 'react';
import { GemColor, Noble, Player } from '../engine/types';
import { GemIcon, GEM_THEMES } from './GemIcon';

interface NobleTileProps {
  noble: Noble;
  player?: Player;
  onSelect?: (noble: Noble) => void;
  isSelectable?: boolean;
}

export const NobleTile: React.FC<NobleTileProps> = ({
  noble,
  player,
  onSelect,
  isSelectable = false,
}) => {
  // Check how many requirements the player currently meets
  const reqEntries = Object.entries(noble.requirements) as [GemColor, number][];
  const isFulfilled = player
    ? reqEntries.every(([gem, req]) => (player.bonuses[gem] || 0) >= (req || 0))
    : false;

  return (
    <div
      onClick={() => isSelectable && onSelect && onSelect(noble)}
      className={`
        relative w-24 h-24 sm:w-26 sm:h-26 rounded-lg p-2
        bg-gradient-to-br from-amber-950/70 via-stone-900 to-zinc-950
        border-2 border-amber-600/60 shadow-lg shadow-black/50
        flex flex-col justify-between transition-all duration-200 select-none
        ${isSelectable ? 'ring-4 ring-amber-400 cursor-pointer animate-pulse scale-105' : ''}
        ${isFulfilled ? 'border-amber-400/90 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : ''}
      `}
    >
      {/* Top Bar: 3 Points & Crown */}
      <div className="flex items-center justify-between">
        <span className="text-xl sm:text-2xl font-black text-amber-300 font-serif drop-shadow-md">
          {noble.points}
        </span>
        <span className="text-xs text-amber-500/80 uppercase font-mono tracking-wider">
          귀족
        </span>
      </div>

      {/* Requirements List */}
      <div className="flex flex-col gap-1">
        {reqEntries.map(([gem, count]) => {
          const theme = GEM_THEMES[gem];
          const playerBonus = player ? player.bonuses[gem] || 0 : 0;
          const met = playerBonus >= count;

          return (
            <div
              key={gem}
              className={`
                flex items-center justify-between px-1.5 py-0.5 rounded text-[11px] font-mono font-bold
                ${theme.lightBg} ${theme.text}
                ${player ? (met ? 'opacity-100 ring-1 ring-white/60' : 'opacity-70') : ''}
              `}
              title={`${theme.name} 보너스 ${count}개 필요 (현재: ${playerBonus})`}
            >
              <div className="flex items-center gap-1">
                <GemIcon gem={gem} size={11} />
                <span>{count}</span>
              </div>
              {player && (
                <span className="text-[9px] opacity-80">
                  {playerBonus}/{count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
