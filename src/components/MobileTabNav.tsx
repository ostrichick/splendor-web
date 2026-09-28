import React from 'react';
import { ShoppingBag, Coins, Users } from 'lucide-react';

export type MobileTab = 'market' | 'my-dashboard' | 'opponents';

interface MobileTabNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  opponentCount: number;
}

export const MobileTabNav: React.FC<MobileTabNavProps> = ({
  activeTab,
  onSelectTab,
  opponentCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-3 shadow-2xl">
      <button
        onClick={() => onSelectTab('market')}
        className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'market'
            ? 'text-amber-400 font-semibold bg-amber-400/10'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        <span>마켓/귀족</span>
      </button>

      <button
        onClick={() => onSelectTab('my-dashboard')}
        className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'my-dashboard'
            ? 'text-emerald-400 font-semibold bg-emerald-400/10'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Coins className="w-4 h-4" />
        <span>내 토큰/카드</span>
      </button>

      <button
        onClick={() => onSelectTab('opponents')}
        className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'opponents'
            ? 'text-sky-400 font-semibold bg-sky-400/10'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Users className="w-4 h-4" />
          {opponentCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-slate-700 text-slate-300 text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {opponentCount}
            </span>
          )}
        </div>
        <span>상대 현황</span>
      </button>
    </div>
  );
};
