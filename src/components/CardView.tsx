import React from 'react';
import { DevelopmentCard, GemColor, Player, TokenType } from '../engine/types';
import { canAffordCard, canReserveCard, getCardCostDeficit, calculatePayment } from '../engine/rules';
import { GemIcon, GEM_THEMES } from './GemIcon';
import { CardIllustration } from './CardIllustration';
import { Sparkles, Check, Bookmark } from 'lucide-react';

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
      <div className="w-[108px] h-[150px] sm:w-[120px] sm:h-[165px] rounded-xl border-2 border-dashed border-zinc-700/50 bg-zinc-950/40 flex flex-col items-center justify-center text-zinc-600 text-xs font-mono select-none">
        <span className="opacity-40">빈 슬롯</span>
      </div>
    );
  }

  const canAfford = player ? canAffordCard(player, card) : false;
  const canReserve = player && !isReserved ? canReserveCard(player).valid : false;
  const deficitInfo = player ? getCardCostDeficit(player, card) : null;
  const paymentPlan = player && canAfford ? calculatePayment(player, card) : null;

  // Calculate total discount from player's permanent bonuses
  let totalOriginalCost = 0;
  let totalDiscount = 0;
  let totalEffectiveCost = 0;

  (Object.entries(card.cost) as [GemColor, number][]).forEach(([costGem, cost]) => {
    if (!cost || cost <= 0) return;
    totalOriginalCost += cost;
    const bonus = player?.bonuses[costGem] || 0;
    const discount = Math.min(cost, bonus);
    totalDiscount += discount;
    totalEffectiveCost += Math.max(0, cost - bonus);
  });

  const isCompletelyFree = player && totalOriginalCost > 0 && totalEffectiveCost === 0;

  // Theme styling based on card tier
  const tierThemes = {
    1: {
      border: 'border-emerald-700/60 hover:border-emerald-500',
      bg: 'from-emerald-950/90 via-zinc-900 to-zinc-950',
      tag: 'bg-emerald-950 text-emerald-300 border-emerald-700/50',
      accentText: 'text-emerald-400',
      name: 'Tier 1 광산',
    },
    2: {
      border: 'border-amber-700/60 hover:border-amber-500',
      bg: 'from-amber-950/90 via-zinc-900 to-zinc-950',
      tag: 'bg-amber-950 text-amber-300 border-amber-700/50',
      accentText: 'text-amber-400',
      name: 'Tier 2 무역',
    },
    3: {
      border: 'border-indigo-700/60 hover:border-indigo-500',
      bg: 'from-indigo-950/90 via-zinc-900 to-zinc-950',
      tag: 'bg-indigo-950 text-indigo-300 border-indigo-700/50',
      accentText: 'text-indigo-400',
      name: 'Tier 3 보석상',
    },
  }[card.tier];

  const gemTheme = GEM_THEMES[card.gem];

  return (
    <div
      className={`
        group relative w-[108px] h-[150px] sm:w-[120px] sm:h-[165px] rounded-xl p-2
        bg-gradient-to-b ${tierThemes.bg}
        border-2 ${tierThemes.border}
        transition-all duration-200 flex flex-col justify-between select-none
        shadow-lg shadow-black/50 overflow-hidden
        ${canAfford && !disabled ? 'ring-2 ring-amber-400/90 shadow-[0_0_16px_rgba(251,191,36,0.4)] -translate-y-0.5' : ''}
        ${isReserved ? 'border-sky-500/80 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : ''}
      `}
    >
      {/* Background Thematic Artwork / Illustration */}
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2 pointer-events-none">
        <CardIllustration tier={card.tier} gem={card.gem} className={gemTheme.text} />
      </div>

      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* 1. Top Bar: Prestige Points & Permanent Bonus Gem */}
      <div className="relative z-10 flex items-start justify-between">
        {/* Points display */}
        <div className="flex items-center">
          {card.points > 0 ? (
            <div className="flex items-baseline gap-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="text-xl sm:text-2xl font-black text-amber-200 font-serif leading-none">
                {card.points}
              </span>
            </div>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Discount Badge Notification (If card gets discount) */}
        {totalDiscount > 0 && (
          <div
            className={`
              text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm
              ${isCompletelyFree ? 'bg-emerald-500 text-zinc-950 ring-1 ring-white/60 animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'}
            `}
            title={`영구 보너스로 총 ${totalDiscount}개 보석 할인!`}
          >
            <Sparkles size={9} />
            <span>{isCompletelyFree ? '무료!' : `-${totalDiscount}`}</span>
          </div>
        )}

        {/* Permanent Gem Bonus Icon */}
        <div
          className={`
            w-6 h-6 rounded-md bg-gradient-to-b ${gemTheme.bg} ${gemTheme.text}
            border border-white/50 flex items-center justify-center shadow-md
          `}
          title={`${gemTheme.name} 영구 할인 보너스 (+1)`}
        >
          <GemIcon gem={card.gem} size={15} />
        </div>
      </div>

      {/* 2. Middle Spacer with subtle Tier Dots */}
      <div className="relative z-10 flex items-center justify-center py-1 opacity-50">
        <div className="flex gap-1 items-center">
          {Array.from({ length: card.tier }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400/80 shadow-xs" />
          ))}
        </div>
      </div>

      {/* 3. Bottom: Smart Cost Breakdown with Discount Affordance */}
      <div className="relative z-10 space-y-1">
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(card.cost) as [GemColor, number][])
            .filter(([_, cost]) => cost && cost > 0)
            .map(([costGem, cost]) => {
              const costTheme = GEM_THEMES[costGem];
              const playerBonus = player?.bonuses[costGem] || 0;
              const discount = Math.min(cost, playerBonus);
              const effectiveCost = Math.max(0, cost - playerBonus);
              const deficit = deficitInfo?.deficits[costGem] || 0;
              const hasDeficit = deficit > 0;

              return (
                <div
                  key={costGem}
                  className={`
                    flex items-center justify-between px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-all
                    ${costTheme.lightBg} ${costTheme.text}
                    ${effectiveCost === 0 ? 'ring-1 ring-emerald-300/80 brightness-110' : ''}
                    ${hasDeficit ? 'ring-1 ring-red-400/80' : ''}
                  `}
                  title={
                    discount > 0
                      ? `${costTheme.name}: 원래 ${cost}개 필요하나 보너스 ${discount}개 할인 적용 ➔ 실제 ${effectiveCost}개 필요`
                      : `${costTheme.name}: ${cost}개 필요`
                  }
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <GemIcon gem={costGem} size={11} />
                    {/* If discount applied, show strikethrough original cost */}
                    {discount > 0 && (
                      <span className="line-through opacity-60 text-[9px]">
                        {cost}
                      </span>
                    )}
                  </div>

                  {/* Effective Cost */}
                  <div className="flex items-center">
                    {effectiveCost === 0 ? (
                      <span className="text-[10px] text-emerald-200 flex items-center">
                        <Check size={11} />
                      </span>
                    ) : (
                      <span>{effectiveCost}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. Hover/Touch Action Overlay with Full Financial Breakdown */}
      {!disabled && (onBuy || onReserve) && (
        <div className="absolute inset-0 rounded-xl bg-zinc-950/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 flex flex-col justify-center items-center gap-1.5 z-20">
          {/* Discount Summary in Overlay */}
          {totalDiscount > 0 && (
            <div className="text-[10px] font-mono text-emerald-300 text-center flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              <Sparkles size={11} className="text-emerald-400" />
              <span>총 {totalDiscount}개 보석 할인 중!</span>
            </div>
          )}

          {/* Buy Button */}
          {onBuy && (
            <button
              type="button"
              disabled={!canAfford}
              onClick={(e) => {
                e.stopPropagation();
                if (canAfford) onBuy(card);
              }}
              className={`
                w-full py-1.5 px-2 rounded-lg font-bold text-xs transition-all shadow-md
                ${canAfford
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer animate-pulse'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed text-[11px]'}
              `}
            >
              {canAfford ? (isCompletelyFree ? '무료 구매!' : '구매 (Buy)') : '보석 부족'}
            </button>
          )}

          {/* Reserve Button */}
          {onReserve && canReserve && !isReserved && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReserve(card);
              }}
              className="w-full py-1.5 px-2 rounded-lg font-semibold text-[11px] bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
            >
              <Bookmark size={12} />
              예약 (Reserve)
            </button>
          )}

          {/* Payment Plan or Missing Tokens Detail */}
          {canAfford && paymentPlan ? (
            <div className="text-[9px] text-zinc-300 font-mono text-center leading-tight mt-0.5">
              지불: 토큰 {Object.values(paymentPlan).reduce((a, b) => a + b, 0)}개
              {paymentPlan.gold > 0 && (
                <span className="text-amber-400 block font-bold">
                  (황금 조커 {paymentPlan.gold}개 포함)
                </span>
              )}
            </div>
          ) : (
            deficitInfo && deficitInfo.totalDeficit > 0 && (
              <div className="text-[10px] text-red-300 text-center font-mono leading-tight mt-0.5">
                부족: {deficitInfo.totalDeficit}개
                {player && player.tokens.gold > 0 && (
                  <span className="text-amber-400 block">
                    황금 {player.tokens.gold}개로 일부 대체 가능
                  </span>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
