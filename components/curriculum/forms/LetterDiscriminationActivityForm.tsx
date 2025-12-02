
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from '../LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { LetterDiscriminationConfig } from '@kalam/curriculum-schemas';

export function LetterDiscriminationActivityForm({ config, onChange }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<LetterDiscriminationConfig>;

    const handleChange = (key: keyof LetterDiscriminationConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Target Letter" hint="Correct answer">
                    <LetterSelector
                        value={typedConfig.targetLetter || ''}
                        onChange={(letter) => handleChange('targetLetter', letter?.id)}
                    />
                </FormField>

                <FormField label="Confusable Letter" hint="Similar looking distractor">
                    <LetterSelector
                        value={typedConfig.confusableLetter || ''}
                        onChange={(letter) => handleChange('confusableLetter', letter?.id)}
                    />
                </FormField>
            </div>

            <FormField label="Prompt Text" hint="e.g., 'Select the letter Qaf'">
                <input
                    type="text"
                    value={typedConfig.prompt || ''}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    dir="rtl"
                />
            </FormField>

            <FormField label="Show In Form">
                <OptionSelector
                    options={[
                        { value: 'isolated', label: 'Isolated' },
                        { value: 'initial', label: 'Initial' },
                        { value: 'medial', label: 'Medial' },
                        { value: 'final', label: 'Final' },
                        { value: 'all', label: 'All Forms' },
                    ]}
                    value={typedConfig.showInForm || 'isolated'}
                    onChange={(value) => handleChange('showInForm', value)}
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center pt-6">
                    <input
                        type="checkbox"
                        checked={typedConfig.playAudio !== false}
                        onChange={(e) => handleChange('playAudio', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Play Audio</span>
                </div>

                <div className="flex items-center pt-6">
                    <input
                        type="checkbox"
                        checked={typedConfig.highlightDifference === true}
                        onChange={(e) => handleChange('highlightDifference', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Highlight Difference (Hint)</span>
                </div>
            </div>
        </div>
    );
}
