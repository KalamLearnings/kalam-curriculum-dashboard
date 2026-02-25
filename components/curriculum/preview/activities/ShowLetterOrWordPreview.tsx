'use client';

/**
 * Show Letter or Word Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { useLetters } from '@/lib/hooks/useLetters';

// Helper to check if value is a LetterReference object
function isLetterReference(value: unknown): value is { letterId: string; form: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'letterId' in value &&
    'form' in value
  );
}

export function ShowLetterOrWordPreview({ instruction, config }: PreviewProps) {
  const contentType = config.contentType || 'letter';
  const { letters } = useLetters();

  // Resolve letter to display character
  const getDisplayLetter = (): string => {
    const letterValue = config.letter;
    if (!letterValue) return '—';

    // New format: LetterReference object
    if (isLetterReference(letterValue)) {
      const letterData = letters.find(l => l.id === letterValue.letterId);
      if (letterData) {
        const form = letterValue.form as 'isolated' | 'initial' | 'medial' | 'final';
        return letterData.forms?.[form] || letterData.letter;
      }
      return '—';
    }

    // Old format: string (letter character or letter ID)
    if (typeof letterValue === 'string') {
      // Check if it's a letter ID
      const letterData = letters.find(l => l.id === letterValue);
      if (letterData) {
        return letterData.letter;
      }
      // It's already a character
      return letterValue;
    }

    return '—';
  };

  return (
    <PreviewContainer variant="centered">
      {/* Main Content Display */}
      {contentType === 'image' && config.image ? (
        <img
          src={config.image}
          alt="Preview"
          className="max-w-full max-h-64 object-contain"
          style={{
            width: config.imageWidth ? `${config.imageWidth}px` : 'auto',
            height: config.imageHeight ? `${config.imageHeight}px` : 'auto',
          }}
        />
      ) : contentType === 'word' && config.word ? (
        <div className="text-6xl font-arabic text-gray-900" dir="rtl">
          {config.word}
        </div>
      ) : (
        <div className="text-9xl font-arabic text-gray-900" dir="rtl">
          {getDisplayLetter()}
        </div>
      )}
    </PreviewContainer>
  );
}
