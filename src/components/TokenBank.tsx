import React from 'react';
import { GemColor, TokenType, GEM_COLORS } from '../engine/types';
import { canTakeDifferentTokens, canTakeSameTokens } from '../engine/rules';
import { TokenChip } from './TokenChip';
import { RotateCcw, Check } from 'lucide-react';

interface TokenBankProps {
  bank: Record<TokenType, number>;
  selectedGems: GemColor[];
  onToggleGem: (gem: GemColor) => void;
  onConfirmTake: () => void;
  onResetSelection: () => void;
  disabled?: boolean;
}

export const TokenBank: React.FC<TokenBankProps> = ({
  bank,
  selectedGems,
  onToggleGem,
  onConfirmTake,
  onResetSelection,
  disabled = false,
}) => {
  // Validate selection state
  let isValidTake = false;
  let validationMessage = '';

  if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) {
    const res = canTakeSameTokens(bank, selectedGems[0]);
    isValidTake = res.valid;
    validationMessage = res.reason || '동일 보석 2개 가져오기';
  } else if (selectedGems.length > 0) {
    const res = canTakeDifferentTokens(bank, selectedGems);
    isValidTake = res.valid;
    validationMessage = res.reason || `서로 다른 보석 ${selectedGems.length}개 가져오기`;
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          토큰 뱅크 (Bank)
        </h3>
        {selectedGems.length > 0 && (
          <button
            type="button"
            onClick={onResetSelection}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="선택 초기화"
          >
            <RotateCcw size={12} />
            취소
          </button>
        )}
      </div>

      {/* Gem Token Chips */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 justify-items-center">
        {GEM_COLORS.map((gem) => {
          const count = bank[gem] || 0;
          const isSelected = selectedGems.includes(gem);
          const isSelectable = !disabled && count > 0;

          return (
            <div key={gem} className="flex flex-col items-center gap-1">
              <TokenChip
                type={gem}
                count={count}
                size="md"
                selected={isSelected}
                disabled={!isSelectable}
                onClick={() => isSelectable && onToggleGem(gem)}
              />
            </div>
          );
        })}

        {/* Gold Token (Cannot be taken manually - only through reservation) */}
        <div className="flex flex-col items-center gap-1">
          <TokenChip
            type="gold"
            count={bank.gold || 0}
            size="md"
            disabled={true}
          />
        </div>
      </div>

      {/* Active Selection Tray & Action Button */}
      {selectedGems.length > 0 && (
        <div className="mt-1 pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">선택한 토큰:</span>
            <span className={isValidTake ? 'text-emerald-400 font-semibold' : 'text-amber-400 text-[11px]'}>
              {isValidTake ? '가져오기 가능' : validationMessage}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Tray Chips */}
            <div className="flex items-center gap-1.5 min-h-[32px]">
              {selectedGems.map((gem, index) => (
                <div
                  key={`${gem}-${index}`}
                  onClick={() => onToggleGem(gem)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title="클릭하여 제거"
                >
                  <TokenChip type={gem} size="sm" showCountBadge={false} />
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              disabled={!isValidTake || disabled}
              onClick={onConfirmTake}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all duration-150
                ${isValidTake && !disabled
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md cursor-pointer animate-pulse'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
              `}
            >
              <Check size={14} />
              가져오기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
