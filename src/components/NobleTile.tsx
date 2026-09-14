import React from 'react';
import { GemColor, Noble, Player } from '../engine/types';
import { GemIcon, GEM_THEMES } from './GemIcon';
import { Crown, Check } from 'lucide-react';

interface NobleTileProps {
  noble: Noble;
  player?: Player; // Active or hovered player to show progress for
  onSelect?: (noble: Noble) => void;
  isSelectable?: boolean;
  highlightedByHover?: boolean;
}

export const NobleTile: React.FC<NobleTileProps> = ({
  noble,
  player,
  onSelect,
  isSelectable = false,
  highlightedByHover = false,
}) => {
  const reqEntries = Object.entries(noble.requirements) as [GemColor, number][];

  // Check how many requirements the player currently meets
  const isFulfilled = player
    ? reqEntries.every(([gem, req]) => (player.bonuses[gem] || 0) >= (req || 0))
    : false;

  // Calculate overall progress percentage
  const totalReq = reqEntries.reduce((sum, [_, count]) => sum + (count || 0), 0);
  const currentReq = reqEntries.reduce((sum, [gem, count]) => {
    return sum + Math.min(count || 0, player?.bonuses[gem] || 0);
  }, 0);
  const progressPercent = Math.min(100, Math.round((currentReq / totalReq) * 100));

  return (
    <div
      onClick={() => isSelectable && onSelect && onSelect(noble)}
      className={`
        relative w-[105px] min-h-[120px] sm:w-[115px] sm:min-h-[132px] rounded-xl p-2.5
        bg-gradient-to-br from-amber-950/80 via-stone-900 to-zinc-950
        border-2 shadow-xl shadow-black/60
        flex flex-col justify-between transition-all duration-200 select-none
        ${isSelectable ? 'ring-4 ring-amber-400 cursor-pointer animate-pulse scale-105 border-amber-400' : 'border-amber-700/60'}
        ${isFulfilled ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] ring-1 ring-amber-400/80' : ''}
        ${highlightedByHover ? 'scale-105 -translate-y-1 border-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.5)] ring-2 ring-yellow-400' : ''}
      `}
    >
      {/* Top Bar: 3 Points & Crown Title */}
      <div className="flex items-center justify-between pb-1 border-b border-amber-800/40">
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-serif drop-shadow-md leading-none">
            {noble.points}
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">pts</span>
        </div>

        <div className="flex items-center gap-0.5 text-amber-400 text-xs" title="귀족 타일 (조건 달성 시 자동 방문)">
          <Crown size={14} className="fill-amber-400/30 text-amber-300" />
        </div>
      </div>

      {/* Requirements List (Cleanly contained without overflow) */}
      <div className="flex flex-col gap-1.5 my-1.5">
        {reqEntries.map(([gem, count]) => {
          const theme = GEM_THEMES[gem];
          const playerBonus = player ? player.bonuses[gem] || 0 : 0;
          const met = playerBonus >= count;

          return (
            <div
              key={gem}
              className={`
                flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all
                ${theme.lightBg} ${theme.text}
                ${met ? 'ring-1 ring-white/70 shadow-xs' : 'opacity-85'}
              `}
              title={`${theme.name} 보너스 ${count}개 필요 (현재: ${playerBonus}/${count})`}
            >
              <div className="flex items-center gap-1.5">
                <GemIcon gem={gem} size={13} />
                <span>{count}</span>
              </div>

              <div className="flex items-center text-[10px]">
                {met ? (
                  <span className="flex items-center gap-0.5 text-emerald-100 bg-emerald-950/60 px-1 py-0.2 rounded font-mono font-black">
                    <Check size={10} strokeWidth={3} /> 달성
                  </span>
                ) : (
                  <span className="opacity-90 font-mono">
                    {playerBonus}/{count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Progress Bar (Shows how close active/hovered player is) */}
      {player && (
        <div className="w-full pt-1 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-0.5">
            <span className="truncate">{player.name} 진행</span>
            <span className={isFulfilled ? 'text-amber-300 font-bold' : ''}>
              {isFulfilled ? '방문 가능!' : `${progressPercent}%`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60">
            <div
              className={`h-full transition-all duration-300 ${
                isFulfilled
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse'
                  : 'bg-amber-600/80'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
