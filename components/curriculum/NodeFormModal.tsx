'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Node, CreateNode, UpdateNode } from '@/lib/schemas/curriculum';
import { useCreateNode, useUpdateNode } from '@/lib/hooks/useNodes';

interface NodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  topicId: string;
  node?: Node | null;
}

export function NodeFormModal({
  isOpen,
  onClose,
  curriculumId,
  topicId,
  node,
}: NodeFormModalProps) {
  const isEdit = Boolean(node);
  const { mutate: createNode, isPending: isCreating } = useCreateNode();
  const { mutate: updateNode, isPending: isUpdating } = useUpdateNode();

  const [formData, setFormData] = useState({
    titleEn: node?.title.en || '',
    titleAr: node?.title.ar || '',
    type: node?.type || 'lesson',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateNode | UpdateNode = {
      title: {
        en: formData.titleEn,
        ar: formData.titleAr,
      },
      type: formData.type as 'lesson' | 'assessment' | 'intro',
    };

    if (isEdit && node) {
      updateNode(
        {
          curriculumId,
          topicId,
          nodeId: node.id,
          data: data as UpdateNode,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createNode(
        {
          curriculumId,
          topicId,
          data: data as CreateNode,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const handleClose = () => {
    setFormData({
      titleEn: '',
      titleAr: '',
      type: 'lesson',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Node' : 'New Node'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (English) *
          </label>
          <input
            type="text"
            required
            value={formData.titleEn}
            onChange={(e) =>
              setFormData({ ...formData, titleEn: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter English title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (Arabic) *
          </label>
          <input
            type="text"
            required
            dir="rtl"
            value={formData.titleAr}
            onChange={(e) =>
              setFormData({ ...formData, titleAr: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل العنوان بالعربية"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="lesson">Lesson</option>
            <option value="assessment">Assessment</option>
            <option value="intro">Intro</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : isEdit
              ? 'Update Node'
              : 'Create Node'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
