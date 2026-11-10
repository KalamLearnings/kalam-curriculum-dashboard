import { VOICE_TAGS } from '@/lib/constants/voiceTags';

const performanceTags: ReadonlySet<string> = new Set(VOICE_TAGS);

/** Derive readable page copy from the single source without supported TTS performance cues. */
export function pageNarrationText(text: string): string {
  return text
    .replace(/\[[^\]\r\n]*\]/g, (tag) =>
      performanceTags.has(tag.toLowerCase()) ? ' ' : tag
    )
    .split(/\r?\n/)
    .map((line) => line.replace(/[^\S\r\n]+/g, ' ').trim())
    .join('\n')
    .trim();
}
