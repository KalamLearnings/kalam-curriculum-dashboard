/**
 * EditCurriculumModal Component
 *
 * Modal for editing curriculum metadata.
 * Uses the reusable CurriculumForm component.
 */

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { CurriculumForm, CurriculumFormData } from './CurriculumForm';

interface EditCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: {
    id: string;
    title: {
      en: string;
      ar: string;
    };
  };
  onUpdate: (data: CurriculumFormData) => Promise<void>;
}

export function EditCurriculumModal({
  isOpen,
  onClose,
  curriculum,
  onUpdate,
}: EditCurriculumModalProps) {
  const handleSubmit = async (data: CurriculumFormData) => {
    await onUpdate(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Curriculum">
      <div className="p-6">
        <CurriculumForm
          initialData={{
            titleEn: curriculum.title.en,
            titleAr: curriculum.title.ar,
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Save Changes"
          showCancel={true}
        />
      </div>
    </Modal>
  );
}
