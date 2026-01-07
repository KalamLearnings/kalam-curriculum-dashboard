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
  ModeToggle,
  TEXT_IMAGE_MODE_OPTIONS,
  ContentDisplayPicker,
  OptionsGrid,
  OptionData,
  ContentType,
} from './shared';
import { FormField } from './FormField';
import type { ContentWithCardsConfig, ContentWithCardsOption } from '@/lib/types/activity-configs';

// Content type options
const CONTENT_TYPE_OPTIONS = [
  { value: 'letter' as const, label: 'Letter', icon: '📝' },
  { value: 'word' as const, label: 'Word', icon: '📖' },
  { value: 'image' as const, label: 'Image', icon: '🖼️' },
];

// Generate unique ID for new options
const generateOptionId = (index: number) => `card_${index}_${Date.now()}`;

export function ContentWithCardsActivityForm({ config, onChange }: BaseActivityFormProps<ContentWithCardsConfig>) {
  const contentType = config?.contentType || 'letter';
  const letter = config?.content?.letter || '';
  const word = config?.content?.word || '';
  const image = config?.content?.image || '';
  const cardMode = config?.cardMode || 'text';
  const interactive = config?.interactive ?? true;

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
      content: {
        letter: type === 'letter' ? letter : undefined,
        word: type === 'word' ? word : undefined,
        image: type === 'image' ? image : undefined,
      },
    });
  };

  const handleUpdateCard = (index: number, field: 'text' | 'image' | 'isCorrect', value: any) => {
    const newCards = [...cards];
    if (field === 'text') {
      newCards[index].text = value;
    } else if (field === 'image') {
      newCards[index].image = value;
    } else if (field === 'isCorrect') {
      newCards[index].isCorrect = value;
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
      {/* Content Type Toggle */}
      <ModeToggle
        label="Content Display"
        value={contentType}
        options={CONTENT_TYPE_OPTIONS}
        onChange={handleContentTypeChange}
        borderBottom
      />

      {/* Content Display Picker */}
      <div className="space-y-4">
        <ContentDisplayPicker
          contentType={contentType}
          letter={letter}
          word={word}
          image={image}
          onLetterChange={(value) => updateConfig({ content: { ...config?.content, letter: value } })}
          onWordChange={(value) => updateConfig({ content: { ...config?.content, word: value } })}
          onImageChange={(url) => updateConfig({ content: { ...config?.content, image: url } })}
        />
      </div>

      {/* Card Mode Toggle */}
      <ModeToggle
        label="Card Display Mode"
        value={cardMode}
        options={TEXT_IMAGE_MODE_OPTIONS}
        onChange={(mode) => updateConfig({ cardMode: mode })}
        borderTop
      />

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
    </div>
  );
}
