import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Loader2, Plus } from 'lucide-react';
import { usePaymentMethods } from '@/contexts/PaymentMethodsContext';
import { ConfirmDialog } from '../pets/ConfirmDialog';
import { Button } from '../Button';
import { ProfileSectionCard } from '../profile/ProfileSectionCard';
import { PaymentMethodCard } from './PaymentMethodCard';
import { AddPaymentMethodSheet } from './AddPaymentMethodSheet';
import { maskCardNumber } from '@/lib/paymentCardUtils';
import type { PaymentMethod } from '@/types';

export const PaymentMethodsSection: React.FC = () => {
  const {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    editPaymentMethod,
    removePaymentMethod,
    makeDefaultPaymentMethod,
  } = usePaymentMethods();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddSheet = () => {
    setSheetMode('add');
    setEditingMethod(null);
    setSheetOpen(true);
  };

  const openEditSheet = (method: PaymentMethod) => {
    setSheetMode('edit');
    setEditingMethod(method);
    setSheetOpen(true);
  };

  const handleSheetSubmit = async (payload: {
    cardholderName: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    setAsDefault?: boolean;
  }) => {
    if (sheetMode === 'edit' && editingMethod) {
      return editPaymentMethod(editingMethod.id, {
        cardholderName: payload.cardholderName,
        expMonth: payload.expMonth,
        expYear: payload.expYear,
        setAsDefault: payload.setAsDefault,
      });
    }
    return addPaymentMethod(payload);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await removePaymentMethod(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <ProfileSectionCard
        title="Métodos de pago"
        description="Administra tus tarjetas y el método predeterminado"
        action={
          <button
            type="button"
            onClick={openAddSheet}
            className="text-sm font-medium text-primary flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Sin métodos guardados</p>
            <p className="text-xs text-muted-foreground mb-4">
              Agrega una tarjeta para pagar más rápido en tus reservas
            </p>
            <Button size="sm" onClick={openAddSheet}>
              <Plus className="w-4 h-4" />
              Agregar tarjeta
            </Button>
          </div>
        ) : (
          <div className="space-y-3 px-1 pb-2">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PaymentMethodCard
                  method={method}
                  showActions
                  onSetDefault={
                    method.isDefault ? undefined : () => void makeDefaultPaymentMethod(method.id)
                  }
                  onEdit={() => openEditSheet(method)}
                  onDelete={() => setDeleteTarget(method)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </ProfileSectionCard>

      <AddPaymentMethodSheet
        open={sheetOpen}
        mode={sheetMode}
        initialMethod={editingMethod}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSheetSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar tarjeta"
        description={
          deleteTarget
            ? `¿Eliminar ${maskCardNumber(deleteTarget.last4, deleteTarget.brand)}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
