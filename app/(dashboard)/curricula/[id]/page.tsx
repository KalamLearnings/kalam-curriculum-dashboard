'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { List, Network } from 'lucide-react';
import { CurriculumEditor } from '@/components/curriculum/CurriculumEditor';

type ViewMode = 'list' | 'tree';

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const curriculumId = params.id as string;
  const curriculumTitle = searchParams.get('title') || 'Curriculum';
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 items-center gap-4">
            <h1 className="text-base font-semibold">
              {curriculumTitle}
            </h1>

            {/* View Toggle */}
            <div className="inline-flex rounded-md border p-0.5 gap-0.5 bg-gray-50">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                Tree
              </button>
            </div>

            <button
              onClick={() => router.push('/curricula')}
              className="text-xs text-gray-600 hover:text-gray-700"
            >
              ← Back to Curricula
            </button>
          </div>
        </div>
      </nav>

      <CurriculumEditor curriculumId={curriculumId} viewMode={viewMode} />
    </div>
  );
}
