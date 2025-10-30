'use client';

/**
 * Show Letter or Word Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';

export function ShowLetterOrWordPreview({ instruction, config }: PreviewProps) {
  const contentType = config.contentType || 'letter';
  const content = contentType === 'letter' ? config.letter : config.word;

  return (
    <PreviewContainer variant="centered">
      {/* Main Content Display */}
      <div className="text-9xl font-arabic text-gray-900" dir="rtl">
        {content || '—'}
      </div>
    </PreviewContainer>
  );
}
