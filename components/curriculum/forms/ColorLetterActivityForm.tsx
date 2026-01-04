
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { ColorLetterConfig } from '@kalam/curriculum-schemas';

export function ColorLetterActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<ColorLetterConfig>;

    const handleChange = (key: keyof ColorLetterConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <FormField label="Letter to Color">
                <LetterSelector
                    value={typedConfig.letter || ''}
                    onChange={(value) => handleChange('letter', value)}
                    topic={topic}
                />
            </FormField>

            <FormField label="Letter Form">
                <OptionSelector
                    options={[
                        { value: 'isolated', label: 'Isolated' },
                        { value: 'initial', label: 'Initial' },
                        { value: 'medial', label: 'Medial' },
                        { value: 'final', label: 'Final' },
                    ]}
                    value={typedConfig.letterForm || 'isolated'}
                    onChange={(value) => handleChange('letterForm', value)}
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Stroke Width">
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={typedConfig.strokeWidth || 10}
                        onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </FormField>

                <div className="space-y-2 pt-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={typedConfig.allowEraser !== false}
                            onChange={(e) => handleChange('allowEraser', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow Eraser</span>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={typedConfig.saveDrawing === true}
                            onChange={(e) => handleChange('saveDrawing', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Save Drawing to Gallery</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
