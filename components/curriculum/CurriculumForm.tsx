/**
 * CurriculumForm Component
 *
 * Reusable form for creating/editing curriculum metadata.
 * Used in both create page and edit modal.
 */

'use client';

import React, { useState, useEffect } from 'react';

export interface CurriculumFormData {
  titleEn: string;
  titleAr: string;
}

interface CurriculumFormProps {
  initialData?: CurriculumFormData;
  onSubmit: (data: CurriculumFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
}

export function CurriculumForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCancel = true,
}: CurriculumFormProps) {
  const [formData, setFormData] = useState<CurriculumFormData>({
    titleEn: initialData?.titleEn || '',
    titleAr: initialData?.titleAr || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        titleEn: initialData.titleEn,
        titleAr: initialData.titleAr,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curriculum Title (English)
          </label>
          <input
            type="text"
            value={formData.titleEn}
            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
            placeholder="e.g., Arabic Alphabet Learning Path"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curriculum Title (Arabic)
          </label>
          <input
            type="text"
            value={formData.titleAr}
            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
            placeholder="e.g., مسار تعلم الحروف العربية"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="rtl"
            required
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
