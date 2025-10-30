/**
 * Multiple Choice Activity Preview
 *
 * Shows a preview of how the multiple choice question will appear in the app
 */

'use client';

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { InstructionDisplay } from '../shared/InstructionDisplay';
import { getConfigValue } from '../shared/previewUtils';

export function MultipleChoicePreview({ instruction, config }: PreviewProps) {
  const question = getConfigValue(config, 'question', { en: '', ar: '' });
  const questionImage = getConfigValue(config, 'questionImage', '');
  const options = getConfigValue(config, 'options', []);
  const layout = getConfigValue(config, 'layout', 'grid');
  const mode = getConfigValue(config, 'mode', 'text');

  // Layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-2 gap-4 max-w-md';
      case 'horizontal':
        return 'flex flex-row gap-3 flex-wrap justify-center';
      case 'vertical':
        return 'flex flex-col gap-3 max-w-sm';
      default:
        return 'grid grid-cols-2 gap-4 max-w-md';
    }
  };

  return (
    <PreviewContainer variant="centered">
      <InstructionDisplay instruction={instruction} className="mb-6" />

      {/* Letter/Word or Image Display */}
      {(questionImage || question?.ar) && (
        <div className="text-center mb-8">
          {questionImage ? (
            <img
              src={questionImage}
              alt="Display"
              className="max-w-sm max-h-64 mx-auto"
            />
          ) : question?.ar && (
            <p className="text-8xl font-bold text-gray-800" dir="rtl">
              {question.ar}
            </p>
          )}
        </div>
      )}

      {/* Options */}
      <div className={getLayoutClasses()}>
        {options.map((option: any, index: number) => {
          const hasImage = !!option.image;
          const isCorrect = option.isCorrect;
          const bgColors = ['bg-amber-50', 'bg-emerald-50', 'bg-orange-50', 'bg-purple-50'];
          const bgColor = bgColors[index % bgColors.length];

          return (
            <div
              key={option.id || index}
              className={`
                ${bgColor} rounded-2xl p-4 border-2 border-gray-200
                flex flex-col items-center justify-center gap-2
                min-h-[140px] relative
                ${layout === 'grid' ? 'aspect-square' : ''}
              `}
            >
              {/* Correct answer indicator */}
              {isCorrect && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓
                </div>
              )}

              {/* Content based on mode */}
              {mode === 'image' && hasImage ? (
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={option.image}
                    alt={option.text?.ar || 'Option'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🖼️</span>';
                    }}
                  />
                </div>
              ) : mode === 'text' && option.text?.ar ? (
                <span className="text-4xl font-semibold text-gray-700" dir="rtl">
                  {option.text.ar}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Empty</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {options.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-sm">No options added yet</p>
          <p className="text-xs mt-1">Add options in the form above</p>
        </div>
      )}
    </PreviewContainer>
  );
}
