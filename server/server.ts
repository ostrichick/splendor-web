import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import { createInitialGameState, applyAction, PlayerConfig } from '../src/engine/game';
import { computeBestAction } from '../src/engine/ai';
import { GameAction, GameState } from '../src/engine/types';

const app = express();
app.use(cors());

// Serve static assets from Vite build
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface RoomPlayer {
  id: string;
  name: string;
  socketId?: string;
  isHost: boolean;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
}

interface Room {
  code: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  status: 'lobby' | 'playing' | 'game_over';
}

const rooms: Map<string, Room> = new Map();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Check and trigger AI move if current player in game is AI
function checkAndRunAiMove(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room || !room.gameState || room.gameState.phase === 'game_over') return;

  const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
  if (!activePlayer.isAi) return;

  setTimeout(() => {
    const currentRoom = rooms.get(roomCode);
    if (!currentRoom || !currentRoom.gameState) return;

    const action = computeBestAction(currentRoom.gameState);
    if (action) {
      const result = applyAction(currentRoom.gameState, action);
      if (!result.error) {
        currentRoom.gameState = result.state;
        io.to(roomCode).emit('game_updated', currentRoom.gameState);
        checkAndRunAiMove(roomCode);
      }
    }
  }, 900);
}

io.on('connection', (socket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  // Create room
  socket.on('create_room', ({ playerName }: { playerName: string }) => {
    const roomCode = generateRoomCode();
    const playerId = `p_${socket.id.substring(0, 5)}`;

    const newRoom: Room = {
      code: roomCode,
      players: [
        {
          id: playerId,
          name: playerName || 'Host',
          socketId: socket.id,
          isHost: true,
          isAi: false,
        },
      ],
      gameState: null,
      status: 'lobby',
    };

    rooms.set(roomCode, newRoom);
    currentRoomCode = roomCode;
    currentPlayerId = playerId;
    socket.join(roomCode);

    socket.emit('room_created', {
      roomCode,
      playerId,
      room: newRoom,
    });
  });

  // Join room
  socket.on('join_room', ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('error_message', '방을 찾을 수 없습니다.');
      return;
    }

    if (room.status !== 'lobby') {
      socket.emit('error_message', '이미 게임이 진행 중인 방입니다.');
      return;
    }

    if (room.players.length >= 4) {
      socket.emit('error_message', '방 정원(최대 4인)이 찼습니다.');
      return;
    }

    const playerId = `p_${socket.id.substring(0, 5)}`;
    const newPlayer: RoomPlayer = {
      id: playerId,
      name: playerName || `Player ${room.players.length + 1}`,
      socketId: socket.id,
      isHost: false,
      isAi: false,
    };

    room.players.push(newPlayer);
    currentRoomCode = code;
    currentPlayerId = playerId;
    socket.join(code);

    socket.emit('room_joined', {
      roomCode: code,
      playerId,
      room,
    });

    io.to(code).emit('room_updated', room);
  });

  // Add AI Bot to room (Host only)
  socket.on('add_ai', ({ difficulty }: { difficulty: 'easy' | 'normal' | 'hard' }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'lobby' || room.players.length >= 4) return;

    const host = room.players.find((p) => p.socketId === socket.id && p.isHost);
    if (!host) return;

    const aiCount = room.players.filter((p) => p.isAi).length + 1;
    const aiPlayer: RoomPlayer = {
      id: `ai_${Date.now()}_${aiCount}`,
      name: `AI 봇 ${aiCount} (${difficulty})`,
      isHost: false,
      isAi: true,
      aiDifficulty: difficulty,
    };

    room.players.push(aiPlayer);
    io.to(currentRoomCode).emit('room_updated', room);
  });

  // Start game (Host only)
  socket.on('start_game', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.players.length < 2) {
      socket.emit('error_message', '게임을 시작하려면 최소 2명의 플레이어가 필요합니다.');
      return;
    }

    const host = room.players.find((p) => p.socketId === socket.id && p.isHost);
    if (!host) return;

    const playerConfigs: PlayerConfig[] = room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isAi: p.isAi,
      aiDifficulty: p.aiDifficulty,
    }));

    room.gameState = createInitialGameState(playerConfigs);
    room.status = 'playing';

    io.to(currentRoomCode).emit('game_started', room.gameState);
    checkAndRunAiMove(currentRoomCode);
  });

  // Player sends game action
  socket.on('send_action', (action: GameAction) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || !room.gameState || room.status !== 'playing') return;

    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    if (activePlayer.id !== currentPlayerId) {
      socket.emit('error_message', '당신의 턴이 아닙니다.');
      return;
    }

    const result = applyAction(room.gameState, action);
    if (result.error) {
      socket.emit('error_message', result.error);
      return;
    }

    room.gameState = result.state;
    if (room.gameState.phase === 'game_over') {
      room.status = 'game_over';
    }

    io.to(currentRoomCode).emit('game_updated', room.gameState);
    checkAndRunAiMove(currentRoomCode);
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    if (room.status === 'lobby') {
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(currentRoomCode);
      } else {
        if (!room.players.some((p) => p.isHost)) {
          room.players[0].isHost = true;
        }
        io.to(currentRoomCode).emit('room_updated', room);
      }
    }
  });
});

  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Splendor Fullstack Server running on port ${PORT}`);
  });
