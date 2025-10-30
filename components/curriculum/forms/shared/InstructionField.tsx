import React from 'react';
import { FormField } from '../FormField';

interface Instruction {
  en: string;
  ar: string;
}

interface InstructionFieldProps {
  value: Instruction;
  onChange: (instruction: Instruction) => void;
  hideArabic?: boolean; // Option to hide Arabic field if not needed
}

/**
 * Reusable instruction field component for activities
 * Handles both English and Arabic instructions
 * Prepared for TTS integration
 */
export function InstructionField({
  value,
  onChange,
  hideArabic = false
}: InstructionFieldProps) {
  // Provide default empty instruction if value is undefined
  const instruction = value || { en: '', ar: '' };

  return (
    <div className="space-y-4 pb-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Activity Instructions
        </h3>
        {/* Placeholder for future TTS button */}
        {/* <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-600"
          disabled
        >
          🎵 Generate Audio (Coming Soon)
        </button> */}
      </div>

      <FormField
        label="Instruction (English)"
        hint="What should the student do in this activity?"
        required
      >
        <textarea
          required
          value={instruction.en}
          onChange={(e) => onChange({ ...instruction, en: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter instruction in English"
          rows={2}
        />
      </FormField>

      {!hideArabic && (
        <FormField
          label="Instruction (Arabic)"
          hint="Optional Arabic translation"
        >
          <div className="relative">
            <textarea
              dir="rtl"
              value={instruction.ar}
              onChange={(e) => onChange({ ...instruction, ar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="أدخل التعليمات بالعربية (اختياري)"
              rows={2}
            />
            {/* Placeholder for TTS generation badge */}
            {/* {value.ar && hasGeneratedAudio && (
              <div className="absolute top-2 left-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                🎵 Audio Generated
              </div>
            )} */}
          </div>
        </FormField>
      )}
    </div>
  );
}
