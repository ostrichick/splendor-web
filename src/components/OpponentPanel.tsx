import React, { useState } from 'react';
import { Player, GemColor, GEM_COLORS, TOKEN_TYPES, TokenType, DevelopmentCard, Noble } from '../engine/types';
import { getTotalTokenCount } from '../engine/rules';
import { GemIcon, GEM_THEMES } from './GemIcon';
import { Bot, User, Bookmark, Crown, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface OpponentPanelProps {
  players: Player[];
  activePlayerIndex: number;
  myPlayerId?: string;
  hoveredPlayerId?: string | null;
  onHoverPlayer?: (playerId: string | null) => void;
}

export const OpponentPanel: React.FC<OpponentPanelProps> = ({
  players,
  activePlayerIndex,
  myPlayerId,
  hoveredPlayerId,
  onHoverPlayer,
}) => {
  const [inspectCard, setInspectCard] = useState<DevelopmentCard | null>(null);
  const [inspectNoble, setInspectNoble] = useState<Noble | null>(null);

  // Filter out my own player (or in hotseat pass-and-play show all)
  const opponents = players.filter((p) => (myPlayerId ? p.id !== myPlayerId : true));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 w-full">
        {opponents.map((player) => {
          const playerIndex = players.findIndex((p) => p.id === player.id);
          const isActive = playerIndex === activePlayerIndex;
          const isHovered = hoveredPlayerId === player.id;
          const totalTokens = getTotalTokenCount(player.tokens);
          const totalBonuses = Object.values(player.bonuses).reduce((a, b) => a + b, 0);

          return (
            <div
              key={player.id}
              onMouseEnter={() => onHoverPlayer && onHoverPlayer(player.id)}
              onMouseLeave={() => onHoverPlayer && onHoverPlayer(null)}
              className={`
                group relative rounded-xl p-2.5 transition-all duration-200 backdrop-blur-md border flex flex-col justify-between gap-2 cursor-default
                ${isActive
                  ? 'bg-zinc-800/95 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
                  : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'}
                ${isHovered ? 'ring-2 ring-yellow-400 border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.35)] -translate-y-0.5 bg-zinc-850' : ''}
              `}
            >
              {/* 1. Header: Name, Role, Score & Nobles count badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {player.isAi ? (
                    <span className="p-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50" title="AI 플레이어">
                      <Bot size={13} />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50" title="인간 플레이어">
                      <User size={13} />
                    </span>
                  )}
                  <span className="font-bold text-xs truncate text-zinc-200">
                    {player.name}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 animate-pulse">
                      턴
                    </span>
                  )}
                </div>

                {/* Prestige Points & Acquired Nobles Badge */}
                <div className="flex items-center gap-1.5">
                  {player.nobles.length > 0 && (
                    <div
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-serif cursor-pointer hover:bg-amber-500/30"
                      title={`${player.name}님이 획득한 귀족 타일 ${player.nobles.length}개`}
                      onClick={() => setInspectNoble(player.nobles[0])}
                    >
                      <Crown size={12} className="text-amber-400" />
                      <span>{player.nobles.length}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-amber-950/70 border border-amber-600/50 rounded-md px-1.5 py-0.5">
                    <span className="text-sm font-black font-serif text-amber-300">
                      {player.score}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono">pts</span>
                  </div>
                </div>
              </div>

              {/* 2. Open Tokens Inventory (보유 보석 토큰 6종 전체 공개) */}
              <div className="bg-zinc-950/70 rounded-lg p-1.5 border border-zinc-800/60">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>보유 토큰 ({totalTokens}/10)</span>
                  {player.tokens.gold > 0 && (
                    <span className="text-amber-400 font-bold">
                      황금 {player.tokens.gold}개
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1 justify-items-center">
                  {TOKEN_TYPES.map((type) => {
                    const count = player.tokens[type] || 0;
                    const theme = GEM_THEMES[type];

                    return (
                      <div
                        key={type}
                        className={`
                          flex flex-col items-center justify-center w-full py-0.5 rounded text-[10px] font-mono font-bold
                          ${count > 0 ? `${theme.lightBg} ${theme.text} shadow-xs ring-1 ring-white/20` : 'bg-zinc-900/60 text-zinc-600'}
                        `}
                        title={`${theme.name} 토큰: ${count}개`}
                      >
                        <GemIcon gem={type} size={11} />
                        <span className="leading-none mt-0.5">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Permanent Bonuses (영구 할인 보너스) with Highlight on Hover */}
              <div className={`bg-zinc-950/70 rounded-lg p-1.5 border transition-colors ${isHovered ? 'border-amber-500/60 bg-amber-950/10' : 'border-zinc-800/60'}`}>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    {isHovered && <Sparkles size={10} className="text-amber-400" />}
                    영구 보너스
                  </span>
                  <span className={totalBonuses > 0 ? 'text-emerald-400 font-bold' : ''}>
                    총 -{totalBonuses}개 할인
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 justify-items-center">
                  {GEM_COLORS.map((gem) => {
                    const bonusCount = player.bonuses[gem] || 0;
                    const theme = GEM_THEMES[gem];

                    return (
                      <div
                        key={gem}
                        className={`
                          flex items-center justify-center gap-0.5 w-full py-0.5 rounded text-[10px] font-mono font-bold transition-all
                          ${bonusCount > 0 ? `${theme.lightBg} ${theme.text} ring-1 ring-white/30` : 'bg-zinc-900/40 text-zinc-600'}
                          ${isHovered && bonusCount > 0 ? 'scale-105 ring-2 ring-yellow-300' : ''}
                        `}
                        title={`${theme.name} 영구 보너스: ${bonusCount}개 보유`}
                      >
                        <GemIcon gem={gem} size={10} />
                        <span>{bonusCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Reserved Cards Slot (예약한 카드) */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                <div className="flex items-center gap-1 text-sky-400">
                  <Bookmark size={12} />
                  <span>예약 카드 ({player.reservedCards.length}/3)</span>
                </div>

                <div className="flex items-center gap-1">
                  {player.reservedCards.map((card, idx) => (
                    <button
                      key={card.id || idx}
                      type="button"
                      onClick={() => setInspectCard(card)}
                      className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700/60 text-sky-300 text-[10px] font-bold hover:bg-sky-900 transition-colors cursor-pointer flex items-center gap-0.5 shadow-xs"
                      title="클릭하여 예약 카드 상세 정보 확인"
                    >
                      <GemIcon gem={card.gem} size={10} />
                      <span>{card.points > 0 ? `${card.points}pt` : `T${card.tier}`}</span>
                    </button>
                  ))}
                  {player.reservedCards.length === 0 && (
                    <span className="text-zinc-600 text-[10px] italic">없음</span>
                  )}
                </div>
              </div>

              {/* Hover status hint banner */}
              {isHovered && (
                <div className="text-[9px] font-mono text-amber-300/90 text-center py-0.5 bg-amber-500/10 rounded border border-amber-500/30 animate-in fade-in duration-150">
                  💡 보드의 귀족 타일 진행도가 {player.name} 기준으로 표시됩니다
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inspect Reserved Card Modal */}
      {inspectCard && (
        <div
          onClick={() => setInspectCard(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-xs w-full flex flex-col gap-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Info size={14} /> 상대의 예약 카드 정보
              </span>
              <button
                type="button"
                onClick={() => setInspectCard(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center my-1">
              <div className="p-3 rounded-lg border border-zinc-600 bg-zinc-950 space-y-2 w-32 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold font-serif text-amber-300">{inspectCard.points}</span>
                  <div className="p-1 rounded bg-zinc-800">
                    <GemIcon gem={inspectCard.gem} size={16} />
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Tier {inspectCard.tier} 카드</div>
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-zinc-800">
                  {(Object.entries(inspectCard.cost) as [TokenType, number][])
                    .filter(([_, c]) => c > 0)
                    .map(([g, c]) => (
                      <div key={g} className="flex items-center gap-1 font-mono text-[10px] text-zinc-300">
                        <GemIcon gem={g} size={10} /> {c}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectCard(null)}
              className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-mono text-xs cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Inspect Noble Tile Modal (When clicking acquired noble badge) */}
      {inspectNoble && (
        <div
          onClick={() => setInspectNoble(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-amber-500/80 rounded-xl p-4 shadow-2xl max-w-xs w-full flex flex-col gap-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Crown size={14} className="text-amber-400" /> 획득한 귀족 타일 (+3점)
              </span>
              <button
                type="button"
                onClick={() => setInspectNoble(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3 rounded-lg border border-amber-600/60 bg-gradient-to-br from-amber-950/60 to-zinc-950 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black font-serif text-amber-300">{inspectNoble.points} pts</span>
                <span className="text-xs text-amber-400 font-mono">귀족 방문 완료</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">요구 보너스 조건:</div>
              <div className="flex flex-col gap-1">
                {(Object.entries(inspectNoble.requirements) as [GemColor, number][]).map(([gem, count]) => (
                  <div key={gem} className="flex items-center justify-between px-2 py-1 rounded bg-zinc-900 font-mono text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <GemIcon gem={gem} size={12} />
                      <span className="capitalize">{gem}</span>
                    </div>
                    <span className="text-amber-300 font-bold">{count}개 충족됨</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectNoble(null)}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded font-mono text-xs cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};
