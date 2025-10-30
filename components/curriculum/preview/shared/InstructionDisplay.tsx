/**
 * InstructionDisplay Component
 *
 * Reusable component for displaying bilingual instructions
 */

'use client';

interface InstructionDisplayProps {
  instruction: {
    en: string;
    ar: string;
  };
  className?: string;
}

export function InstructionDisplay({ instruction, className = '' }: InstructionDisplayProps) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-lg text-gray-700">{instruction.en}</p>
      {instruction.ar && (
        <p className="text-xl text-gray-900 mt-2" dir="rtl">
          {instruction.ar}
        </p>
      )}
    </div>
  );
}
