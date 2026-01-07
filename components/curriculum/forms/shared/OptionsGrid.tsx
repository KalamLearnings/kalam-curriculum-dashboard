/**
 * OptionsGrid Component
 *
 * A reusable grid container for displaying 1-4 option squares.
 * Handles dynamic layout based on option count and manages image modal state.
 * Used by MultipleChoiceActivityForm, ContentWithCardsActivityForm, etc.
 */

import React, { useState } from 'react';
import { OptionSquare, OptionSquareData } from './OptionSquare';
import { ImageLibraryModal } from '../ImageLibraryModal';

export interface OptionData extends OptionSquareData {
  id: string;
  text?: string;
  image?: string;
  isCorrect?: boolean;
}

interface OptionsGridProps {
  /** Array of options to display (1-4 items) */
  options: OptionData[];
  /** Display mode for all options */
  mode: 'text' | 'image';
  /** Called when an option is updated */
  onUpdateOption: (index: number, field: 'text' | 'image' | 'isCorrect', value: any) => void;
  /** Title displayed above the grid */
  title?: string;
  /** Whether to show correct answer checkboxes */
  showCorrectCheckbox?: boolean;
  /** Number of columns in the grid (default: 4) */
  columns?: 2 | 3 | 4;
  /** Whether options can be added/removed */
  allowAddRemove?: boolean;
  /** Called when add option is clicked */
  onAddOption?: () => void;
  /** Called when remove option is clicked */
  onRemoveOption?: (index: number) => void;
  /** Minimum number of options */
  minOptions?: number;
  /** Maximum number of options */
  maxOptions?: number;
}

export function OptionsGrid({
  options,
  mode,
  onUpdateOption,
  title = 'Options',
  showCorrectCheckbox = true,
  columns = 4,
  allowAddRemove = false,
  onAddOption,
  onRemoveOption,
  minOptions = 1,
  maxOptions = 4,
}: OptionsGridProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const openImagePicker = (index: number) => {
    setSelectedOptionIndex(index);
    setImageModalOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (selectedOptionIndex !== null) {
      onUpdateOption(selectedOptionIndex, 'image', url);
    }
    setImageModalOpen(false);
  };

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  const canAdd = allowAddRemove && options.length < maxOptions;
  const canRemove = allowAddRemove && options.length > minOptions;

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {allowAddRemove && (
          <div className="flex gap-2">
            {canAdd && (
              <button
                type="button"
                onClick={onAddOption}
                className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              >
                + Add Option
              </button>
            )}
          </div>
        )}
      </div>

      <div className={`grid ${getGridCols()} gap-3 max-w-2xl`}>
        {options.map((option, index) => (
          <div key={option.id} className="relative">
            <OptionSquare
              option={option}
              index={index}
              mode={mode}
              showCorrectCheckbox={showCorrectCheckbox}
              onToggleCorrect={(checked) => onUpdateOption(index, 'isCorrect', checked)}
              onUpdateText={(value) => onUpdateOption(index, 'text', value)}
              onOpenImagePicker={() => openImagePicker(index)}
              onClearImage={() => onUpdateOption(index, 'image', '')}
            />
            {canRemove && (
              <button
                type="button"
                onClick={() => onRemoveOption?.(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                title="Remove option"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Image Library Modal */}
      <ImageLibraryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelectImage={handleImageSelect}
        currentImage={selectedOptionIndex !== null ? options[selectedOptionIndex]?.image : undefined}
      />
    </div>
  );
}

export default OptionsGrid;
