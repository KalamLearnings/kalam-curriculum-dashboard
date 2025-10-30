'use client';

/**
 * Break Time Mini-Game Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';

export function BreakTimePreview({ instruction, config }: PreviewProps) {
  return (
    <PreviewContainer variant="centered" background="bg-gradient-to-b from-green-50 to-blue-50">
      <div className="text-6xl mb-6">🎮</div>
      <h2 className="text-2xl font-bold text-center">Break game</h2>
    </PreviewContainer>
  );
}
