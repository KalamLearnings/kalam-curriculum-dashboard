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
import type { AudioCategory, AudioUploadData } from '@/lib/types/audio';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: AudioUploadData) => Promise<void>;
  defaultCategory?: AudioCategory;
  initialFile?: File | null;
}

export function AudioUploadModal({
  isOpen,
  onClose,
  onUpload,
  defaultCategory,
  initialFile,
}: AudioUploadModalProps) {
  const handleUpload = async (data: AudioUploadData) => {
    await onUpload(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialFile ? 'Add Dropped Audio' : 'Add New Audio'}
    >
      <div className="p-6">
        <AudioUploadForm
          onUpload={handleUpload}
          defaultCategory={defaultCategory}
          initialFile={initialFile}
        />
      </div>
    </Modal>
  );
}
