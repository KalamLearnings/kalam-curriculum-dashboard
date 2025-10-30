'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUpdateCurriculum, useDeleteCurriculum } from '@/lib/hooks/useCurriculum';
import { EditCurriculumModal } from '@/components/curriculum/EditCurriculumModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { CurriculumFormData } from '@/components/curriculum/CurriculumForm';
import { toast } from 'sonner';

export default function CurriculaPage() {
  const [curricula, setCurricula] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [curriculumToEdit, setCurriculumToEdit] = useState<any>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [curriculumToDelete, setCurriculumToDelete] = useState<any>(null);

  // Hooks
  const { mutate: updateCurriculum, isPending: isUpdating } = useUpdateCurriculum();
  const { mutate: deleteCurriculum, isPending: isDeleting } = useDeleteCurriculum();

  useEffect(() => {
    const supabase = createClient();

    async function loadCurricula() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/curriculum/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load curricula');
        }

        const result = await response.json();
        setCurricula(result.data?.data || []);
      } catch (err) {
        console.error('Failed to load curricula:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCurricula();
  }, []);

  // Handle edit
  const handleEditClick = (curriculum: any) => {
    setCurriculumToEdit(curriculum);
    setEditModalOpen(true);
  };

  const handleUpdate = async (data: CurriculumFormData) => {
    if (!curriculumToEdit) return;

    updateCurriculum(
      {
        id: curriculumToEdit.id,
        data: {
          title: {
            en: data.titleEn,
            ar: data.titleAr,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success('Curriculum updated successfully!');
          setEditModalOpen(false);
          setCurriculumToEdit(null);
          // Reload curricula
          setCurricula(prev =>
            prev.map(c =>
              c.id === curriculumToEdit.id
                ? { ...c, title: { en: data.titleEn, ar: data.titleAr } }
                : c
            )
          );
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update curriculum');
        },
      }
    );
  };

  // Handle delete
  const handleDeleteClick = (curriculum: any) => {
    setCurriculumToDelete(curriculum);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!curriculumToDelete) return;

    deleteCurriculum(curriculumToDelete.id, {
      onSuccess: () => {
        toast.success('Curriculum deleted successfully!');
        setDeleteConfirmOpen(false);
        setCurriculumToDelete(null);
        // Remove from list
        setCurricula(prev => prev.filter(c => c.id !== curriculumToDelete.id));
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete curriculum');
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Curricula</h2>
            <button
              onClick={() => router.push('/templates')}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              View Templates
            </button>
          </div>
          <button
            onClick={() => router.push('/curricula/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Create Curriculum
          </button>
        </div>

        {curricula.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No curricula found. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {curricula.map((curriculum) => (
                  <tr
                    key={curriculum.id}
                    onClick={() => router.push(`/curricula/${curriculum.id}/builder?title=${encodeURIComponent(curriculum.title?.en || 'Curriculum')}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{curriculum.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {curriculum.title?.en || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          curriculum.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {curriculum.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(curriculum);
                        }}
                        className="text-blue-600 hover:text-blue-700 mr-4"
                        disabled={isUpdating}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(curriculum);
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {curriculumToEdit && (
          <EditCurriculumModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setCurriculumToEdit(null);
            }}
            curriculum={curriculumToEdit}
            onUpdate={handleUpdate}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setCurriculumToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Curriculum"
          message={`Are you sure you want to delete "${curriculumToDelete?.title?.en || 'this curriculum'}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
        />
      </main>
  );
}
