import React from 'react';
import { GemColor, TokenType } from '../engine/types';

interface GemIconProps {
  gem: TokenType;
  className?: string;
  size?: number;
}

export const GEM_THEMES: Record<
  TokenType,
  { name: string; bg: string; border: string; text: string; lightBg: string; ring: string; hex: string }
> = {
  diamond: {
    name: '다이아몬드',
    bg: 'from-slate-100 to-slate-300',
    border: 'border-slate-300',
    text: 'text-slate-800',
    lightBg: 'bg-slate-200/90',
    ring: 'ring-slate-300',
    hex: '#e2e8f0',
  },
  sapphire: {
    name: '사파이어',
    bg: 'from-sky-400 to-blue-600',
    border: 'border-sky-300',
    text: 'text-white',
    lightBg: 'bg-sky-500/90',
    ring: 'ring-sky-400',
    hex: '#0ea5e9',
  },
  emerald: {
    name: '에메랄드',
    bg: 'from-emerald-400 to-emerald-700',
    border: 'border-emerald-300',
    text: 'text-white',
    lightBg: 'bg-emerald-500/90',
    ring: 'ring-emerald-400',
    hex: '#10b981',
  },
  ruby: {
    name: '루비',
    bg: 'from-rose-400 to-red-700',
    border: 'border-rose-300',
    text: 'text-white',
    lightBg: 'bg-rose-500/90',
    ring: 'ring-rose-400',
    hex: '#f43f5e',
  },
  onyx: {
    name: '오닉스',
    bg: 'from-zinc-700 to-zinc-950',
    border: 'border-zinc-500',
    text: 'text-white',
    lightBg: 'bg-zinc-800/90',
    ring: 'ring-zinc-500',
    hex: '#27272a',
  },
  gold: {
    name: '황금',
    bg: 'from-amber-300 to-yellow-600',
    border: 'border-yellow-200',
    text: 'text-amber-950',
    lightBg: 'bg-amber-400/90',
    ring: 'ring-amber-300',
    hex: '#f59e0b',
  },
};

export const GemIcon: React.FC<GemIconProps> = ({ gem, className = '', size = 18 }) => {
  switch (gem) {
    case 'diamond':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <path d="M6 3h12l5 7-11 12L1 10z" />
          <path d="M6 3l5 7-5 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M18 3l-5 7 5 12" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </svg>
      );
    case 'sapphire':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <path d="M12 2L2 8.5v7L12 22l10-6.5v-7z" />
        </svg>
      );
    case 'emerald':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <path d="M6 2h12l4 6-10 14L2 8z" />
        </svg>
      );
    case 'ruby':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <path d="M12 2l9 7-9 13L3 9z" />
        </svg>
      );
    case 'onyx':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M7 12a5 5 0 0 1 5-5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        </svg>
      );
    case 'gold':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`drop-shadow-sm ${className}`}
        >
          <circle cx="12" cy="12" r="9" />
          <polygon
            points="12,6 14,10 18,10.5 15,13.5 16,18 12,15.5 8,18 9,13.5 6,10.5 10,10"
            fill="#78350f"
          />
        </svg>
      );
  }
};
