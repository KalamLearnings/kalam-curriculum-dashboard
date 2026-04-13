/**
 * Content With Cards Activity Form
 *
 * Features:
 * - Content display at top (letter, word, or image)
 * - 1-4 dynamic card options at bottom
 * - Interactive mode toggle (choice vs informational)
 * - Card mode toggle (text vs image)
 *
 * Uses shared components for clean, reusable code.
 */

import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import {
  OptionsGrid,
  OptionData,
  ContentType,
  LetterSelector,
} from './shared';
import { FormField } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { ImageLibraryModal } from './ImageLibraryModal';
import { cn } from '@/lib/utils';
import { useLetters } from '@/lib/hooks/useLetters';
import type { ContentWithCardsConfig, ContentWithCardsOption, LetterReference } from '@/lib/types/activity-configs';

// Generate unique ID for new options
const generateOptionId = (index: number) => `card_${index}_${Date.now()}`;

export function ContentWithCardsActivityForm({ config, onChange, topic }: BaseActivityFormProps<ContentWithCardsConfig>) {
  const contentType = config?.contentType || 'letter';
  // targetLetter is a LetterReference object that includes the form
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const word = config?.content?.word || '';
  const image = config?.content?.image || '';
  const cardMode = config?.cardMode || 'letter';
  const interactive = config?.interactive ?? true;

  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const { letters } = useLetters();

  // Helper to get letter display character from letterId and form
  const getLetterDisplay = (letterRef: LetterReference | undefined | null): string => {
    if (!letterRef) return '';
    const letterData = letters.find(l => l.id === letterRef.letterId);
    if (!letterData) return '?';
    if (letterData.forms && letterData.forms[letterRef.form]) {
      return letterData.forms[letterRef.form]!;
    }
    return letterData.letter;
  };

  // Initialize cards from config or create default (start with 2)
  const initialCards: ContentWithCardsOption[] = config?.cards?.length > 0
    ? config.cards
    : [
        { id: generateOptionId(0), text: '', isCorrect: false },
        { id: generateOptionId(1), text: '', isCorrect: false },
      ];

  const [cards, setCards] = useState<ContentWithCardsOption[]>(initialCards);

  const updateConfig = (updates: Partial<ContentWithCardsConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleContentTypeChange = (type: ContentType) => {
    updateConfig({
      contentType: type,
      targetLetter: type === 'letter' ? targetLetter : undefined,
      content: {
        word: type === 'word' ? word : undefined,
        image: type === 'image' ? image : undefined,
      },
    });
  };

  const handleUpdateCard = (index: number, field: 'text' | 'image' | 'isCorrect' | 'letter', value: any) => {
    const newCards = [...cards];
    if (field === 'text') {
      newCards[index].text = value;
    } else if (field === 'image') {
      newCards[index].image = value;
    } else if (field === 'isCorrect') {
      newCards[index].isCorrect = value;
    } else if (field === 'letter') {
      newCards[index].letter = value;
    }
    setCards(newCards);
    updateConfig({ cards: newCards });
  };

  const handleAddCard = () => {
    if (cards.length >= 4) return;
    const newCards = [...cards, { id: generateOptionId(cards.length), text: '', isCorrect: false }];
    setCards(newCards);
    updateConfig({ cards: newCards });
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) return;
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    updateConfig({ cards: newCards });
  };

  // Convert to OptionData for OptionsGrid
  const optionData: OptionData[] = cards.map((card) => ({
    id: card.id,
    text: card.text || '',
    letter: card.letter,
    letterDisplay: getLetterDisplay(card.letter),
    image: card.image,
    isCorrect: card.isCorrect,
  }));

  // Determine grid columns based on card count
  const getColumns = (): 2 | 3 | 4 => {
    if (cards.length <= 2) return 2;
    if (cards.length === 3) return 3;
    return 4;
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selector (same style as IntroActivityForm) */}
      <FormField label="Content Type" hint="Show a letter, word, or image" required>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleContentTypeChange('letter')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">أ</div>
            <div className="text-xs font-medium text-gray-600">Letter</div>
          </button>

          <button
            type="button"
            onClick={() => handleContentTypeChange('word')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'word'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">كلمة</div>
            <div className="text-xs font-medium text-gray-600">Word</div>
          </button>

          <button
            type="button"
            onClick={() => handleContentTypeChange('image')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'image'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-xs font-medium text-gray-600">Image</div>
          </button>
        </div>
      </FormField>

      {/* Content Display - Letter */}
      {contentType === 'letter' && (
        <FormField label="Letter" hint="Select letter and form to display" required>
          <LetterSelector
            value={targetLetter}
            onChange={(value) => updateConfig({ targetLetter: value as LetterReference | null })}
            topic={topic}
            showFormSelector={true}
          />
        </FormField>
      )}

      {/* Content Display - Word */}
      {contentType === 'word' && (
        <>
          <WordSelector
            value={word}
            onChange={(wordValue) => updateConfig({ content: { ...config?.content, word: wordValue } })}
            label="Word"
            required
          />
          {word && (
            <ActivityWordStatus
              words={[{ arabic: word }]}
            />
          )}
        </>
      )}

      {/* Content Display - Image */}
      {contentType === 'image' && (
        <FormField label="Image" hint="Image to display" required>
          {image ? (
            <div className="relative inline-block">
              <img
                src={image}
                alt="Display"
                className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowImageLibrary(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ content: { ...config?.content, image: '' } })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowImageLibrary(true)}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-full max-w-xs"
            >
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm text-gray-600">Click to select image</p>
            </button>
          )}
        </FormField>
      )}

      {/* Card Display Mode Selector (same style as Content Type) */}
      <div className="border-t pt-4">
        <FormField label="Card Display Mode" hint="What type of content to show on each card" required>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateConfig({ cardMode: 'letter' })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                cardMode === 'letter'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <div className="text-3xl font-arabic">أ</div>
              <div className="text-xs font-medium text-gray-600">Letter</div>
            </button>

            <button
              type="button"
              onClick={() => updateConfig({ cardMode: 'word' })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                cardMode === 'word'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <div className="text-3xl font-arabic">كلمة</div>
              <div className="text-xs font-medium text-gray-600">Word</div>
            </button>

            <button
              type="button"
              onClick={() => updateConfig({ cardMode: 'image' })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                cardMode === 'image'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs font-medium text-gray-600">Image</div>
            </button>
          </div>
        </FormField>
      </div>

      {/* Interactive Mode Toggle */}
      <div className="border-t pt-4">
        <FormField label="Activity Mode" hint="Interactive allows child to select answers, Informational is display-only">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={interactive}
                onChange={() => updateConfig({ interactive: true })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Interactive (Choice)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!interactive}
                onChange={() => updateConfig({ interactive: false })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Informational (Display Only)</span>
            </label>
          </div>
        </FormField>
      </div>

      {/* Cards Grid */}
      <OptionsGrid
        options={optionData}
        mode={cardMode}
        onUpdateOption={handleUpdateCard}
        title={`Cards (${cards.length}/4)`}
        showCorrectCheckbox={interactive}
        columns={getColumns()}
        allowAddRemove
        onAddOption={handleAddCard}
        onRemoveOption={handleRemoveCard}
        minOptions={1}
        maxOptions={4}
      />

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {interactive
          ? 'Mark at least one card as correct. Child will tap to select the right answer.'
          : 'Cards will be displayed without interaction. Activity auto-completes.'}
      </p>

      {/* Image Library Modal */}
      <ImageLibraryModal
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelectImage={(url: string) => {
          updateConfig({ content: { ...config?.content, image: url } });
          setShowImageLibrary(false);
        }}
        currentImage={image}
      />
    </div>
  );
}
