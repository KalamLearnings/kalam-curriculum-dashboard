'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Topic, CreateTopic, UpdateTopic } from '@/lib/schemas/curriculum';
import { useCreateTopic, useUpdateTopic } from '@/lib/hooks/useTopics';

interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  topic?: Topic | null;
}

export function TopicFormModal({
  isOpen,
  onClose,
  curriculumId,
  topic,
}: TopicFormModalProps) {
  const isEdit = Boolean(topic);
  const { mutate: createTopic, isPending: isCreating } = useCreateTopic();
  const { mutate: updateTopic, isPending: isUpdating } = useUpdateTopic();

  const [formData, setFormData] = useState({
    letter: topic?.letter?.letter || '',
    letterNameEnglish: topic?.letter?.name_english || '',
    letterNameArabic: topic?.letter?.name_arabic || '',
    titleEn: topic?.title.en || '',
    titleAr: topic?.title.ar || '',
    descriptionEn: topic?.description?.en || '',
    descriptionAr: topic?.description?.ar || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateTopic | UpdateTopic = {
      letter: {
        letter: formData.letter,
        name_english: formData.letterNameEnglish,
        name_arabic: formData.letterNameArabic || undefined,
      },
      title: {
        en: formData.titleEn,
        ar: formData.titleAr,
      },
      description: {
        en: formData.descriptionEn || '',
        ar: formData.descriptionAr || '',
      },
    };

    if (isEdit && topic) {
      updateTopic(
        {
          curriculumId,
          topicId: topic.id,
          data: data as UpdateTopic,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createTopic(
        {
          curriculumId,
          data: data as CreateTopic,
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
      letter: '',
      letterNameEnglish: '',
      letterNameArabic: '',
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Topic' : 'New Topic'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arabic Letter *
          </label>
          <input
            type="text"
            required
            maxLength={1}
            value={formData.letter}
            onChange={(e) =>
              setFormData({ ...formData, letter: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
            placeholder="ا"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letter Name (English) *
          </label>
          <input
            type="text"
            required
            value={formData.letterNameEnglish}
            onChange={(e) =>
              setFormData({ ...formData, letterNameEnglish: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alif"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letter Name (Arabic)
          </label>
          <input
            type="text"
            value={formData.letterNameArabic}
            onChange={(e) =>
              setFormData({ ...formData, letterNameArabic: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ألف"
            dir="rtl"
          />
        </div>

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
            Description (English)
          </label>
          <textarea
            value={formData.descriptionEn}
            onChange={(e) =>
              setFormData({ ...formData, descriptionEn: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter English description"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Arabic)
          </label>
          <textarea
            dir="rtl"
            value={formData.descriptionAr}
            onChange={(e) =>
              setFormData({ ...formData, descriptionAr: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل الوصف بالعربية"
            rows={3}
          />
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
              ? 'Update Topic'
              : 'Create Topic'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
