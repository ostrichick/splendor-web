import React, { useEffect, useState, useRef } from 'react';
import { ALL_CARDS } from './engine/data/cards';
import { ALL_NOBLES } from './engine/data/nobles';
import { computeBestAction } from './engine/ai';
import { applyAction, createInitialGameState, PlayerConfig } from './engine/game';
import { DevelopmentCard, GameAction, GameState, GemColor, Noble, TokenType } from './engine/types';
import { sound } from './audio/sound';
import { CardView } from './components/CardView';
import { NobleTile } from './components/NobleTile';
import { TokenBank } from './components/TokenBank';
import { OpponentPanel } from './components/OpponentPanel';
import { PlayerDashboard } from './components/PlayerDashboard';
import { LobbyModal } from './components/LobbyModal';
import { GameOverModal } from './components/GameOverModal';
import { MobileTabNav, type MobileTab } from './components/MobileTabNav';
import { TurnNotifier } from './utils/turnNotifier';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Layers, Sparkles, AlertTriangle, Bell } from 'lucide-react';
import type { Socket } from 'socket.io-client';

export function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedGems, setSelectedGems] = useState<GemColor[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showLobby, setShowLobby] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('market');

  // Online Multiplayer State
  const [onlineSocket, setOnlineSocket] = useState<Socket | null>(null);
  const [onlineMyPlayerId, setOnlineMyPlayerId] = useState<string | null>(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);

  // Hovered player to inspect opponent progress
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  // Track previous turn to trigger audio chimes
  const prevTurnRef = useRef<number | null>(null);
  const prevActivePlayerRef = useRef<number | null>(null);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Start new local game
  const handleStartGame = (playerConfigs: PlayerConfig[]) => {
    const initialState = createInitialGameState(playerConfigs);
    setGameState(initialState);
    setSelectedGems([]);
    setActionError(null);
    setOnlineSocket(null);
    setOnlineMyPlayerId(null);
    setOnlineRoomCode(null);
    setShowLobby(false);
    sound.playTurnStart();
  };

  // Start online game
  const handleOnlineGameStart = (
    socket: Socket,
    initialGameState: GameState,
    myPlayerId: string,
    roomCode: string
  ) => {
    setOnlineSocket(socket);
    setOnlineMyPlayerId(myPlayerId);
    setOnlineRoomCode(roomCode);
    setGameState(initialGameState);
    setSelectedGems([]);
    setActionError(null);
    setShowLobby(false);

    socket.on('game_updated', (updatedState: GameState) => {
      setGameState(updatedState);
    });

    socket.on('error_message', (msg: string) => {
      sound.playError();
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    });
  };

  // Execute an action on current state
  const handleExecuteAction = (action: GameAction) => {
    TurnNotifier.stop();
    if (!gameState) return;

    // If in online mode, forward to server
    if (onlineSocket) {
      onlineSocket.emit('send_action', action);
      setSelectedGems([]);
      return;
    }

    setActionError(null);
    const prevActivePlayer = gameState.players[gameState.activePlayerIndex];
    const prevNobleCount = prevActivePlayer.nobles.length;

    const result = applyAction(gameState, action);

    if (result.error) {
      sound.playError();
      setActionError(result.error);
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    // Play appropriate sound effect based on action outcome
    const updatedPlayer = result.state.players.find((p) => p.id === prevActivePlayer.id);
    const gainedNoble = updatedPlayer ? updatedPlayer.nobles.length > prevNobleCount : false;

    if (gainedNoble) {
      sound.playNoble();
    } else if (action.type === 'TAKE_DIFFERENT_TOKENS' || action.type === 'TAKE_SAME_TOKENS') {
      sound.playChip();
    } else if (action.type === 'BUY_CARD') {
      sound.playBuy();
    } else if (action.type === 'RESERVE_CARD') {
      sound.playReserve();
    }

    setGameState(result.state);
    setSelectedGems([]);
  };

  // Turn Change Auditory & Visual Alert Effect
  useEffect(() => {
    if (!gameState || gameState.phase === 'game_over') return;

    const activeIndex = gameState.activePlayerIndex;
    const activePlayer = gameState.players[activeIndex];
    const isHuman = onlineMyPlayerId
      ? activePlayer.id === onlineMyPlayerId
      : !activePlayer.isAi;

    if (prevActivePlayerRef.current !== null && prevActivePlayerRef.current !== activeIndex) {
      if (isHuman) {
        // My turn has arrived! Play distinct alert bell and browser notify
        sound.playTurnStart();
        TurnNotifier.notify(activePlayer.name);
      } else {
        // Switched to another player's turn
        sound.playTurnSwitch();
      }
    }

    prevActivePlayerRef.current = activeIndex;
    prevTurnRef.current = gameState.turnCount;
  }, [gameState?.activePlayerIndex, gameState?.turnCount, onlineMyPlayerId]);

  // Handle Token selection
  const handleToggleGemSelection = (gem: GemColor) => {
    if (!gameState) return;
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (activePlayer.isAi) return;

    // Check if clicking same gem twice
    if (selectedGems.length === 1 && selectedGems[0] === gem) {
      if ((gameState.tokenBank[gem] || 0) >= 4) {
        setSelectedGems([gem, gem]);
        return;
      }
    }

    if (selectedGems.includes(gem)) {
      setSelectedGems(selectedGems.filter((g) => g !== gem));
    } else {
      if (selectedGems.length >= 3) return;
      setSelectedGems([...selectedGems, gem]);
    }
  };

  const handleConfirmTakeTokens = () => {
    if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) {
      handleExecuteAction({
        type: 'TAKE_SAME_TOKENS',
        gem: selectedGems[0],
      });
    } else {
      handleExecuteAction({
        type: 'TAKE_DIFFERENT_TOKENS',
        gems: selectedGems,
      });
    }
  };

  // Handle card buy
  const handleBuyCard = (card: DevelopmentCard) => {
    handleExecuteAction({
      type: 'BUY_CARD',
      cardId: card.id,
    });
  };

  // Handle card reserve
  const handleReserveCard = (card: DevelopmentCard) => {
    handleExecuteAction({
      type: 'RESERVE_CARD',
      cardId: card.id,
    });
  };

  // Handle reserve top of deck
  const handleReserveDeck = (tier: 1 | 2 | 3) => {
    handleExecuteAction({
      type: 'RESERVE_CARD',
      fromTierDeck: tier,
    });
  };

  // Handle discarding tokens
  const handleDiscardTokens = (tokens: Partial<Record<TokenType, number>>) => {
    handleExecuteAction({
      type: 'DISCARD_TOKENS',
      tokens,
    });
  };

  // Handle selecting noble
  const handleSelectNoble = (noble: Noble) => {
    handleExecuteAction({
      type: 'SELECT_NOBLE',
      nobleId: noble.id,
    });
  };

  // AI Turn Execution Loop (Only in local mode; online mode AI is managed by server)
  useEffect(() => {
    if (!gameState || gameState.phase === 'game_over' || onlineSocket) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer.isAi) return;

    setIsAiThinking(true);

    // Natural thinking delay (800ms) to allow human player to follow the game flow
    const timer = setTimeout(() => {
      const bestAction = computeBestAction(gameState);
      if (bestAction) {
        handleExecuteAction(bestAction);
      }
      setIsAiThinking(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [gameState?.activePlayerIndex, gameState?.turnCount, gameState?.phase, onlineSocket]);

  if (showLobby || !gameState) {
    return <LobbyModal onStartGame={handleStartGame} onOnlineGameStart={handleOnlineGameStart} />;
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const humanPlayer = onlineMyPlayerId
    ? gameState.players.find((p) => p.id === onlineMyPlayerId) || activePlayer
    : gameState.players.find((p) => !p.isAi) || activePlayer;
  const isHumanTurn = onlineMyPlayerId
    ? activePlayer.id === onlineMyPlayerId
    : !activePlayer.isAi;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1017] via-[#111827] to-[#090d14] text-slate-100 flex flex-col justify-between select-none">
      {/* 1. Header Bar */}
      <header className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
              <Sparkles size={16} />
            </span>
            <span className="font-serif font-black tracking-wide text-lg bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              SPLENDOR
            </span>
          </div>
          {onlineRoomCode && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
              방 코드: {onlineRoomCode}
            </span>
          )}
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            Turn {gameState.turnCount}
          </span>
          {gameState.isFinalRound && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950 text-red-300 border border-red-700 animate-pulse">
              마지막 라운드!
            </span>
          )}
        </div>

        {/* Live Action Tracker Message */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/60 max-w-[320px] sm:max-w-lg truncate shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-zinc-200 font-mono truncate">
            {isAiThinking ? (
              <span className="text-amber-400 animate-pulse font-semibold">
                🤖 {activePlayer.name} 생각 중...
              </span>
            ) : (
              <span>{gameState.lastActionMessage}</span>
            )}
          </span>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="게임 룰 보기"
          >
            <HelpCircle size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowLobby(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="게임 리셋"
          >
            <RotateCcw size={14} />
            새 게임
          </button>
        </div>
      </header>

      {/* Error notification toast */}
      {actionError && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-950/95 border border-red-600 text-red-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Turn indicator banner if it's user's turn */}
      {isHumanTurn && !isAiThinking && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 py-1 px-4 text-center text-xs font-mono text-amber-300 flex items-center justify-center gap-2">
          <Bell size={13} className="text-amber-400 animate-bounce" />
          <span>당신의 차례입니다! 토큰을 가져오거나 카드를 구매/예약하세요.</span>
        </div>
      )}

      {/* 2. Main Game Viewport (Complete 1-Screen on Desktop, Tabbed on Mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-3 flex flex-col gap-2.5 justify-center pb-20 md:pb-3">
        {/* Opponents Full Public Inventory Dashboard */}
        <div className={mobileTab === 'opponents' ? 'block' : 'hidden md:block'}>
          <OpponentPanel
            players={gameState.players}
            activePlayerIndex={gameState.activePlayerIndex}
            myPlayerId={humanPlayer.id}
            hoveredPlayerId={hoveredPlayerId}
            onHoverPlayer={setHoveredPlayerId}
          />
        </div>

        {/* Hover Inspection Status Banner */}
        {hoveredPlayerId && (
          <div className="w-full bg-yellow-500/15 border border-yellow-500/50 rounded-xl py-1.5 px-4 text-center text-xs font-mono text-yellow-300 flex items-center justify-center gap-2 shadow-sm animate-in fade-in duration-150">
            <Sparkles size={14} className="text-yellow-400 animate-spin" />
            <span>
              <strong>{gameState.players.find((p) => p.id === hoveredPlayerId)?.name}</strong>님의 시점으로 귀족 달성도와 보너스 할인 현황을 미리보고 있습니다 (마우스를 떼면 복귀)
            </span>
          </div>
        )}

        {/* Board Arena: Nobles (Left) + Market Cards (Center) + Token Bank (Right) */}
        <div className={`items-center lg:items-start justify-center gap-3 sm:gap-4 my-auto ${
          mobileTab === 'market' ? 'flex flex-col lg:flex-row' : 'hidden md:flex flex-col lg:flex-row'
        }`}>
          {/* Nobles Column */}
          <div className="flex lg:flex-col flex-row gap-2 items-center justify-center flex-wrap">
            {gameState.nobles.map((noble) => (
              <NobleTile
                key={noble.id}
                noble={noble}
                player={hoveredPlayerId ? gameState.players.find((p) => p.id === hoveredPlayerId) || activePlayer : activePlayer}
                highlightedByHover={!!hoveredPlayerId}
                onSelect={handleSelectNoble}
                isSelectable={
                  gameState.phase === 'select_noble' &&
                  gameState.eligibleNobleIds?.includes(noble.id)
                }
              />
            ))}
          </div>

          {/* Development Cards Market (Tiers 3, 2, 1) */}
          <div className="flex flex-col gap-2 bg-zinc-950/50 p-2 sm:p-3 rounded-2xl border border-zinc-800/80 shadow-2xl overflow-x-auto max-w-full">
            {([3, 2, 1] as const).map((tier) => {
              const tierKey = `tier${tier}` as const;
              const cards = gameState.visibleCards[tierKey];
              const deckCount = gameState.decks[tierKey].length;

              return (
                <div key={tier} className="flex items-center gap-2 min-w-max">
                  {/* Deck Pile (Can be clicked to blind reserve) */}
                  <div
                    onClick={() =>
                      isHumanTurn && deckCount > 0 && handleReserveDeck(tier)
                    }
                    className={`
                      w-[70px] h-[142px] sm:w-[80px] sm:h-[155px] rounded-lg border-2 border-zinc-700/80 p-2
                      flex flex-col items-center justify-between transition-all select-none
                      ${tier === 3
                        ? 'bg-gradient-to-b from-indigo-900 to-indigo-950 border-indigo-500/50'
                        : tier === 2
                        ? 'bg-gradient-to-b from-amber-900 to-amber-950 border-amber-500/50'
                        : 'bg-gradient-to-b from-emerald-900 to-emerald-950 border-emerald-500/50'}
                      ${isHumanTurn && deckCount > 0 ? 'cursor-pointer hover:scale-105 shadow-lg' : 'opacity-60'}
                    `}
                    title={
                      deckCount > 0
                        ? `클릭하여 Tier ${tier} 덱 맨 위 카드 블라인드 예약`
                        : '덱이 소진되었습니다'
                    }
                  >
                    <span className="text-[11px] font-mono text-zinc-300 font-bold">
                      T{tier}
                    </span>
                    <div className="flex flex-col items-center gap-1">
                      <Layers size={18} className="text-zinc-400" />
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {deckCount}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono">예약</span>
                  </div>

                  {/* 4 Visible Market Cards */}
                  <div className="flex items-center gap-2">
                    {cards.map((card, idx) => (
                      <CardView
                        key={card ? card.id : `empty-${tier}-${idx}`}
                        card={card}
                        player={activePlayer}
                        onBuy={isHumanTurn ? handleBuyCard : undefined}
                        onReserve={isHumanTurn ? handleReserveCard : undefined}
                        disabled={!isHumanTurn || isAiThinking}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Token Bank Panel (Right) */}
          <div className="w-full lg:w-auto">
            <TokenBank
              bank={gameState.tokenBank}
              selectedGems={selectedGems}
              onToggleGem={handleToggleGemSelection}
              onConfirmTake={handleConfirmTakeTokens}
              onResetSelection={() => setSelectedGems([])}
              disabled={!isHumanTurn || isAiThinking}
            />
          </div>
        </div>
      </main>

      {/* 3. Bottom Player Dashboard */}
      <footer className={`w-full ${mobileTab === 'my-dashboard' ? 'block' : 'hidden md:block'}`}>
        <PlayerDashboard
          player={humanPlayer}
          isMyTurn={isHumanTurn && !isAiThinking}
          onBuyCard={handleBuyCard}
          discardRequired={
            gameState.phase === 'discard_tokens' && gameState.activePlayerIndex === gameState.players.findIndex(p => p.id === humanPlayer.id)
              ? gameState.discardRequiredCount
              : undefined
          }
          onDiscardTokens={handleDiscardTokens}
        />
      </footer>

      {/* Mobile Bottom Tab Navigator */}
      <MobileTabNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        opponentCount={gameState.players.length - 1}
      />

      {/* Game Over Modal */}
      {gameState.phase === 'game_over' && (
        <GameOverModal
          players={gameState.players}
          winnerIds={gameState.winnerIds}
          onPlayAgain={() => {
            const configs = gameState.players.map((p) => ({
              id: p.id,
              name: p.name,
              isAi: p.isAi,
              aiDifficulty: p.aiDifficulty,
            }));
            handleStartGame(configs);
          }}
          onMainMenu={() => setShowLobby(true)}
        />
      )}

      {/* Splendor Rules Quick Reference Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-base font-bold text-amber-300 font-serif">
                스플렌더 정식 게임 규칙 가이드
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-zinc-300 overflow-y-auto max-h-[60vh] pr-2">
              <div>
                <strong className="text-amber-400 block mb-1">1. 승리 조건</strong>
                어느 플레이어가 15점 이상을 달성하면 해당 라운드 마지막 플레이어까지 턴을 마치고 게임이 끝납니다. 동점일 경우 구매한 카드 수가 적은 사람이 승리합니다.
              </div>
              <div>
                <strong className="text-amber-400 block mb-1">2. 내 턴에 할 수 있는 액션 (1가지만 선택)</strong>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li><strong>서로 다른 보석 3개 가져오기</strong>: 뱅크에서 서로 다른 색상 3개 획득.</li>
                  <li><strong>같은 보석 2개 가져오기</strong>: 뱅크에 4개 이상 남아있는 보석만 가능.</li>
                  <li><strong>개발 카드 구매하기</strong>: 필요한 보석 토큰을 지불하고 카드 획득 (보너스 할인 적용).</li>
                  <li><strong>개발 카드 예약하기</strong>: 최대 3장까지 예약 가능하며, 뱅크에 황금(조커) 토큰이 있으면 1개 획득.</li>
                </ul>
              </div>
              <div>
                <strong className="text-amber-400 block mb-1">3. 정보 공개 원칙 (Open Information)</strong>
                스플렌더는 완전 공개 정보 게임입니다. 모든 플레이어의 <strong>보유 토큰 종류 및 수량</strong>, <strong>영구 보너스 수량</strong>, <strong>구매한 카드</strong>는 항상 투명하게 공개되어 서로의 전략을 파악할 수 있습니다.
              </div>
              <div>
                <strong className="text-amber-400 block mb-1">4. 토큰 보관 제한</strong>
                턴이 끝났을 때 보유 토큰(황금 포함)이 10개를 초과하면 10개가 될 때까지 버려야 합니다.
              </div>
              <div>
                <strong className="text-amber-400 block mb-1">5. 귀족 타일</strong>
                구매한 카드의 영구 보너스가 귀족 타일의 조건을 만족하면 즉시 방문하여 +3점을 얻습니다 (1턴에 최대 1명).
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
