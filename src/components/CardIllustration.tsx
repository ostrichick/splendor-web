import React from 'react';
import { GemColor } from '../engine/types';

interface CardIllustrationProps {
  tier: 1 | 2 | 3;
  gem: GemColor;
  className?: string;
}

export const CardIllustration: React.FC<CardIllustrationProps> = ({ tier, gem, className = '' }) => {
  // Tier 1: Mines, Pickaxes, Raw Crystal Veins
  if (tier === 1) {
    return (
      <svg
        viewBox="0 0 100 80"
        className={`w-full h-full opacity-35 drop-shadow-sm ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mountain / Cave cavern contour */}
        <path
          d="M5 75 L30 35 L45 50 L65 25 L95 75 Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Secondary cave layer */}
        <path
          d="M20 75 L45 42 L70 75 Z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Mine shaft beam */}
        <line x1="42" y1="42" x2="42" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="58" y1="42" x2="58" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="38" y1="52" x2="62" y2="52" stroke="currentColor" strokeWidth="1.5" />
        <line x1="38" y1="62" x2="62" y2="62" stroke="currentColor" strokeWidth="1.5" />
        {/* Pickaxe */}
        <path d="M48 20 Q54 16 64 22 L62 25 Q54 20 49 23 Z" fill="currentColor" />
        <line x1="54" y1="21" x2="40" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Sparkling crystals */}
        <polygon points="50,68 53,62 56,68 53,74" fill="currentColor" fillOpacity="0.8" />
        <polygon points="32,65 34,60 36,65 34,70" fill="currentColor" fillOpacity="0.7" />
        <polygon points="68,64 70,59 72,64 70,69" fill="currentColor" fillOpacity="0.7" />
      </svg>
    );
  }

  // Tier 2: Merchant Ships, Caravans, Trading Ports
  if (tier === 2) {
    return (
      <svg
        viewBox="0 0 100 80"
        className={`w-full h-full opacity-40 drop-shadow-sm ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sea waves */}
        <path
          d="M0 68 Q15 62 30 68 T60 68 T90 68 T100 68 L100 80 L0 80 Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M0 72 Q20 68 40 72 T80 72 T100 72"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Ship Hull */}
        <path
          d="M20 54 Q45 66 82 54 L76 63 Q48 70 24 63 Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Main Mast */}
        <line x1="50" y1="18" x2="50" y2="56" stroke="currentColor" strokeWidth="2" />
        {/* Front Mast */}
        <line x1="34" y1="28" x2="34" y2="56" stroke="currentColor" strokeWidth="1.5" />
        {/* Large Main Sail */}
        <path
          d="M51 22 Q68 28 65 48 L51 44 Z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        {/* Fore Sail */}
        <path
          d="M33 32 Q22 36 24 50 L33 48 Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Flag on top */}
        <path d="M50 18 L58 21 L50 24 Z" fill="currentColor" fillOpacity="0.8" />
        {/* Sun / Moon in horizon */}
        <circle cx="80" cy="24" r="9" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    );
  }

  // Tier 3: Grand Cathedrals, Guild Palaces, Royal Jewelry Showrooms
  return (
    <svg
      viewBox="0 0 100 80"
      className={`w-full h-full opacity-45 drop-shadow-sm ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Renaissance Palace facade */}
      {/* Central Dome */}
      <path
        d="M38 32 Q50 12 62 32 Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="50" y1="12" x2="50" y2="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="5" r="1.5" fill="currentColor" />

      {/* Main Building Base */}
      <rect
        x="22"
        y="32"
        width="56"
        height="44"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Left Tower */}
      <rect x="12" y="24" width="12" height="52" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="12,24 18,12 24,24" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />

      {/* Right Tower */}
      <rect x="76" y="24" width="12" height="52" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="76,24 82,12 88,24" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />

      {/* Grand Arch Entrance */}
      <path
        d="M42 76 V56 Q50 48 58 56 V76 Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Pillars / Windows */}
      <line x1="30" y1="36" x2="30" y2="66" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="70" y1="36" x2="70" y2="66" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="50" cy="40" r="4" stroke="currentColor" strokeWidth="1" />

      {/* Royal Crown or Gem on top */}
      <polygon points="50,22 47,26 50,27 53,26" fill="currentColor" />
    </svg>
  );
};
