import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';

export function ColorLetterActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    // letter is now a LetterReference object that includes the form
    // Note: config type still expects string, but we're migrating to LetterReference
    const letter: LetterReference | null = (config as any)?.letter || null;
    const strokeWidth = (config as any)?.strokeWidth || 10;

    const handleLetterChange = (value: LetterReference | null) => {
        onChange({ ...config, letter: value } as any);
    };

    const handleStrokeWidthChange = (value: number) => {
        onChange({ ...config, strokeWidth: value } as any);
    };

    return (
        <div className="space-y-6">
            <FormField
                label="Letter to Color"
                hint="Select the letter and form to color"
                required
            >
                <LetterSelector
                    value={letter}
                    onChange={handleLetterChange}
                    topic={topic}
                    showFormSelector={true}
                />
            </FormField>

            <FormField label="Stroke Width" hint="Width of the coloring brush (1-50)">
                <input
                    type="number"
                    min="1"
                    max="50"
                    value={strokeWidth}
                    onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </FormField>
        </div>
    );
}
