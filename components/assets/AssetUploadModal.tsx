/**
 * AssetUploadModal Component
 *
 * Modal wrapper for the asset upload form.
 * Opens when user clicks "Upload Asset" or drags & drops a file.
 */

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AssetUploadForm } from './AssetUploadForm';
import type { AssetCategory, AssetUploadData } from '@/lib/types/assets';

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: AssetUploadData) => Promise<void>;
  defaultCategory?: AssetCategory;
  initialFile?: File | null;
}

export function AssetUploadModal({
  isOpen,
  onClose,
  onUpload,
  defaultCategory,
  initialFile,
}: AssetUploadModalProps) {
  const handleUpload = async (data: AssetUploadData) => {
    await onUpload(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialFile ? 'Upload Dropped Image' : 'Upload New Asset'}
    >
      <div className="p-6">
        <AssetUploadForm
          onUpload={handleUpload}
          defaultCategory={defaultCategory}
          initialFile={initialFile}
        />
      </div>
    </Modal>
  );
}
