import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../engine/types';
import { sound } from '../audio/sound';
import { Trophy, Award, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  players: Player[];
  winnerIds: string[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  winnerIds,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    // Play celebratory sound and launch confetti
    sound.playWin();

    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#0ea5e9', '#10b981', '#f43f5e', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Sort players by final rankings (score desc, card count asc)
  const rankedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.purchasedCards.length - b.purchasedCards.length;
  });

  const winners = players.filter((p) => winnerIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-zinc-900 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-300 ring-4 ring-amber-500/30">
            <Trophy size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif">
            {winners.map((w) => w.name).join(', ')} 승리!
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            스플렌더 게임이 종료되었습니다. 최종 점수 집계 결과입니다.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">순위</th>
                <th className="py-2.5 px-3">플레이어</th>
                <th className="py-2.5 px-3 text-right">점수</th>
                <th className="py-2.5 px-3 text-right">카드 수</th>
                <th className="py-2.5 px-3 text-right">귀족</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {rankedPlayers.map((player, index) => {
                const isWinner = winnerIds.includes(player.id);

                return (
                  <tr
                    key={player.id}
                    className={isWinner ? 'bg-amber-500/10 text-amber-200 font-bold' : 'text-zinc-300'}
                  >
                    <td className="py-3 px-3">
                      {index === 0 ? '🥇 1위' : index === 1 ? '🥈 2위' : index === 2 ? '🥉 3위' : `${index + 1}위`}
                    </td>
                    <td className="py-3 px-3 flex items-center gap-1.5">
                      {player.name}
                      {isWinner && <Award size={14} className="text-amber-400" />}
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black text-amber-300 font-serif">
                      {player.score}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-400">
                      {player.purchasedCards.length}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-400">
                      {player.nobles.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <RotateCcw size={16} />
            다시 하기
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-zinc-700"
          >
            <Home size={16} />
            메인 메뉴
          </button>
        </div>
      </div>
    </div>
  );
};
