import React from 'react';
import { DevelopmentCard, GemColor, Player } from '../engine/types';
import { canAffordCard, canReserveCard, getCardCostDeficit } from '../engine/rules';
import { GemIcon, GEM_THEMES } from './GemIcon';

interface CardViewProps {
  card: DevelopmentCard | null;
  player?: Player;
  isReserved?: boolean;
  onBuy?: (card: DevelopmentCard) => void;
  onReserve?: (card: DevelopmentCard) => void;
  disabled?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  player,
  isReserved = false,
  onBuy,
  onReserve,
  disabled = false,
}) => {
  if (!card) {
    // Empty card slot on the board
    return (
      <div className="w-[105px] h-[142px] sm:w-[115px] sm:h-[155px] rounded-lg border-2 border-dashed border-zinc-700/60 bg-zinc-900/30 flex items-center justify-center text-zinc-600 text-xs font-mono">
        EMPTY
      </div>
    );
  }

  const canAfford = player ? canAffordCard(player, card) : false;
  const canReserve = player && !isReserved ? canReserveCard(player).valid : false;
  const deficitInfo = player ? getCardCostDeficit(player, card) : null;

  // Background gradient based on tier
  const tierThemes = {
    1: 'from-emerald-950/90 via-zinc-900 to-zinc-950 border-emerald-800/60',
    2: 'from-amber-950/90 via-zinc-900 to-zinc-950 border-amber-700/60',
    3: 'from-indigo-950/90 via-zinc-900 to-zinc-950 border-indigo-700/60',
  };

  const gemTheme = GEM_THEMES[card.gem];

  return (
    <div
      className={`
        group relative w-[105px] h-[142px] sm:w-[115px] sm:h-[155px] rounded-lg p-2
        bg-gradient-to-b ${tierThemes[card.tier]}
        border-2 transition-all duration-200 flex flex-col justify-between select-none
        shadow-md shadow-black/40
        ${canAfford && !disabled ? 'ring-2 ring-amber-400/90 shadow-[0_0_12px_rgba(251,191,36,0.35)] -translate-y-0.5' : ''}
      `}
    >
      {/* Top Bar: Points & Gem Bonus */}
      <div className="flex items-start justify-between">
        {/* Prestige Points */}
        <div className="flex items-center">
          {card.points > 0 ? (
            <span className="text-xl sm:text-2xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif">
              {card.points}
            </span>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Permanent Bonus Gem Indicator */}
        <div
          className={`
            w-6 h-6 rounded-md bg-gradient-to-b ${gemTheme.bg} ${gemTheme.text}
            border border-white/40 flex items-center justify-center shadow-sm
          `}
          title={`${gemTheme.name} 보너스`}
        >
          <GemIcon gem={card.gem} size={15} />
        </div>
      </div>

      {/* Center illustration placeholder / Tier indicator dots */}
      <div className="flex items-center justify-center opacity-40 group-hover:opacity-20 transition-opacity">
        <div className="flex gap-1">
          {Array.from({ length: card.tier }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          ))}
        </div>
      </div>

      {/* Bottom: Cost Tokens Grid */}
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(card.cost) as [GemColor, number][])
            .filter(([_, cost]) => cost && cost > 0)
            .map(([costGem, cost]) => {
              const costTheme = GEM_THEMES[costGem];
              const deficit = deficitInfo?.deficits[costGem] || 0;
              const hasDeficit = deficit > 0;

              return (
                <div
                  key={costGem}
                  className={`
                    flex items-center gap-1 px-1 py-0.5 rounded text-[11px] font-bold font-mono
                    ${costTheme.lightBg} ${costTheme.text}
                    ${hasDeficit ? 'ring-1 ring-red-400/80' : ''}
                  `}
                  title={`${costTheme.name}: ${cost} 필요${hasDeficit ? ` (${deficit} 부족)` : ''}`}
                >
                  <GemIcon gem={costGem} size={11} />
                  <span>{cost}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Hover/Touch Action Overlay */}
      {!disabled && (onBuy || onReserve) && (
        <div className="absolute inset-0 rounded-lg bg-zinc-950/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 flex flex-col justify-center items-center gap-1.5 z-10">
          {onBuy && (
            <button
              type="button"
              disabled={!canAfford}
              onClick={(e) => {
                e.stopPropagation();
                if (canAfford) onBuy(card);
              }}
              className={`
                w-full py-1.5 px-2 rounded font-bold text-xs transition-colors
                ${canAfford
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-sm cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed text-[10px]'}
              `}
            >
              {canAfford ? '구매 (Buy)' : '보석 부족'}
            </button>
          )}

          {onReserve && canReserve && !isReserved && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReserve(card);
              }}
              className="w-full py-1.5 px-2 rounded font-semibold text-[11px] bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
            >
              예약 (Reserve)
            </button>
          )}

          {/* Missing tokens summary tooltip */}
          {deficitInfo && deficitInfo.totalDeficit > 0 && (
            <div className="text-[10px] text-zinc-400 text-center font-mono leading-tight">
              부족: {deficitInfo.totalDeficit}개
              {player && player.tokens.gold > 0 && (
                <span className="text-amber-400 block">황금 {player.tokens.gold}개 보유</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
