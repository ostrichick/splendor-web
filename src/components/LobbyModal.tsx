import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { PlayerConfig } from '../engine/game';
import { AIDifficulty, GameState } from '../engine/types';
import { Bot, Users, Globe, Sparkles, Trophy, Copy, Plus, Play, Check } from 'lucide-react';

interface LobbyModalProps {
  onStartGame: (players: PlayerConfig[]) => void;
  onOnlineGameStart?: (socket: Socket, initialGameState: GameState, myPlayerId: string, roomCode: string) => void;
}

interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isAi: boolean;
  aiDifficulty?: AIDifficulty;
}

interface RoomData {
  code: string;
  players: RoomPlayer[];
  status: string;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ onStartGame, onOnlineGameStart }) => {
  const [mode, setMode] = useState<'ai' | 'hotseat' | 'online'>('ai');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const [playerName, setPlayerName] = useState<string>('Player 1');

  // Online Multiplayer State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [joinSecretInput, setJoinSecretInput] = useState<string>('');
  const [roomJoinSecret, setRoomJoinSecret] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize Socket.io connection when switching to online mode
  useEffect(() => {
    if (mode === 'online' && !socket) {
      // Connect to local or current host socket server
      const envUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
      const serverUrl = envUrl || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);
      const newSocket = io(serverUrl, { autoConnect: true });

      newSocket.on('connect_error', () => {
        setOnlineError('멀티플레이 서버에 연결할 수 없습니다. (포트 3001 서버 실행 필요)');
      });

      newSocket.on('room_created', ({ joinSecret, playerId, room }: { joinSecret: string; playerId: string; room: RoomData }) => {
        setCurrentRoom(room);
        setRoomJoinSecret(joinSecret);
        setMyPlayerId(playerId);
        setOnlineError(null);
      });

      newSocket.on('room_joined', ({ playerId, room }: { playerId: string; room: RoomData }) => {
        setCurrentRoom(room);
        setRoomJoinSecret(null);
        setMyPlayerId(playerId);
        setOnlineError(null);
      });

      newSocket.on('room_updated', (room: RoomData) => {
        setCurrentRoom(room);
      });

      newSocket.on('error_message', (msg: string) => {
        setOnlineError(msg);
      });

      newSocket.on('game_started', (gameState: GameState) => {
        if (onOnlineGameStart && myPlayerId && currentRoom) {
          onOnlineGameStart(newSocket, gameState, myPlayerId, currentRoom.code);
        }
      });

      setSocket(newSocket);
    }
  }, [mode, socket, myPlayerId, currentRoom, onOnlineGameStart]);

  const handleStartLocal = () => {
    const configs: PlayerConfig[] = [];

    if (mode === 'ai') {
      configs.push({
        id: 'p1',
        name: playerName || 'Player 1',
        isAi: false,
      });

      for (let i = 1; i < playerCount; i++) {
        configs.push({
          id: `ai-${i}`,
          name: `AI 봇 ${i} (${aiDifficulty})`,
          isAi: true,
          aiDifficulty,
        });
      }
    } else {
      for (let i = 0; i < playerCount; i++) {
        configs.push({
          id: `p-${i + 1}`,
          name: `Player ${i + 1}`,
          isAi: false,
        });
      }
    }

    onStartGame(configs);
  };

  const handleCreateOnlineRoom = () => {
    if (!socket) return;
    setOnlineError(null);
    socket.emit('create_room', { playerName });
  };

  const handleJoinOnlineRoom = () => {
    if (!socket || !roomCodeInput.trim() || !joinSecretInput.trim()) return;
    setOnlineError(null);
    socket.emit('join_room', {
      roomCode: roomCodeInput.trim(),
      joinSecret: joinSecretInput.trim(),
      playerName,
    });
  };

  const handleAddAiToOnlineRoom = () => {
    if (!socket) return;
    socket.emit('add_ai', { difficulty: 'normal' });
  };

  const handleStartOnlineGame = () => {
    if (!socket) return;
    socket.emit('start_game');
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    const invitation = roomJoinSecret
      ? `${currentRoom.code} ${roomJoinSecret}`
      : currentRoom.code;
    navigator.clipboard.writeText(invitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = currentRoom?.players.find((p) => p.id === myPlayerId)?.isHost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-400 mb-1 border border-amber-500/20">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-serif">
            SPLENDOR WEB
          </h1>
          <p className="text-xs text-zinc-400">
            반응이 빠르고 직관적인 웹 보드게임 스플렌더
          </p>
        </div>

        {/* Mode Selector Tabs (AI / Hotseat / Online) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMode('ai');
              setCurrentRoom(null);
            }}
            className={`
              flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${mode === 'ai'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'}
            `}
          >
            <Bot size={15} />
            AI 대전
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('hotseat');
              setCurrentRoom(null);
            }}
            className={`
              flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${mode === 'hotseat'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'}
            `}
          >
            <Users size={15} />
            패스 앤 플레이
          </button>
          <button
            type="button"
            onClick={() => setMode('online')}
            className={`
              flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${mode === 'online'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'}
            `}
          >
            <Globe size={15} />
            온라인 룸
          </button>
        </div>

        {/* Nickname Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-zinc-400">플레이어 이름</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500"
            placeholder="Player 1"
          />
        </div>

        {/* Mode-specific content */}
        {mode !== 'online' ? (
          <div className="space-y-4">
            {/* Player Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">참가 인원수</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPlayerCount(count)}
                    className={`
                      py-2 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer
                      ${playerCount === count
                        ? 'bg-zinc-800 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'}
                    `}
                  >
                    {count}인 플레이
                  </button>
                ))}
              </div>
            </div>

            {/* AI Difficulty */}
            {mode === 'ai' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">AI 난이도</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setAiDifficulty(diff)}
                      className={`
                        py-2 rounded-lg font-mono font-bold text-xs uppercase border transition-all cursor-pointer
                        ${aiDifficulty === diff
                          ? 'bg-zinc-800 text-amber-300 border-amber-500 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'}
                      `}
                    >
                      {diff === 'easy' ? '초급' : diff === 'normal' ? '중급' : '고급 (견제)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartLocal}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              게임 시작 (START GAME)
            </button>
          </div>
        ) : (
          /* Online Multiplayer UI */
          <div className="space-y-4">
            {onlineError && (
              <div className="p-2 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono">
                {onlineError}
              </div>
            )}

            {!currentRoom ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleCreateOnlineRoom}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow cursor-pointer transition-all"
                >
                  새로운 방 만들기 (Create Room)
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-zinc-800 flex-1" />
                  <span className="text-[11px] text-zinc-500 font-mono">또는 방 코드로 입장</span>
                  <div className="h-px bg-zinc-800 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="8자리 방 코드"
                    className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm uppercase font-mono tracking-widest text-center"
                  />
                  <input
                    type="password"
                    maxLength={8}
                    value={joinSecretInput}
                    onChange={(e) => setJoinSecretInput(e.target.value.toUpperCase())}
                    placeholder="8자리 참가 비밀번호"
                    className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm uppercase font-mono tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={handleJoinOnlineRoom}
                    disabled={!roomCodeInput.trim() || !joinSecretInput.trim()}
                    className="col-span-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer transition-all border border-zinc-700"
                  >
                    참가
                  </button>
                </div>
              </div>
            ) : (
              /* Inside Room Lobby */
              <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">방 코드:</span>
                    <span className="text-lg font-black font-mono tracking-widest text-amber-400">
                      {currentRoom.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? '복사됨' : '초대 정보 복사'}
                  </button>
                </div>

                {isHost && roomJoinSecret && (
                  <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                    <span className="text-[11px] font-mono text-zinc-500">참가 비밀번호:</span>
                    <span className="text-sm font-black font-mono tracking-widest text-emerald-400">
                      {roomJoinSecret}
                    </span>
                  </div>
                )}

                {/* Player List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-zinc-500">참가자 ({currentRoom.players.length}/4)</span>
                  <div className="space-y-1">
                    {currentRoom.players.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {p.isAi ? <Bot size={14} className="text-indigo-400" /> : <Users size={14} className="text-emerald-400" />}
                          <span className="font-semibold text-zinc-200">{p.name}</span>
                          {p.id === myPlayerId && <span className="text-[10px] text-amber-400 font-mono">(나)</span>}
                        </div>
                        {p.isHost && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            방장
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Controls */}
                {isHost && (
                  <div className="pt-2 flex flex-col gap-2">
                    {currentRoom.players.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddAiToOnlineRoom}
                        className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                      >
                        <Plus size={14} />
                        빈자리에 AI 봇 추가
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={currentRoom.players.length < 2}
                      onClick={handleStartOnlineGame}
                      className={`
                        w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md
                        ${currentRoom.players.length >= 2
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                      `}
                    >
                      <Play size={16} />
                      게임 시작 (최소 2인)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
