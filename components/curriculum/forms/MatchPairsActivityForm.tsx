/**
 * Match Pairs Activity Form
 *
 * Allows curriculum creators to define 2-4 pairs of items to match.
 * Each item can be a letter, word, or image.
 * Students draw lines to connect matching items.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, Checkbox } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { WordSelector } from '../WordSelector';
import { ImageUploader } from './ImageUploader';
import { useLetters } from '@/lib/hooks/useLetters';
import type {
  MatchPairsConfig,
  MatchPair,
  MatchItem,
  MatchItemType,
  LetterPosition,
} from '@/lib/types/activity-configs';
import type { LetterReference } from './ArabicLetterGrid';

// Item type options
const ITEM_TYPE_OPTIONS: { value: MatchItemType; label: string; icon: string }[] = [
  { value: 'letter', label: 'Letter', icon: 'ا' },
  { value: 'word', label: 'Word', icon: '📖' },
  { value: 'image', label: 'Image', icon: '🖼️' },
];

// Generate unique ID
const generatePairId = () => `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create default empty pair
const createEmptyPair = (): MatchPair => ({
  left: { type: 'letter', value: '' },
  right: { type: 'letter', value: '' },
});

interface MatchItemEditorProps {
  item: MatchItem;
  onChange: (item: MatchItem) => void;
  side: 'left' | 'right';
  pairIndex: number;
}

function MatchItemEditor({ item, onChange, side, pairIndex }: MatchItemEditorProps) {
  const { letters } = useLetters();

  const handleTypeChange = (type: MatchItemType) => {
    onChange({
      type,
      value: '',
      letterId: undefined,
      form: undefined,
      label: undefined,
    });
  };

  const handleLetterChange = (ref: LetterReference | LetterReference[] | null) => {
    if (!ref) {
      onChange({ ...item, value: '', letterId: undefined, form: undefined });
      return;
    }

    const letterRef = Array.isArray(ref) ? ref[0] : ref;
    const letterData = letters.find(l => l.id === letterRef.letterId);
    const displayChar = letterData?.forms?.[letterRef.form] || letterData?.letter || '';

    onChange({
      ...item,
      value: displayChar,
      letterId: letterRef.letterId,
      form: letterRef.form as LetterPosition,
    });
  };

  const handleWordChange = (word: string) => {
    onChange({ ...item, value: word });
  };

  const handleImageChange = (url: string) => {
    onChange({ ...item, value: url });
  };

  // Convert item to LetterReference for LetterSelector
  const getLetterRef = (): LetterReference | null => {
    if (item.type === 'letter' && item.letterId && item.form) {
      return { letterId: item.letterId, form: item.form };
    }
    return null;
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Type selector */}
      <div className="flex gap-1 mb-3">
        {ITEM_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleTypeChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
              item.type === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content editor based on type */}
      {item.type === 'letter' && (
        <LetterSelector
          value={getLetterRef()}
          onChange={handleLetterChange}
          showFormSelector={true}
        />
      )}

      {item.type === 'word' && (
        <WordSelector
          value={item.value}
          onChange={handleWordChange}
          label=""
          className="text-sm"
        />
      )}

      {item.type === 'image' && (
        <ImageUploader
          value={item.value}
          onChange={handleImageChange}
          folder="match-pairs"
        />
      )}

      {/* Optional label */}
      <div className="mt-2">
        <input
          type="text"
          placeholder="Optional label (for hints)"
          value={item.label || ''}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

interface PairEditorProps {
  pair: MatchPair;
  index: number;
  onChange: (pair: MatchPair) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function PairEditor({ pair, index, onChange, onRemove, canRemove }: PairEditorProps) {
  return (
    <div className="relative p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-200 transition-colors">
      {/* Pair header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Pair {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove pair"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Left and Right items */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Left Side
          </div>
          <MatchItemEditor
            item={pair.left}
            onChange={(left) => onChange({ ...pair, left })}
            side="left"
            pairIndex={index}
          />
        </div>

        {/* Connection indicator */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Right Side
          </div>
          <MatchItemEditor
            item={pair.right}
            onChange={(right) => onChange({ ...pair, right })}
            side="right"
            pairIndex={index}
          />
        </div>
      </div>
    </div>
  );
}

export function MatchPairsActivityForm({ config, onChange, topic }: BaseActivityFormProps<MatchPairsConfig>) {
  // Initialize pairs from config or create defaults
  const initialPairs: MatchPair[] = config?.pairs?.length > 0
    ? config.pairs
    : [createEmptyPair(), createEmptyPair()];

  const [pairs, setPairs] = useState<MatchPair[]>(initialPairs);
  const shuffleItems = config?.shuffleItems ?? true;

  // Sync pairs with config when it changes externally
  useEffect(() => {
    if (config?.pairs && JSON.stringify(config.pairs) !== JSON.stringify(pairs)) {
      setPairs(config.pairs);
    }
  }, [config?.pairs]);

  const updateConfig = (updates: Partial<MatchPairsConfig>) => {
    onChange({ ...config, pairs, ...updates });
  };

  const handlePairChange = (index: number, updatedPair: MatchPair) => {
    const newPairs = [...pairs];
    newPairs[index] = updatedPair;
    setPairs(newPairs);
    updateConfig({ pairs: newPairs });
  };

  const handleAddPair = () => {
    if (pairs.length >= 4) return;
    const newPairs = [...pairs, createEmptyPair()];
    setPairs(newPairs);
    updateConfig({ pairs: newPairs });
  };

  const handleRemovePair = (index: number) => {
    if (pairs.length <= 2) return;
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    updateConfig({ pairs: newPairs });
  };

  const handleShuffleChange = (shuffle: boolean) => {
    updateConfig({ shuffleItems: shuffle });
  };

  // Validate pairs
  const getValidationStatus = () => {
    const errors: string[] = [];

    pairs.forEach((pair, i) => {
      if (!pair.left.value) {
        errors.push(`Pair ${i + 1}: Left item is empty`);
      }
      if (!pair.right.value) {
        errors.push(`Pair ${i + 1}: Right item is empty`);
      }
    });

    return errors;
  };

  const validationErrors = getValidationStatus();

  return (
    <div className="space-y-6">
      {/* Header with pair count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Match Pairs ({pairs.length}/4)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Students draw lines to connect matching items
          </p>
        </div>

        {pairs.length < 4 && (
          <button
            type="button"
            onClick={handleAddPair}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Pair
          </button>
        )}
      </div>

      {/* Pairs list */}
      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <PairEditor
            key={index}
            pair={pair}
            index={index}
            onChange={(updatedPair) => handlePairChange(index, updatedPair)}
            onRemove={() => handleRemovePair(index)}
            canRemove={pairs.length > 2}
          />
        ))}
      </div>

      {/* Options */}
      <div className="pt-4 border-t border-gray-200">
        <Checkbox
          checked={shuffleItems}
          onChange={handleShuffleChange}
          label="Shuffle right-side items (prevents memorization of positions)"
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Incomplete pairs</p>
              <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview summary */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Preview:</strong> {pairs.length} pair{pairs.length !== 1 ? 's' : ''} to match.
          {' '}
          {pairs.filter(p => p.left.type === 'letter').length > 0 && 'Letters '}
          {pairs.filter(p => p.left.type === 'word' || p.right.type === 'word').length > 0 && 'Words '}
          {pairs.filter(p => p.left.type === 'image' || p.right.type === 'image').length > 0 && 'Images '}
          will be displayed on screen. Student draws lines to connect matching items.
        </p>
      </div>
    </div>
  );
}
