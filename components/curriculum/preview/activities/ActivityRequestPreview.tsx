'use client';

/**
 * Activity Request Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';

export function ActivityRequestPreview({ instruction, config }: PreviewProps) {
  const description = config.description || 'No description provided';
  const notes = config.notes || '';

  return (
    <PreviewContainer variant="centered">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <span className="text-4xl">💡</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Activity Request
          </h3>
          <p className="text-sm text-gray-500">
            This activity is not yet implemented
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-800 whitespace-pre-wrap">{description}</p>
          </div>

          {notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Implementation Notes</h4>
              <p className="text-blue-900 text-sm whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              ⚠️ This is a placeholder. Students will not be able to complete this activity until it's implemented.
            </p>
          </div>
        </div>
      </div>
    </PreviewContainer>
  );
}
