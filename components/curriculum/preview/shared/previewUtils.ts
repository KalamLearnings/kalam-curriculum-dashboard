/**
 * Preview Utilities
 *
 * Shared utilities for preview components
 */

/**
 * Get config value with fallback
 */
export function getConfigValue<T>(
  config: Record<string, any>,
  key: string,
  fallback: T
): T {
  return config?.[key] ?? fallback;
}

/**
 * Common Arabic defaults for previews
 */
export const ARABIC_DEFAULTS = {
  letter: 'ب',
  word: 'باب',
  targetLetter: 'ب',
  targetWord: 'باب',
} as const;

/**
 * Shuffle array (for letter scrambling in previews)
 */
export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * Simple reverse (for preview purposes)
 */
export function reverseArray<T>(array: T[]): T[] {
  return [...array].reverse();
}
