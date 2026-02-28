'use client';

/**
 * Show Letter or Word Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';

export function ShowLetterOrWordPreview({ instruction, config }: PreviewProps) {
  const contentType = config.contentType || 'letter';
  const { resolveWithForm } = useLetterResolver();

  // Resolve letter to display character (respects form if LetterReference)
  const displayLetter = resolveWithForm(config.letter, '—') || '—';

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
          {displayLetter}
        </div>
      )}
    </PreviewContainer>
  );
}
