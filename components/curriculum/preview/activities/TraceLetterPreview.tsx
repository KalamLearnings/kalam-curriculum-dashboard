'use client';

/**
 * Trace Letter Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { InstructionDisplay } from '../shared/InstructionDisplay';
import { getConfigValue, ARABIC_DEFAULTS } from '../shared/previewUtils';

export function TraceLetterPreview({ instruction, config }: PreviewProps) {
  const letter = getConfigValue(
    config,
    'letter',
    getConfigValue(config, 'letterForm', ARABIC_DEFAULTS.letter)
  );

  return (
    <PreviewContainer variant="centered">
      <InstructionDisplay instruction={instruction} className="mb-8" />

      <div className="w-full max-w-xs h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-8xl text-gray-300 mb-4" dir="rtl">{letter}</p>
          <p className="text-xs text-gray-400">Trace area</p>
        </div>
      </div>
    </PreviewContainer>
  );
}
