import React, { useEffect, useCallback } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { cn } from '@/lib/utils';
import { useLetters } from '@/lib/hooks/useLetters';
import type { SoundBlendConfig, SoundSegment, SoundDuration, BlendSpeed, BlendContentType } from '@/lib/types/activity-configs';
import type { LetterReference } from './ArabicLetterGrid';

// Arabic diacritics (harakat)
const HARAKAT = new Set([
  '\u064B', // Fathatan
  '\u064C', // Dammatan
  '\u064D', // Kasratan
  '\u064E', // Fatha
  '\u064F', // Damma
  '\u0650', // Kasra
  '\u0651', // Shadda
  '\u0652', // Sukun
  '\u0653', // Maddah
  '\u0654', // Hamza Above
  '\u0655', // Hamza Below
  '\u0670', // Superscript Alef
]);

// Unicode values for specific diacritics
const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SUKUN = '\u0652';

// Madd letters
const ALEF = 'ا';
const WAW = 'و';
const YA = 'ي';

/**
 * Map base Arabic letters to their isolated presentation forms
 * Uses Unicode Arabic Presentation Forms-B (U+FE70-U+FEFF)
 */
const ISOLATED_FORMS: Record<string, string> = {
  'ا': 'ﺍ', // Alef
  'أ': 'ﺃ', // Alef with Hamza Above
  'إ': 'ﺇ', // Alef with Hamza Below
  'آ': 'ﺁ', // Alef with Madda
  'ب': 'ﺏ', // Ba
  'ت': 'ﺕ', // Ta
  'ث': 'ﺙ', // Tha
  'ج': 'ﺝ', // Jeem
  'ح': 'ﺡ', // Ha
  'خ': 'ﺥ', // Kha
  'د': 'ﺩ', // Dal
  'ذ': 'ﺫ', // Thal
  'ر': 'ﺭ', // Ra
  'ز': 'ﺯ', // Zay
  'س': 'ﺱ', // Seen
  'ش': 'ﺵ', // Sheen
  'ص': 'ﺹ', // Sad
  'ض': 'ﺽ', // Dad
  'ط': 'ﻁ', // Ta
  'ظ': 'ﻅ', // Dha
  'ع': 'ﻉ', // Ain
  'غ': 'ﻍ', // Ghain
  'ف': 'ﻑ', // Fa
  'ق': 'ﻕ', // Qaf
  'ك': 'ﻙ', // Kaf
  'ل': 'ﻝ', // Lam
  'م': 'ﻡ', // Meem
  'ن': 'ﻥ', // Noon
  'ه': 'ﻩ', // Ha
  'و': 'ﻭ', // Waw
  'ي': 'ﻱ', // Ya
  'ى': 'ﻯ', // Alef Maksura
  'ة': 'ﺓ', // Ta Marbuta
  'ء': 'ء', // Hamza (no change)
  'ئ': 'ﺉ', // Ya with Hamza
  'ؤ': 'ﺅ', // Waw with Hamza
};

/**
 * Convert a letter to its isolated form
 */
function toIsolatedForm(letter: string): string {
  return ISOLATED_FORMS[letter] || letter;
}

/**
 * Parse Arabic word into segments (letter + diacritics)
 */
function parseWordIntoSegments(word: string): { baseLetter: string; harakat: string }[] {
  const segments: { baseLetter: string; harakat: string }[] = [];
  const chars = [...word];

  let i = 0;
  while (i < chars.length) {
    const char = chars[i];

    // Skip if it's just a haraka
    if (HARAKAT.has(char)) {
      i++;
      continue;
    }

    // This is a base letter
    let harakat = '';
    let j = i + 1;

    // Collect any following harakat
    while (j < chars.length && HARAKAT.has(chars[j])) {
      harakat += chars[j];
      j++;
    }

    segments.push({ baseLetter: char, harakat });
    i = j;
  }

  return segments;
}

/**
 * Auto-detect duration for a segment based on Arabic phonics rules
 */
function detectDuration(
  segment: { baseLetter: string; harakat: string },
  isLast: boolean,
  nextSegment?: { baseLetter: string; harakat: string }
): SoundDuration {
  const { harakat } = segment;

  // Sukun = stop (1)
  if (harakat.includes(SUKUN)) {
    return 1;
  }

  // Word-final with no vowel = stop (1)
  if (isLast && !harakat) {
    return 1;
  }

  // Check for madd patterns (long = 3)
  if (nextSegment) {
    const nextLetter = nextSegment.baseLetter;
    // Fatha + Alef = madd
    if (harakat.includes(FATHA) && nextLetter === ALEF) {
      return 3;
    }
    // Damma + Waw = madd
    if (harakat.includes(DAMMA) && nextLetter === WAW) {
      return 3;
    }
    // Kasra + Ya = madd
    if (harakat.includes(KASRA) && nextLetter === YA) {
      return 3;
    }
  }

  // Default to short (2)
  return 2;
}

/**
 * Auto-detect segments from Arabic word
 * @param word - The Arabic word to parse
 * @param useIsolated - If true, convert letters to isolated forms (for slow mode)
 */
function autoDetectSegments(word: string, useIsolated: boolean = false): SoundSegment[] {
  if (!word) return [];

  const parsed = parseWordIntoSegments(word);
  const segments: SoundSegment[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const segment = parsed[i];
    const isLast = i === parsed.length - 1;
    const nextSegment = i < parsed.length - 1 ? parsed[i + 1] : undefined;

    const duration = detectDuration(segment, isLast, nextSegment);

    // For slow mode, use isolated letter forms; for fast mode, keep original
    const letter = useIsolated ? toIsolatedForm(segment.baseLetter) : segment.baseLetter;
    const sound = letter + segment.harakat;

    segments.push({ sound, duration });
  }

  return segments;
}

/**
 * Duration labels for display
 */
const DURATION_LABELS: Record<SoundDuration, { label: string; icon: string; color: string }> = {
  1: { label: 'Stop', icon: '●', color: 'bg-red-100 text-red-700 border-red-300' },
  2: { label: 'Short', icon: '▬', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  3: { label: 'Long', icon: '▬▬', color: 'bg-purple-100 text-purple-700 border-purple-300' },
};

export function SoundBlendActivityForm({ config, onChange, topic }: BaseActivityFormProps<SoundBlendConfig>) {
  const typedConfig = config as SoundBlendConfig;
  const { letters } = useLetters();

  const contentType: BlendContentType = typedConfig?.contentType || 'word';
  const word = typedConfig?.word || '';
  const segments = typedConfig?.segments || [];
  const speed: BlendSpeed = typedConfig?.speed || (contentType === 'letter' ? 'none' : 'slow');
  const requiredSlides = typedConfig?.requiredSlides || 2;
  const showBothSpeeds = typedConfig?.showBothSpeeds || false;
  const transliteration = typedConfig?.transliteration || '';
  const meaning = typedConfig?.meaning || '';

  const updateConfig = useCallback((updates: Partial<SoundBlendConfig>) => {
    onChange({ ...config, ...updates } as SoundBlendConfig);
  }, [config, onChange]);

  // Auto-detect segments when word changes
  useEffect(() => {
    if (word && segments.length === 0 && contentType === 'word') {
      const useIsolated = speed === 'slow';
      const detected = autoDetectSegments(word, useIsolated);
      if (detected.length > 0) {
        updateConfig({ segments: detected });
      }
    }
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-detect segments when speed changes (only for words)
  useEffect(() => {
    if (word && segments.length > 0 && contentType === 'word' && speed !== 'none') {
      const useIsolated = speed === 'slow';
      const detected = autoDetectSegments(word, useIsolated);
      updateConfig({ segments: detected });
    }
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContentTypeChange = (newContentType: BlendContentType) => {
    if (newContentType === 'letter') {
      // Switch to letter mode: clear word, set speed to 'none'
      updateConfig({
        contentType: newContentType,
        word: '',
        segments: [],
        speed: 'none',
      });
    } else {
      // Switch to word mode: set speed to 'slow' by default
      updateConfig({
        contentType: newContentType,
        word: '',
        segments: [],
        speed: 'slow',
      });
    }
  };

  const handleWordChange = (newWord: string) => {
    const useIsolated = speed === 'slow';
    const detected = autoDetectSegments(newWord, useIsolated);
    updateConfig({ word: newWord, segments: detected });
  };

  const handleLetterSelect = (ref: LetterReference | LetterReference[] | null) => {
    if (!ref || Array.isArray(ref)) return;

    const letterData = letters.find(l => l.id === ref.letterId);
    if (!letterData) return;

    // Get the letter form
    const letterChar = letterData.forms?.[ref.form] || letterData.letter;

    // For letters, create a single segment with short duration
    const segment: SoundSegment = {
      sound: letterChar,
      duration: 2, // Default to short for letters
    };

    updateConfig({
      word: letterChar,
      segments: [segment],
    });
  };

  const handleSegmentDurationChange = (index: number, duration: SoundDuration) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], duration };
    updateConfig({ segments: newSegments });
  };

  const handleRedetect = () => {
    const useIsolated = speed === 'slow';
    const detected = autoDetectSegments(word, useIsolated);
    updateConfig({ segments: detected });
  };

  // Get speed hint text
  const getSpeedHint = () => {
    switch (speed) {
      case 'slow':
        return 'Slow: Turtle slider for beginners';
      case 'fast':
        return 'Fast: Rabbit slider for advanced readers';
      case 'none':
        return 'No speed indicator (square slider)';
      default:
        return 'Select a speed mode';
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selector */}
      <FormField
        label="Content Type"
        hint="Choose whether to blend a single letter or a full word"
        required
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleContentTypeChange('letter')}
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-3 rounded-lg border-2 transition-all min-w-[120px]',
              contentType === 'letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <span className="text-2xl font-arabic">ب</span>
            <span className="font-medium">Letter</span>
          </button>
          <button
            type="button"
            onClick={() => handleContentTypeChange('word')}
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-3 rounded-lg border-2 transition-all min-w-[120px]',
              contentType === 'word'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <span className="text-2xl font-arabic">كلمة</span>
            <span className="font-medium">Word</span>
          </button>
        </div>
      </FormField>

      {/* Letter Selector (when contentType is letter) */}
      {contentType === 'letter' && (
        <FormField
          label="Select Letter"
          hint="Choose the letter to blend"
          required
        >
          <LetterSelector
            topic={topic}
            showFormSelector={true}
            value={null}
            onChange={handleLetterSelect}
          />
        </FormField>
      )}

      {/* Word Input (when contentType is word) */}
      {contentType === 'word' && (
        <FormField
          label="Arabic Word"
          hint="Enter the word to blend (with diacritics for best results)"
          required
        >
          <TextInput
            value={word}
            onChange={handleWordChange}
            placeholder="e.g., جَمَل"
            className="font-arabic text-2xl text-right"
            dir="rtl"
          />
        </FormField>
      )}

      {/* Segments Editor */}
      {segments.length > 0 && (
        <FormField
          label="Sound Segments"
          hint="Duration: Stop (dot), Short (small bar), Long (big bar)"
        >
          <div className="space-y-3">
            {/* Segment Cards */}
            <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                >
                  {/* Sound display */}
                  <span className="font-arabic text-2xl">{segment.sound}</span>

                  {/* Duration selector */}
                  <div className="flex gap-1">
                    {([1, 2, 3] as SoundDuration[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSegmentDurationChange(index, d)}
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded border transition-all',
                          segment.duration === d
                            ? DURATION_LABELS[d].color
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        )}
                        title={DURATION_LABELS[d].label}
                      >
                        {DURATION_LABELS[d].icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Re-detect button (only for words) */}
            {contentType === 'word' && (
              <button
                type="button"
                onClick={handleRedetect}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-detect durations
              </button>
            )}

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-600 border-t pt-3">
              <div className="flex items-center gap-1">
                <span className="text-red-600">●</span> Stop (sukun)
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600">▬</span> Short (voweled)
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-600">▬▬</span> Long (madd)
              </div>
            </div>
          </div>
        </FormField>
      )}

      {/* Speed Selector */}
      <FormField
        label="Reading Speed"
        hint={getSpeedHint()}
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ speed: 'none' })}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-2 transition-all min-w-[100px]',
              speed === 'none'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <div className="flex items-center gap-2">
              <span>⬜</span>
              <span className="font-medium">None</span>
            </div>
            <span className="text-xs text-gray-500">Square slider</span>
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ speed: 'slow' })}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-2 transition-all min-w-[100px]',
              speed === 'slow'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <div className="flex items-center gap-2">
              <span>🐢</span>
              <span className="font-medium">Slow</span>
            </div>
            <span className="text-xs text-gray-500">Turtle slider</span>
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ speed: 'fast' })}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-2 transition-all min-w-[100px]',
              speed === 'fast'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <div className="flex items-center gap-2">
              <span>🐇</span>
              <span className="font-medium">Fast</span>
            </div>
            <span className="text-xs text-gray-500">Rabbit slider</span>
          </button>
        </div>
      </FormField>

      {/* Required Slides */}
      <FormField
        label="Required Slides"
        hint="How many times must the child slide to complete"
      >
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={5}
            value={requiredSlides}
            onChange={(e) => updateConfig({ requiredSlides: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="w-8 text-center font-medium">{requiredSlides}</span>
        </div>
      </FormField>

      {/* Show Both Speeds Toggle */}
      <FormField
        label="Display Mode"
        hint="Show both turtle (slow) and rabbit (fast) sliders side by side"
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showBothSpeeds}
            onChange={(e) => updateConfig({ showBothSpeeds: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex flex-col">
            <span className="font-medium">Show both speeds side by side</span>
            <span className="text-sm text-gray-500">
              Displays turtle (slow) and rabbit (fast) sliders together
            </span>
          </div>
        </label>
        {showBothSpeeds && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> Both sliders will be shown - on tablets they appear side by side,
              on phones they stack vertically.
            </p>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🐢</span>
                <span className="text-xs">Slow</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🐇</span>
                <span className="text-xs">Fast</span>
              </div>
            </div>
          </div>
        )}
      </FormField>

      {/* Optional Fields */}
      <div className="border-t pt-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Optional</h4>

        <FormField label="Transliteration" hint="e.g., 'jamal'">
          <TextInput
            value={transliteration}
            onChange={(value) => updateConfig({ transliteration: value })}
            placeholder="jamal"
          />
        </FormField>

        <FormField label="English Meaning" hint="e.g., 'camel'">
          <TextInput
            value={meaning}
            onChange={(value) => updateConfig({ meaning: value })}
            placeholder="camel"
          />
        </FormField>
      </div>
    </div>
  );
}
