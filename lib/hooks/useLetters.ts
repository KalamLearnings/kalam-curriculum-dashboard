/**
 * useLetters Hook
 *
 * Manages Arabic letters state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient, getEnvironmentBaseUrl } from '@/lib/supabase/client';

export interface LetterForm {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface Letter {
  id: string; // 'alif', 'ba', 'ta'
  letter: string; // 'ا', 'ب', 'ت'
  letter_number: number;
  name_english: string;
  name_arabic: string;
  transliteration: string;
  forms: LetterForm;
  diacritics?: {
    count?: number;
    position?: string;
    type?: string;
  };
  phonetics?: {
    ipa?: string;
    englishApproximation?: string;
    articulation?: string;
  };
}

interface UseLettersReturn {
  letters: Letter[];
  loading: boolean;
  error: string | null;
  getLetter: (letterId: string) => Letter | undefined;
  refetch: () => Promise<void>;
}

function getLettersApiUrl() {
  return `${getEnvironmentBaseUrl()}/functions/v1/letters/list`;
}

export function useLetters(): UseLettersReturn {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  /**
   * Load letters from API
   */
  const loadLetters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(getLettersApiUrl(), {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load letters');
      }

      const { data } = await response.json();
      setLetters(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load letters';
      setError(message);
      console.error('Error loading letters:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Get a single letter by ID
   */
  const getLetter = useCallback((letterId: string): Letter | undefined => {
    return letters.find(l => l.id === letterId);
  }, [letters]);

  /**
   * Refetch letters
   */
  const refetch = useCallback(async () => {
    await loadLetters();
  }, [loadLetters]);

  // Load letters on mount
  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  return {
    letters,
    loading,
    error,
    getLetter,
    refetch,
  };
}
