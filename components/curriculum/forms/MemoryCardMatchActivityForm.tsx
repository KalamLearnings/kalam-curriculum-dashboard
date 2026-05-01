import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';
import { useLetters } from '@/lib/hooks/useLetters';
import { AudioPicker } from '@/components/audio/AudioPicker';
import { cn } from '@/lib/utils';
import type { MemoryCardLetter, LetterPosition } from '@/lib/types/activity-configs';

const FORM_OPTIONS: { value: LetterPosition; label: string }[] = [
    { value: 'isolated', label: 'Isolated' },
    { value: 'initial', label: 'Initial' },
    { value: 'medial', label: 'Medial' },
    { value: 'final', label: 'Final' },
];

export function MemoryCardMatchActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const { letters: allLetters } = useLetters();
    const typedConfig = config as any;

    // letters is now an array of MemoryCardLetter objects
    const letters: MemoryCardLetter[] = typedConfig?.letters || [];
    const matchType = typedConfig?.matchType || 'letter_to_letter';
    const showHints = typedConfig?.showHints === true;

    // Track which letter is selected for editing matching form
    const [editingLetterId, setEditingLetterId] = useState<string | null>(null);

    // Get letter display character
    const getLetterDisplay = (letterId: string, form: LetterPosition): string => {
        const letter = allLetters.find(l => l.id === letterId);
        if (!letter) return '';
        const forms = letter.forms as Record<string, string> | undefined;
        return forms?.[form] || letter.letter || '';
    };

    const handleLettersChange = (value: LetterReference[]) => {
        // Convert LetterReference[] to MemoryCardLetter[] preserving existing matchingForm and audioId
        const newLetters: MemoryCardLetter[] = value.map(ref => {
            const existing = letters.find(l => l.letterId === ref.letterId);
            return {
                letterId: ref.letterId,
                form: ref.form,
                matchingForm: existing?.matchingForm,
                audioId: existing?.audioId,
            };
        });
        onChange({ ...config, letters: newLetters } as any);
    };

    const handleMatchingFormChange = (letterId: string, matchingForm: LetterPosition | undefined) => {
        const newLetters = letters.map(l =>
            l.letterId === letterId
                ? { ...l, matchingForm: matchingForm === l.form ? undefined : matchingForm }
                : l
        );
        onChange({ ...config, letters: newLetters } as any);
    };

    const handleAudioChange = (letterId: string, audioId: string | undefined, audio?: AudioAsset) => {
        const newLetters = letters.map(l =>
            l.letterId === letterId
                ? {
                    ...l,
                    audioId,
                    // Store storage path for backend URL resolution
                    audioPath: audio?.storagePath,
                  }
                : l
        );
        onChange({ ...config, letters: newLetters } as any);
    };

    const handleMatchTypeChange = (value: string) => {
        onChange({ ...config, matchType: value } as any);
    };


    const handleShowHintsChange = (value: boolean) => {
        onChange({ ...config, showHints: value } as any);
    };

    // Convert MemoryCardLetter[] to LetterReference[] for LetterSelector
    const lettersAsRefs: LetterReference[] = letters.map(l => ({
        letterId: l.letterId,
        form: l.form,
    }));

    // Check if any letter has cross-form matching enabled
    const hasCrossFormMatching = letters.some(l => l.matchingForm && l.matchingForm !== l.form);

    return (
        <div className="space-y-6">
            <FormField
                label="Letters to Match"
                hint="Select the letters to include in the memory game"
                required
            >
                <LetterSelector
                    value={lettersAsRefs}
                    onChange={handleLettersChange}
                    multiSelect
                    multiFormSelect
                    showFormSelector={true}
                />
            </FormField>

            <FormField label="Match Type" hint="How cards should be matched">
                <OptionSelector
                    options={[
                        { value: 'letter_to_letter', label: 'Letter to Letter' },
                        { value: 'letter_to_sound', label: 'Letter to Sound' },
                        { value: 'form_to_form', label: 'Form to Form' },
                    ]}
                    value={matchType}
                    onChange={handleMatchTypeChange}
                />
            </FormField>

            {/* Letter Sound Assignment (only for letter_to_sound) */}
            {matchType === 'letter_to_sound' && letters.length > 0 && (
                <FormField
                    label="Letter Sounds"
                    hint="Assign an audio file to each letter. Players will match letters to their sounds."
                >
                    <div className="space-y-3">
                        {letters.map((letter) => {
                            const hasAudio = !!letter.audioId;
                            return (
                                <div
                                    key={letter.letterId}
                                    className={cn(
                                        'p-3 rounded-lg border-2 transition-all',
                                        hasAudio
                                            ? 'border-purple-400 bg-purple-50'
                                            : 'border-orange-300 bg-orange-50'
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <span className="text-2xl font-arabic">
                                                {getLetterDisplay(letter.letterId, letter.form)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({letter.form})
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <AudioPicker
                                                value={letter.audioId}
                                                onChange={(audioId, audio) => handleAudioChange(letter.letterId, audioId, audio)}
                                                placeholder="Select sound for this letter..."
                                            />
                                        </div>
                                    </div>
                                    {!hasAudio && (
                                        <p className="text-xs text-orange-600 mt-2">
                                            Audio required for letter-to-sound matching
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {letters.some(l => !l.audioId) && (
                        <p className="mt-3 text-sm text-orange-600">
                            Please assign audio to all letters for the activity to work correctly.
                        </p>
                    )}
                </FormField>
            )}

            {/* Cross-Form Matching Setup (only for letter_to_letter) */}
            {matchType === 'letter_to_letter' && letters.length > 0 && (
                <FormField
                    label="Cross-Form Matching"
                    hint="Set a different form for the matching card (e.g., isolated ↔ initial)"
                >
                    <div className="space-y-3">
                        {letters.map((letter) => {
                            const hasMatchingForm = letter.matchingForm && letter.matchingForm !== letter.form;
                            return (
                                <div
                                    key={letter.letterId}
                                    className={cn(
                                        'p-3 rounded-lg border-2 transition-all',
                                        hasMatchingForm
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-200 bg-white'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-arabic">
                                                {getLetterDisplay(letter.letterId, letter.form)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({letter.form})
                                            </span>
                                            {hasMatchingForm && (
                                                <>
                                                    <span className="text-gray-400">↔</span>
                                                    <span className="text-2xl font-arabic text-blue-600">
                                                        {getLetterDisplay(letter.letterId, letter.matchingForm!)}
                                                    </span>
                                                    <span className="text-sm text-blue-500">
                                                        ({letter.matchingForm})
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditingLetterId(
                                                editingLetterId === letter.letterId ? null : letter.letterId
                                            )}
                                            className={cn(
                                                'text-xs px-2 py-1 rounded',
                                                editingLetterId === letter.letterId
                                                    ? 'bg-gray-200 text-gray-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            )}
                                        >
                                            {editingLetterId === letter.letterId ? 'Close' : 'Edit Match'}
                                        </button>
                                    </div>

                                    {editingLetterId === letter.letterId && (
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleMatchingFormChange(letter.letterId, undefined)}
                                                className={cn(
                                                    'px-3 py-1.5 text-sm rounded border transition-all',
                                                    !letter.matchingForm || letter.matchingForm === letter.form
                                                        ? 'bg-green-100 border-green-400 text-green-700'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                )}
                                            >
                                                Same Form
                                            </button>
                                            {FORM_OPTIONS.filter(f => f.value !== letter.form).map((form) => (
                                                <button
                                                    key={form.value}
                                                    type="button"
                                                    onClick={() => handleMatchingFormChange(letter.letterId, form.value)}
                                                    className={cn(
                                                        'px-3 py-1.5 text-sm rounded border transition-all flex items-center gap-2',
                                                        letter.matchingForm === form.value
                                                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    )}
                                                >
                                                    <span className="font-arabic">
                                                        {getLetterDisplay(letter.letterId, form.value)}
                                                    </span>
                                                    <span>{form.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {hasCrossFormMatching && (
                        <p className="mt-2 text-sm text-blue-600">
                            Cross-form matching enabled. Cards will show different forms of the same letter.
                        </p>
                    )}
                </FormField>
            )}

            <FormField label="Show Hints">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showHints}
                        onChange={(e) => handleShowHintsChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show hints after delay</span>
                </div>
            </FormField>
        </div>
    );
}
