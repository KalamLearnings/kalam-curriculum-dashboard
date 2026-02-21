'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useCreatePromoCode, useUpdatePromoCode } from '@/lib/hooks/usePromoCodes';
import type { PromoCode, PromoPlanType, CreatePromoCode, UpdatePromoCode } from '@/lib/api/promoCodes';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  promoCode?: PromoCode;
}

export function PromoCodeModal({
  isOpen,
  onClose,
  mode,
  promoCode,
}: PromoCodeModalProps) {
  const { mutate: createPromoCode, isPending: isCreating } = useCreatePromoCode();
  const { mutate: updatePromoCode, isPending: isUpdating } = useUpdatePromoCode();

  const [code, setCode] = useState('');
  const [planType, setPlanType] = useState<PromoPlanType>('yearly');
  const [description, setDescription] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Reset form when modal opens/closes or promoCode changes
  useEffect(() => {
    if (isOpen && mode === 'edit' && promoCode) {
      setCode(promoCode.code);
      setPlanType(promoCode.plan_type);
      setDescription(promoCode.description || '');
      setMaxRedemptions(promoCode.max_redemptions?.toString() || '');
      setExpiresAt(promoCode.expires_at ? promoCode.expires_at.split('T')[0] : '');
      setIsActive(promoCode.is_active);
    } else if (isOpen && mode === 'create') {
      setCode('');
      setPlanType('yearly');
      setDescription('');
      setMaxRedemptions('');
      setExpiresAt('');
      setIsActive(true);
    }
  }, [isOpen, mode, promoCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      const data: CreatePromoCode = {
        code: code.toUpperCase().trim(),
        plan_type: planType,
        description: description || undefined,
        max_redemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      createPromoCode(data, {
        onSuccess: () => onClose(),
      });
    } else if (mode === 'edit' && promoCode) {
      const data: UpdatePromoCode = {
        description: description || undefined,
        max_redemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : null,
        is_active: isActive,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      updatePromoCode(
        { id: promoCode.id, data },
        { onSuccess: () => onClose() }
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Promo Code' : 'Edit Promo Code'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={mode === 'edit'}
            placeholder="e.g., FAMILY2025"
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
            minLength={3}
            maxLength={50}
          />
          {mode === 'edit' && (
            <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation</p>
          )}
        </div>

        {/* Plan Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan Type
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value as PromoPlanType)}
            disabled={mode === 'edit'}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="monthly">1 Month</option>
            <option value="two_month">2 Months</option>
            <option value="three_month">3 Months</option>
            <option value="six_month">6 Months</option>
            <option value="yearly">1 Year</option>
            <option value="lifetime">Lifetime</option>
          </select>
          {mode === 'edit' && (
            <p className="text-xs text-gray-500 mt-1">Plan type cannot be changed after creation</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (internal note)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., For early supporters"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={500}
          />
        </div>

        {/* Max Redemptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Redemptions
          </label>
          <input
            type="number"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder="Leave empty for unlimited"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={1}
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited redemptions</p>
        </div>

        {/* Expires At */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
        </div>

        {/* Active Toggle (edit mode only) */}
        {mode === 'edit' && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || (mode === 'create' && !code.trim())}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
