/**
 * Letter UI Components
 *
 * Reusable components for displaying Arabic letters in previews
 */

'use client';

/**
 * LetterSlot - Empty slot where a letter should be placed
 */
interface LetterSlotProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LetterSlot({ size = 'md' }: LetterSlotProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg`}
    />
  );
}

/**
 * LetterTile - Filled tile with a letter
 */
interface LetterTileProps {
  letter: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LetterTile({ letter, size = 'md', color }: LetterTileProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold shadow-sm`}
      dir="rtl"
      style={color ? { color } : undefined}
    >
      {letter}
    </div>
  );
}

/**
 * LetterBalloon - Floating balloon with a letter
 */
interface LetterBalloonProps {
  letter: string;
  color: string;
  animationDelay?: number;
}

export function LetterBalloon({ letter, color, animationDelay = 0 }: LetterBalloonProps) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        animation: `float ${2 + animationDelay * 0.5}s ease-in-out infinite`,
      }}
    >
      <div
        className="w-16 h-20 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg"
        style={{ backgroundColor: color }}
      >
        {letter}
      </div>
      <div className="w-0.5 h-8" style={{ backgroundColor: color }} />
    </div>
  );
}
