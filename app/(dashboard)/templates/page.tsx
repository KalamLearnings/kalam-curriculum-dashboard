'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityTemplates, useDeleteActivityTemplate } from '@/lib/hooks/useTemplates';
import { TemplateFormModal } from '@/components/curriculum/TemplateFormModal';
import type { ActivityTemplate } from '@/lib/schemas/curriculum';

export default function TemplatesPage() {
  const router = useRouter();
  const { data: templates, isLoading } = useActivityTemplates();
  const { mutate: deleteTemplate } = useDeleteActivityTemplate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);

  const handleEdit = (template: ActivityTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Activity Templates</h1>
          <button
            onClick={() => router.push('/curricula')}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            View Curricula
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Template
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{template.name.en}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {template.type}
                    </span>
                    {template.category && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {template.category}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3" dir="rtl">{template.name.ar}</p>

                  {template.description && (
                    <p className="text-sm text-gray-500 mb-3">{template.description.en}</p>
                  )}

                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Required fields:</span>{' '}
                      {template.required_fields.length > 0
                        ? template.required_fields.join(', ')
                        : 'None'}
                    </div>
                    <div>
                      <span className="font-medium">Usage:</span> {template.usage_count}
                    </div>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No templates yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create your first template
          </button>
        </div>
      )}

      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={editingTemplate}
      />
    </main>
  );
}
