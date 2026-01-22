'use client';

/**
 * Voice Selector Component
 *
 * Global TTS voice selector that applies to all audio generation
 * in the activity form (instructions, conditional audio, etc.)
 */

import { cn } from '@/lib/utils';
import { VOICES } from '@/lib/constants/voices';

interface VoiceSelectorProps {
  /** Currently selected voice ID */
  value: string;
  /** Callback when voice changes */
  onChange: (voiceId: string) => void;
  /** Optional label override */
  label?: string;
  /** Optional className for container */
  className?: string;
}

export function VoiceSelector({
  value,
  onChange,
  label = 'TTS Voice',
  className,
}: VoiceSelectorProps) {
  const selectedVoice = VOICES.find((v) => v.id === value) || VOICES[0];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-300',
          'bg-white text-gray-700',
          'hover:border-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
          'cursor-pointer'
        )}
      >
        {VOICES.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name}
            {voice.description ? ` - ${voice.description}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
