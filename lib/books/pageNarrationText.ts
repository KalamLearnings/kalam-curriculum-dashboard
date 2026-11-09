import { VOICE_TAGS } from '@/lib/constants/voiceTags';

const performanceTags: ReadonlySet<string> = new Set(VOICE_TAGS);

/** Explicit page copy wins; narration supplies missing copy without TTS performance cues. */
export function pageNarrationText(displayText: string, narrationText: string): string {
  if (displayText.trim()) return displayText;

  return narrationText
    .replace(/\[[^\]\r\n]*\]/g, (tag) =>
      performanceTags.has(tag.toLowerCase()) ? ' ' : tag
    )
    .split(/\r?\n/)
    .map((line) => line.replace(/[^\S\r\n]+/g, ' ').trim())
    .join('\n')
    .trim();
}
