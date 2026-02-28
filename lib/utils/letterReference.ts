/**
 * LetterReference Utilities
 *
 * Centralized utilities for handling LetterReference objects throughout the app.
 * LetterReference is the new format for representing Arabic letters with their forms.
 */

import type { Letter } from '@/lib/hooks/useLetters';

export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

/**
 * Standardized letter reference format - used across the app
 */
export interface LetterReference {
  letterId: string;  // e.g., 'ba', 'alif', 'jeem'
  form: LetterForm;
}

/**
 * Type guard to check if a value is a LetterReference object
 */
export function isLetterReference(value: unknown): value is LetterReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    'letterId' in value &&
    typeof (value as LetterReference).letterId === 'string' &&
    'form' in value &&
    typeof (value as LetterReference).form === 'string'
  );
}

/**
 * Type guard to check if a value is an array of LetterReference objects
 */
export function isLetterReferenceArray(value: unknown): value is LetterReference[] {
  return Array.isArray(value) && value.every(isLetterReference);
}

/**
 * Resolve a LetterReference or string to the display character
 *
 * @param value - LetterReference object, letter ID string, or letter character
 * @param letters - Array of Letter objects from useLetters hook
 * @param defaultValue - Value to return if resolution fails (default: null)
 * @returns The resolved letter character or defaultValue
 */
export function resolveLetterToChar(
  value: unknown,
  letters: Letter[],
  defaultValue: string | null = null
): string | null {
  if (!value) return defaultValue;

  // New format: LetterReference object
  if (isLetterReference(value)) {
    const letterData = letters.find(l => l.id === value.letterId);
    if (letterData) {
      // Return the form-specific character if available
      const formChar = letterData.forms?.[value.form];
      return formChar || letterData.letter;
    }
    return defaultValue;
  }

  // Old format: string
  if (typeof value === 'string') {
    // Check if it's a letter ID (e.g., 'alif', 'ba')
    const letterData = letters.find(l => l.id === value);
    if (letterData) {
      return letterData.letter;
    }
    // It's already a character, return as-is
    return value;
  }

  return defaultValue;
}

/**
 * Resolve a LetterReference to the form-specific display character
 *
 * @param value - LetterReference object
 * @param letters - Array of Letter objects from useLetters hook
 * @param defaultValue - Value to return if resolution fails (default: null)
 * @returns The resolved letter character in the specified form
 */
export function resolveLetterWithForm(
  value: unknown,
  letters: Letter[],
  defaultValue: string | null = null
): string | null {
  if (!value) return defaultValue;

  if (isLetterReference(value)) {
    const letterData = letters.find(l => l.id === value.letterId);
    if (letterData) {
      return letterData.forms?.[value.form] || letterData.letter;
    }
    return defaultValue;
  }

  // Fallback to base character resolution
  return resolveLetterToChar(value, letters, defaultValue);
}

/**
 * Resolve an array of LetterReferences to characters
 *
 * @param values - Array of LetterReference objects or strings
 * @param letters - Array of Letter objects from useLetters hook
 * @returns Array of resolved letter characters
 */
export function resolveLettersToChars(
  values: unknown[],
  letters: Letter[]
): string[] {
  return values
    .map(v => resolveLetterToChar(v, letters))
    .filter((char): char is string => char !== null);
}

/**
 * Get the Letter data object from a LetterReference or string
 *
 * @param value - LetterReference object, letter ID string, or letter character
 * @param letters - Array of Letter objects from useLetters hook
 * @returns The Letter data object or undefined
 */
export function getLetterData(
  value: unknown,
  letters: Letter[]
): Letter | undefined {
  if (!value) return undefined;

  // LetterReference object
  if (isLetterReference(value)) {
    return letters.find(l => l.id === value.letterId);
  }

  // String: could be letter ID or letter character
  if (typeof value === 'string') {
    // First try by ID
    const byId = letters.find(l => l.id === value);
    if (byId) return byId;

    // Then try by character
    return letters.find(l => l.letter === value);
  }

  return undefined;
}

/**
 * Create a LetterReference from a letter ID with a default form
 *
 * @param letterId - The letter ID (e.g., 'ba', 'alif')
 * @param form - The letter form (default: 'isolated')
 * @returns A LetterReference object
 */
export function createLetterReference(
  letterId: string,
  form: LetterForm = 'isolated'
): LetterReference {
  return { letterId, form };
}

/**
 * Normalize a value to a LetterReference if possible
 *
 * @param value - LetterReference object, letter ID string, or letter character
 * @param letters - Array of Letter objects from useLetters hook
 * @param defaultForm - Default form to use (default: 'isolated')
 * @returns A LetterReference object or null if normalization fails
 */
export function normalizeToLetterReference(
  value: unknown,
  letters: Letter[],
  defaultForm: LetterForm = 'isolated'
): LetterReference | null {
  if (!value) return null;

  // Already a LetterReference
  if (isLetterReference(value)) {
    return value;
  }

  // String: could be letter ID or letter character
  if (typeof value === 'string') {
    // First try by ID
    const byId = letters.find(l => l.id === value);
    if (byId) {
      return createLetterReference(byId.id, defaultForm);
    }

    // Then try by character
    const byChar = letters.find(l => l.letter === value);
    if (byChar) {
      return createLetterReference(byChar.id, defaultForm);
    }
  }

  return null;
}
