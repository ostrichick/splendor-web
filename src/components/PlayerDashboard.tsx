import React from 'react';
import { DevelopmentCard, GEM_COLORS, Player, TokenType, TOKEN_TYPES } from '../engine/types';
import { getTotalTokenCount } from '../engine/rules';
import { TokenChip } from './TokenChip';
import { CardView } from './CardView';
import { GemIcon, GEM_THEMES } from './GemIcon';
import { Trophy, Bookmark, AlertCircle } from 'lucide-react';

interface PlayerDashboardProps {
  player: Player;
  isMyTurn: boolean;
  onBuyCard: (card: DevelopmentCard) => void;
  discardRequired?: number;
  onDiscardTokens?: (tokens: Partial<Record<TokenType, number>>) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  player,
  isMyTurn,
  onBuyCard,
  discardRequired,
  onDiscardTokens,
}) => {
  const totalTokens = getTotalTokenCount(player.tokens);
  const [selectedDiscards, setSelectedDiscards] = React.useState<Partial<Record<TokenType, number>>>({});

  // Handle discarding tokens
  const handleToggleDiscard = (type: TokenType) => {
    if (!discardRequired || (player.tokens[type] || 0) <= 0) return;
    const current = selectedDiscards[type] || 0;
    const next = current + 1;
    if (next > (player.tokens[type] || 0)) {
      setSelectedDiscards({ ...selectedDiscards, [type]: 0 });
    } else {
      setSelectedDiscards({ ...selectedDiscards, [type]: next });
    }
  };

  const totalSelectedDiscard = Object.values(selectedDiscards).reduce((sum, c) => sum + (c || 0), 0);

  return (
    <div
      className={`
        w-full bg-zinc-900/95 border-t-2 rounded-t-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl transition-all duration-200
        ${isMyTurn ? 'border-amber-500 shadow-[0_-5px_25px_rgba(245,158,11,0.25)]' : 'border-zinc-800'}
      `}
    >
      {/* Discard Warning Header (if in discard phase) */}
      {discardRequired !== undefined && discardRequired > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-600/80 flex items-center justify-between text-red-200 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span>
              토큰 10개 한도 초과! 버릴 토큰을 클릭하여 <strong>{discardRequired}개</strong>를 선택하세요.
              (현재 선택: {totalSelectedDiscard}/{discardRequired})
            </span>
          </div>
          {onDiscardTokens && (
            <button
              type="button"
              disabled={totalSelectedDiscard !== discardRequired}
              onClick={() => onDiscardTokens(selectedDiscards)}
              className={`
                px-3 py-1 rounded text-xs font-bold font-mono transition-all
                ${totalSelectedDiscard === discardRequired
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
              `}
            >
              버리기 확인
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Player Profile & Score Progress */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-zinc-100">
                {player.name}
              </span>
              {isMyTurn && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500 text-zinc-950 animate-pulse">
                  내 턴 (YOUR TURN)
                </span>
              )}
            </div>

            {/* Score & Progress towards 15 */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-amber-400 font-serif">
                <Trophy size={16} />
                <span className="text-xl sm:text-2xl font-black">{player.score}</span>
                <span className="text-xs text-zinc-400 font-mono">/ 15 pts</span>
              </div>
              <div className="w-24 sm:w-32 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.score / 15) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: My Inventory (Tokens & Bonuses) */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Tokens Tray */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>보유 토큰</span>
              <span className={totalTokens >= 10 ? 'text-red-400 font-bold' : ''}>
                {totalTokens} / 10
              </span>
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800">
              {TOKEN_TYPES.map((type) => {
                const count = player.tokens[type] || 0;
                const discardCount = selectedDiscards[type] || 0;

                return (
                  <div key={type} className="relative">
                    <TokenChip
                      type={type}
                      count={count}
                      size="sm"
                      onClick={
                        discardRequired && count > 0 ? () => handleToggleDiscard(type) : undefined
                      }
                      className={discardRequired && count > 0 ? 'cursor-pointer' : ''}
                    />
                    {discardCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center ring-1 ring-white">
                        -{discardCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permanent Discounts / Bonuses */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>영구 보너스 (카드 할인)</span>
              {Object.values(player.bonuses).reduce((a, b) => a + b, 0) > 0 && (
                <span className="text-emerald-400 font-bold">
                  총 -{Object.values(player.bonuses).reduce((a, b) => a + b, 0)}개 할인 적용 중
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800">
              {GEM_COLORS.map((gem) => {
                const count = player.bonuses[gem] || 0;
                const theme = GEM_THEMES[gem];

                return (
                  <div
                    key={gem}
                    className={`
                      w-8 h-8 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-xs
                      ${count > 0 ? `${theme.lightBg} ${theme.text}` : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}
                    `}
                    title={`${theme.name} 영구 할인 ${count}개`}
                  >
                    <GemIcon gem={gem} size={12} />
                    <span className="text-[10px] leading-tight">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Reserved Cards */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-sky-400">
              <Bookmark size={12} />
              예약한 카드
            </span>
            <span>{player.reservedCards.length} / 3</span>
          </div>

          <div className="flex items-center gap-2 min-h-[75px]">
            {player.reservedCards.length === 0 ? (
              <div className="text-zinc-600 text-xs font-mono italic py-2">
                예약된 카드 없음
              </div>
            ) : (
              player.reservedCards.map((card) => (
                <div key={card.id} className="scale-75 origin-top-left -mr-6">
                  <CardView
                    card={card}
                    player={player}
                    isReserved={true}
                    onBuy={onBuyCard}
                    disabled={!isMyTurn}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
