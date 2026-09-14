import React from 'react';
import { TokenType } from '../engine/types';
import { GemIcon, GEM_THEMES } from './GemIcon';

interface TokenChipProps {
  type: TokenType;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCountBadge?: boolean;
  className?: string;
}

export const TokenChip: React.FC<TokenChipProps> = ({
  type,
  count,
  onClick,
  disabled = false,
  selected = false,
  size = 'md',
  showCountBadge = true,
  className = '',
}) => {
  const theme = GEM_THEMES[type];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 20,
    lg: 26,
  }[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled || !onClick}
        onClick={onClick}
        className={`
          ${sizeClasses}
          relative rounded-full font-bold flex items-center justify-center transition-all duration-150
          bg-gradient-to-b ${theme.bg} ${theme.text}
          border-2 ${theme.border}
          shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.5)]
          ${onClick && !disabled ? 'cursor-pointer hover:scale-105 active:scale-95 hover:brightness-110' : ''}
          ${disabled ? 'opacity-30 cursor-not-allowed grayscale-[40%]' : ''}
          ${selected ? 'ring-4 ring-yellow-400 scale-105 -translate-y-1 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}
        `}
      >
        {/* Inner concentric ring styling */}
        <div className="absolute inset-[3px] rounded-full border border-white/20 pointer-events-none flex items-center justify-center">
          <GemIcon gem={type} size={iconSizes} />
        </div>
      </button>

      {/* Count badge */}
      {showCountBadge && count !== undefined && (
        <span
          className={`
            absolute -bottom-1 -right-1 font-mono font-black rounded-full px-1.5 py-0.5 border
            ${count > 0 ? 'bg-zinc-900/90 text-white border-zinc-600 shadow-sm' : 'bg-red-900/80 text-red-200 border-red-700'}
            ${size === 'sm' ? 'text-[9px] min-w-[14px] leading-tight' : 'text-xs min-w-[18px]'}
            text-center
          `}
        >
          {count}
        </span>
      )}
    </div>
  );
};
