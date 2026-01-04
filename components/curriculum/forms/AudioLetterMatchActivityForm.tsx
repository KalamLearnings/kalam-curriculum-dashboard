
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { AudioLetterMatchConfig } from '@kalam/curriculum-schemas';

export function AudioLetterMatchActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<AudioLetterMatchConfig>;
    const distractors = typedConfig.distractorLetters || [];
    const distractorLettersStr = Array.isArray(distractors) ? distractors.join(', ') : '';

    const handleChange = (key: keyof AudioLetterMatchConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <FormField label="Target Letter" hint="The letter matching the audio">
                <LetterSelector
                    value={typedConfig.targetLetter || ''}
                    onChange={(value) => handleChange('targetLetter', value)}
                    topic={topic}
                />
            </FormField>

            <FormField label="Distractor Letters" hint="Wrong letters (comma-separated)">
                <TextInput
                    value={distractorLettersStr}
                    onChange={(value) => {
                        const letters = value.split(',').map(l => l.trim()).filter(l => l);
                        handleChange('distractorLetters', letters);
                    }}
                    placeholder="ب, ت, ث"
                    dir="rtl"
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Play Audio on Start">
                    <input
                        type="checkbox"
                        checked={typedConfig.playAudioOnStart !== false}
                        onChange={(e) => handleChange('playAudioOnStart', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-play audio</span>
                </FormField>

                <FormField label="Allow Replay">
                    <input
                        type="checkbox"
                        checked={typedConfig.allowReplay !== false}
                        onChange={(e) => handleChange('allowReplay', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show replay button</span>
                </FormField>

                <FormField label="Show Letter Names">
                    <input
                        type="checkbox"
                        checked={typedConfig.showLetterNames === true}
                        onChange={(e) => handleChange('showLetterNames', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Display letter names</span>
                </FormField>
            </div>
        </div>
    );
}
