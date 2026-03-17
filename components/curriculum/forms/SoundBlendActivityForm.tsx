import React, { useEffect, useCallback } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { cn } from '@/lib/utils';
import type { SoundBlendConfig, SoundSegment, SoundDuration, BlendSpeed } from '@/lib/types/activity-configs';

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
 */
function autoDetectSegments(word: string): SoundSegment[] {
  if (!word) return [];

  const parsed = parseWordIntoSegments(word);
  const segments: SoundSegment[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const segment = parsed[i];
    const isLast = i === parsed.length - 1;
    const nextSegment = i < parsed.length - 1 ? parsed[i + 1] : undefined;

    const duration = detectDuration(segment, isLast, nextSegment);
    const sound = segment.baseLetter + segment.harakat;

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

export function SoundBlendActivityForm({ config, onChange }: BaseActivityFormProps<SoundBlendConfig>) {
  const typedConfig = config as SoundBlendConfig;
  const word = typedConfig?.word || '';
  const segments = typedConfig?.segments || [];
  const speed: BlendSpeed = typedConfig?.speed || 'slow';
  const requiredSlides = typedConfig?.requiredSlides || 2;
  const transliteration = typedConfig?.transliteration || '';
  const meaning = typedConfig?.meaning || '';

  const updateConfig = useCallback((updates: Partial<SoundBlendConfig>) => {
    onChange({ ...config, ...updates } as SoundBlendConfig);
  }, [config, onChange]);

  // Auto-detect segments when word changes
  useEffect(() => {
    if (word && segments.length === 0) {
      const detected = autoDetectSegments(word);
      if (detected.length > 0) {
        updateConfig({ segments: detected });
      }
    }
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWordChange = (newWord: string) => {
    const detected = autoDetectSegments(newWord);
    updateConfig({ word: newWord, segments: detected });
  };

  const handleSegmentDurationChange = (index: number, duration: SoundDuration) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], duration };
    updateConfig({ segments: newSegments });
  };

  const handleRedetect = () => {
    const detected = autoDetectSegments(word);
    updateConfig({ segments: detected });
  };

  return (
    <div className="space-y-6">
      {/* Word Input */}
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

            {/* Re-detect button */}
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
      <FormField label="Reading Speed" hint="Speed mode for the activity">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ speed: 'slow' })}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
              speed === 'slow'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <span>🐢</span>
            <span className="font-medium">Slow</span>
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ speed: 'fast' })}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
              speed === 'fast'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <span>🐇</span>
            <span className="font-medium">Fast</span>
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
