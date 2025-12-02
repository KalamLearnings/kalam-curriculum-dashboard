
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from '../LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { AudioLetterMatchConfig } from '@kalam/curriculum-schemas';

export function AudioLetterMatchActivityForm({ config, onChange }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<AudioLetterMatchConfig>;
    const distractors = typedConfig.distractorLetters || [];

    const handleChange = (key: keyof AudioLetterMatchConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    const addDistractor = (letter: any) => {
        if (letter && !distractors.includes(letter.id)) {
            handleChange('distractorLetters', [...distractors, letter.id]);
        }
    };

    const removeDistractor = (letterId: string) => {
        handleChange('distractorLetters', distractors.filter(d => d !== letterId));
    };

    return (
        <div className="space-y-6">
            <FormField label="Target Letter" hint="The letter matching the audio">
                <LetterSelector
                    value={typedConfig.targetLetter || ''}
                    onChange={(letter) => handleChange('targetLetter', letter?.id)}
                />
            </FormField>

            <FormField
                label="Distractor Letters"
                hint="Incorrect letters to display"
            >
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {distractors.map(d => (
                            <span key={d} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {d}
                                <button
                                    type="button"
                                    onClick={() => removeDistractor(d)}
                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {distractors.length === 0 && (
                            <span className="text-sm text-gray-500 italic">No distractors selected</span>
                        )}
                    </div>
                    <LetterSelector
                        value=""
                        onChange={(letter) => addDistractor(letter)}
                        label="Add Distractor"
                    />
                </div>
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
