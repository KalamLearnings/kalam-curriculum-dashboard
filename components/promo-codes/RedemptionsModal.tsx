'use client';

import { Modal } from '@/components/ui/Modal';
import { usePromoCodeRedemptions } from '@/lib/hooks/usePromoCodes';
import type { PromoCode } from '@/lib/api/promoCodes';
import { CheckCircle, XCircle } from 'lucide-react';

interface RedemptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: PromoCode;
}

export function RedemptionsModal({
  isOpen,
  onClose,
  promoCode,
}: RedemptionsModalProps) {
  const { data: redemptions, isLoading, error } = usePromoCodeRedemptions(
    isOpen ? promoCode.id : null
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Redemptions for "${promoCode.code}"`}
    >
      <div className="p-6">
        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-500">Total Redemptions</div>
            <div className="text-xl font-bold">{promoCode.current_redemptions}</div>
          </div>
          {promoCode.max_redemptions !== null && (
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <div className="text-xs text-gray-500">Remaining</div>
              <div className="text-xl font-bold">
                {Math.max(0, promoCode.max_redemptions - promoCode.current_redemptions)}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading redemptions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading redemptions: {error.message}
          </div>
        ) : !redemptions || redemptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No redemptions yet for this promo code.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    User ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {redemption.user_id.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {redemption.revenuecat_granted ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Granted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </span>
                      )}
                      {redemption.revenuecat_error && (
                        <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                          {redemption.revenuecat_error}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(redemption.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
