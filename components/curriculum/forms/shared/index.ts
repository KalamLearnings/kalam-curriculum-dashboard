/**
 * Shared form components index
 *
 * Re-exports all shared components for easy importing.
 */

// Mode toggle
export { ModeToggle, TEXT_IMAGE_MODE_OPTIONS, LETTER_WORD_IMAGE_MODE_OPTIONS } from './ModeToggle';
export type { ModeOption } from './ModeToggle';

// Content display picker
export { ContentDisplayPicker } from './ContentDisplayPicker';
export type { ContentType } from './ContentDisplayPicker';

// Option square (single card)
export { OptionSquare } from './OptionSquare';
export type { OptionSquareData } from './OptionSquare';

// Options grid (container for multiple option squares)
export { OptionsGrid } from './OptionsGrid';
export type { OptionData } from './OptionsGrid';

// Letter selector
export { LetterSelector } from './LetterSelector';

// Word letter picker (pick a letter that exists in a chosen word)
export { WordLetterPicker, extractLettersFromWord } from './WordLetterPicker';
export type { WordLetterPickerProps } from './WordLetterPicker';

// Target letter with distractors form
export { TargetLetterWithDistractorsForm } from './TargetLetterWithDistractorsForm';
