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
    id: 'rfkTsdZrVWEVhDycUYn9',
    name: 'Shelby',
  },
  {
    id: '4wf10lgibMnboGJGCLrP',
    name: 'Farah',
  },
  {
    id: 'DANw8bnAVbjDEHwZIoYa',
    name: 'Ghawi',
  },
  {
    id: 'Nggzl2QAXh3OijoXD116',
    name: 'Candy',
  },
];

// Default voice (first in the list)
export const DEFAULT_VOICE = VOICES[0];
