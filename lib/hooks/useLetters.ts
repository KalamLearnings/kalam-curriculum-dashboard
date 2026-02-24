/**
 * useLetters Hook
 *
 * Manages Arabic letters state with React Query caching.
 * Letters are cached globally and rarely change, so we use a long staleTime.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getEnvironmentBaseUrl, getEdgeFunctionAuthHeaders } from '@/lib/supabase/client';

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

async function fetchLetters(): Promise<Letter[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(getLettersApiUrl(), {
    headers: {
      ...getEdgeFunctionAuthHeaders(session?.access_token || ''),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to load letters');
  }

  const { data } = await response.json();
  return data || [];
}

export function useLetters(): UseLettersReturn {
  const queryClient = useQueryClient();

  const {
    data: letters = [],
    isLoading: loading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['letters'],
    queryFn: fetchLetters,
    staleTime: 30 * 60 * 1000, // 30 minutes - letters rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache time (formerly cacheTime)
  });

  const getLetter = (letterId: string): Letter | undefined => {
    return letters.find(l => l.id === letterId);
  };

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    letters,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load letters') : null,
    getLetter,
    refetch,
  };
}
