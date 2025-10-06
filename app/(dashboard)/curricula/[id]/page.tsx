'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CurriculumEditor } from '@/components/curriculum/CurriculumEditor';

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const curriculumId = params.id as string;
  const curriculumTitle = searchParams.get('title') || 'Curriculum';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">
              {curriculumTitle}
            </h1>
            <button
              onClick={() => router.push('/curricula')}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              ← Back to Curricula
            </button>
          </div>
        </div>
      </nav>

      <CurriculumEditor curriculumId={curriculumId} />
    </div>
  );
}
