/**
 * Available TTS voices for audio generation
 */

export interface Voice {
  id: string;
  name: string;
  description?: string;
}

export const VOICES: Voice[] = [
  {
    id: 'RjFuvnufLX42TYe37ekK',
    name: 'Adeeb',
  },
  {
    id: 'rFDdsCQRZCUL8cPOWtnP',
    name: 'Ghaida',
  },
  {
    id: 'tavIIPLplRB883FzWU0V',
    name: 'Becky',
  },
];

// Default voice (first in the list)
export const DEFAULT_VOICE = VOICES[0];
