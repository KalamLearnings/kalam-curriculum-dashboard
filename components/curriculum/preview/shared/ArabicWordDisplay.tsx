/**
 * ArabicWordDisplay Component
 *
 * Reusable component for displaying Arabic words in connected or separated form
 */

'use client';

interface ArabicWordDisplayProps {
  word: string;
  /** Whether to split the word into individual letters (default: false for connected Arabic) */
  splitLetters?: boolean;
  highlightLetter?: string;
  highlightColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'text-4xl',
  md: 'text-5xl',
  lg: 'text-6xl',
  xl: 'text-7xl',
};

export function ArabicWordDisplay({
  word,
  splitLetters = false,
  highlightLetter,
  highlightColor = '#3B82F6',
  size = 'xl',
  className = '',
}: ArabicWordDisplayProps) {
  const renderWord = () => {
    // If we need to split letters (e.g., for individual letter highlighting)
    if (splitLetters) {
      return word.split('').map((letter: string, index: number) => {
        const isHighlighted = highlightLetter && letter === highlightLetter;

        return (
          <span
            key={index}
            style={{
              color: isHighlighted ? highlightColor : '#1F2937',
            }}
          >
            {letter}
          </span>
        );
      });
    }

    // Otherwise, show the connected form of the word
    const isHighlighted = highlightLetter && word.includes(highlightLetter);
    return (
      <span
        style={{
          color: isHighlighted ? highlightColor : '#1F2937',
        }}
      >
        {word}
      </span>
    );
  };

  return (
    <div className={`${SIZE_CLASSES[size]} ${className}`} dir="rtl">
      {renderWord()}
    </div>
  );
}
