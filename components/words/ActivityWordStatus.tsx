/**
 * ActivityWordStatus Component
 *
 * Displays word asset status for words used in an activity
 * Shows warnings for missing assets with quick links to upload
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createClient, getEnvironmentBaseUrl, getEdgeFunctionAuthHeaders } from '@/lib/supabase/client';
import Link from 'next/link';

interface Word {
  id: string;
  arabic: string;
  transliteration: string | null;
  english: string | null;
  has_image: boolean;
  has_audio: boolean;
}

interface ActivityWordStatusProps {
  activityId?: string;
  // Or provide words directly
  words?: Array<{ arabic: string; transliteration?: string; english?: string }>;
}

export function ActivityWordStatus({ activityId, words: providedWords }: ActivityWordStatusProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (activityId) {
      loadActivityWords();
    }
  }, [activityId]);

  const loadActivityWords = async () => {
    if (!activityId) return;

    setLoading(true);
    try {
      // Fetch activity words from API
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${getEnvironmentBaseUrl()}/functions/v1/words?activity_id=${activityId}`,
        {
          headers: {
            ...getEdgeFunctionAuthHeaders(session?.access_token || ''),
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        setWords(data || []);
      }
    } catch (err) {
      console.error('Failed to load activity words:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">Loading word information...</p>
      </div>
    );
  }

  if (!words || words.length === 0) {
    if (providedWords && providedWords.length > 0) {
      // Show preview mode for words that will be created
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Words in this activity</h4>
              <ul className="space-y-1">
                {providedWords.map((word, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    <span className="font-arabic text-base">{word.arabic}</span>
                    {word.transliteration && ` (${word.transliteration})`}
                    {word.english && ` - ${word.english}`}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                These words will be analyzed and added to your word library when you save this activity.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  const wordsMissingAssets = words.filter(w => !w.has_image || !w.has_audio);

  if (wordsMissingAssets.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-900 mb-1">All word assets complete</h4>
            <p className="text-xs text-green-700">
              {words.length} {words.length === 1 ? 'word' : 'words'} used in this activity
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Words missing assets</h4>
          <ul className="space-y-2">
            {wordsMissingAssets.map((word) => (
              <li key={word.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-arabic text-base text-gray-900">{word.arabic}</span>
                    {word.transliteration && (
                      <span className="text-gray-600 ml-2">({word.transliteration})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!word.has_image && (
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs rounded">
                        No Image
                      </span>
                    )}
                    {!word.has_audio && (
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs rounded">
                        No Audio
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-orange-200">
            <Link
              href="/words"
              className="text-sm text-orange-700 hover:text-orange-800 font-medium underline"
            >
              Go to Word Library to upload assets →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
