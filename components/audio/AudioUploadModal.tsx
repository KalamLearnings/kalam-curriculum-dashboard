/**
 * AudioUploadModal Component
 *
 * Modal wrapper for the audio upload form.
 * Opens when user clicks "Upload Audio" or drags & drops a file.
 */

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AudioUploadForm } from './AudioUploadForm';
import type { AudioAsset, AudioCategory, AudioUploadData } from '@/lib/types/audio';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: AudioUploadData) => Promise<void>;
  onUpdate?: (id: string, data: AudioUploadData) => Promise<void>;
  defaultCategory?: AudioCategory;
  initialFile?: File | null;
  editingAudio?: AudioAsset | null;
}

export function AudioUploadModal({
  isOpen,
  onClose,
  onUpload,
  onUpdate,
  defaultCategory,
  initialFile,
  editingAudio,
}: AudioUploadModalProps) {
  const isEditing = !!editingAudio;

  const handleUpload = async (data: AudioUploadData) => {
    if (isEditing && onUpdate) {
      await onUpdate(editingAudio.id, data);
    } else {
      await onUpload(data);
    }
    onClose();
  };

  const getTitle = () => {
    if (isEditing) return 'Edit Audio';
    if (initialFile) return 'Add Dropped Audio';
    return 'Add New Audio';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
    >
      <div className="p-4">
        <AudioUploadForm
          onUpload={handleUpload}
          defaultCategory={editingAudio?.category || defaultCategory}
          initialFile={initialFile}
          editingAudio={editingAudio}
        />
      </div>
    </Modal>
  );
}
