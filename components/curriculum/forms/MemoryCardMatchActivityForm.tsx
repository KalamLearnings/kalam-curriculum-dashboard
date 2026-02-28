import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';

export function MemoryCardMatchActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    // Note: config type from @kalam/curriculum-schemas still expects old format
    // We're migrating to LetterReference format
    const typedConfig = config as any;
    // letters is now an array of LetterReference objects
    const letters: LetterReference[] = typedConfig?.letters || [];
    const matchType = typedConfig?.matchType || 'letter_to_letter';
    const showHints = typedConfig?.showHints === true;

    const handleLettersChange = (value: LetterReference[]) => {
        onChange({ ...config, letters: value } as any);
    };

    const handleMatchTypeChange = (value: string) => {
        onChange({ ...config, matchType: value } as any);
    };

    const handleShowHintsChange = (value: boolean) => {
        onChange({ ...config, showHints: value } as any);
    };

    return (
        <div className="space-y-6">
            <FormField
                label="Letters to Match"
                hint="Select the letters to include in the memory game"
                required
            >
                <LetterSelector
                    value={letters}
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
