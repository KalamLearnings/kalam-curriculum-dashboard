'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Users, Copy, Check } from 'lucide-react';
import {
  usePromoCodes,
  useDeletePromoCode,
  useUpdatePromoCode,
} from '@/lib/hooks/usePromoCodes';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PromoCodeModal } from '@/components/promo-codes/PromoCodeModal';
import { RedemptionsModal } from '@/components/promo-codes/RedemptionsModal';
import type { PromoCode } from '@/lib/api/promoCodes';
import { toast } from 'sonner';

export default function PromoCodesPage() {
  const { data: promoCodes, isLoading, error } = usePromoCodes();
  const { mutate: deletePromoCode, isPending: isDeleting } = useDeletePromoCode();
  const { mutate: updatePromoCode } = useUpdatePromoCode();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [redemptionsModalOpen, setRedemptionsModalOpen] = useState(false);

  // Selected promo code for actions
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);

  // Copied code tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleEdit = (code: PromoCode) => {
    setSelectedCode(code);
    setEditModalOpen(true);
  };

  const handleDelete = (code: PromoCode) => {
    setSelectedCode(code);
    setDeleteConfirmOpen(true);
  };

  const handleViewRedemptions = (code: PromoCode) => {
    setSelectedCode(code);
    setRedemptionsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCode) return;
    deletePromoCode(selectedCode.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setSelectedCode(null);
      },
    });
  };

  const handleToggleActive = (code: PromoCode) => {
    updatePromoCode({
      id: code.id,
      data: { is_active: !code.is_active },
    });
  };

  const handleCopyCode = async (code: PromoCode) => {
    await navigator.clipboard.writeText(code.code);
    setCopiedId(code.id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlanTypeBadgeColor = (planType: string) => {
    switch (planType) {
      case 'lifetime':
        return 'bg-purple-100 text-purple-800';
      case 'yearly':
        return 'bg-blue-100 text-blue-800';
      case 'six_month':
        return 'bg-cyan-100 text-cyan-800';
      case 'three_month':
        return 'bg-teal-100 text-teal-800';
      case 'two_month':
        return 'bg-emerald-100 text-emerald-800';
      case 'monthly':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPlanType = (planType: string) => {
    switch (planType) {
      case 'monthly':
        return '1 month';
      case 'two_month':
        return '2 months';
      case 'three_month':
        return '3 months';
      case 'six_month':
        return '6 months';
      case 'yearly':
        return '1 year';
      case 'lifetime':
        return 'lifetime';
      default:
        return planType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading promo codes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">Error loading promo codes: {error.message}</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Promo Codes</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage promotional codes for friends and family
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Codes</div>
          <div className="text-2xl font-bold">{promoCodes?.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Codes</div>
          <div className="text-2xl font-bold text-green-600">
            {promoCodes?.filter((c) => c.is_active).length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Redemptions</div>
          <div className="text-2xl font-bold text-blue-600">
            {promoCodes?.reduce((sum, c) => sum + c.current_redemptions, 0) || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Lifetime Codes</div>
          <div className="text-2xl font-bold text-purple-600">
            {promoCodes?.filter((c) => c.plan_type === 'lifetime').length || 0}
          </div>
        </div>
      </div>

      {/* Table */}
      {!promoCodes || promoCodes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No promo codes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Redemptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promoCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {code.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(code)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy code"
                      >
                        {copiedId === code.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {code.description && (
                      <div className="text-xs text-gray-500 mt-1">{code.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanTypeBadgeColor(
                        code.plan_type
                      )}`}
                    >
                      {formatPlanType(code.plan_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewRedemptions(code)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Users className="w-4 h-4" />
                      {code.current_redemptions}
                      {code.max_redemptions !== null && ` / ${code.max_redemptions}`}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(code)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        code.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={code.is_active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          code.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(code.expires_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <PromoCodeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
      />

      {/* Edit Modal */}
      {selectedCode && (
        <PromoCodeModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCode(null);
          }}
          mode="edit"
          promoCode={selectedCode}
        />
      )}

      {/* Redemptions Modal */}
      {selectedCode && (
        <RedemptionsModal
          isOpen={redemptionsModalOpen}
          onClose={() => {
            setRedemptionsModalOpen(false);
            setSelectedCode(null);
          }}
          promoCode={selectedCode}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSelectedCode(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Promo Code"
        message={`Are you sure you want to delete the promo code "${selectedCode?.code}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </main>
  );
}
