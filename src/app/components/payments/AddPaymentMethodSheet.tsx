import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, X } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { IconButton } from '../IconButton';
import {
  detectCardBrand,
  formatCardNumber,
  formatCvv,
  formatExpMonth,
  formatExpYear,
  getCardBrandLabel,
  validateCardForm,
} from '@/lib/paymentCardUtils';
import type { PaymentMethod } from '@/types';

interface AddPaymentMethodSheetProps {
  open: boolean;
  mode?: 'add' | 'edit';
  initialMethod?: PaymentMethod | null;
  onClose: () => void;
  onSubmit: (payload: {
    cardholderName: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    setAsDefault?: boolean;
  }) => Promise<{ error: string | null }>;
}

export const AddPaymentMethodSheet: React.FC<AddPaymentMethodSheetProps> = ({
  open,
  mode = 'add',
  initialMethod,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === 'edit';
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialMethod) {
      setCardholderName(initialMethod.cardholderName);
      setCardNumber('');
      setExpMonth(String(initialMethod.expMonth).padStart(2, '0'));
      setExpYear(String(initialMethod.expYear).slice(-2));
      setCvv('');
      setSetAsDefault(initialMethod.isDefault);
    } else {
      setCardholderName('');
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvv('');
      setSetAsDefault(true);
    }
    setErrors({});
  }, [open, isEdit, initialMethod]);

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  const handleSubmit = async () => {
    const validation = validateCardForm({
      cardholderName,
      cardNumber: isEdit && initialMethod ? `424242424242${initialMethod.last4}` : cardNumber,
      expMonth,
      expYear,
      cvv: isEdit ? '123' : cvv,
    });

    if (!isEdit && Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>);
      return;
    }

    if (isEdit) {
      const editErrors: Record<string, string> = {};
      if (!cardholderName.trim()) editErrors.cardholderName = 'Ingresa el nombre del titular';
      if (validation.expMonth) editErrors.expMonth = validation.expMonth;
      if (validation.expYear) editErrors.expYear = validation.expYear;
      if (Object.keys(editErrors).length > 0) {
        setErrors(editErrors);
        return;
      }
    }

    setIsSaving(true);
    const result = await onSubmit({
      cardholderName,
      cardNumber: isEdit && initialMethod ? `424242424242${initialMethod.last4}` : cardNumber,
      expMonth,
      expYear,
      cvv: isEdit ? '123' : cvv,
      setAsDefault,
    });
    setIsSaving(false);

    if (result.error) {
      setErrors({ form: result.error });
      return;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-card rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? 'Editar tarjeta' : 'Agregar tarjeta'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Información encriptada y almacenada de forma segura
                </p>
              </div>
              <IconButton variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {!isEdit && cardNumber && (
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/15 p-4 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{getCardBrandLabel(brand)} detectada</p>
                    <p className="text-xs text-muted-foreground">Solo guardamos los últimos 4 dígitos</p>
                  </div>
                </div>
              )}

              <Input
                label="Nombre del titular"
                placeholder="Como aparece en la tarjeta"
                value={cardholderName}
                onChange={(event) => setCardholderName(event.target.value.toUpperCase())}
                error={errors.cardholderName}
              />

              {!isEdit && (
                <Input
                  label="Número de tarjeta"
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  error={errors.cardNumber}
                />
              )}

              {isEdit && initialMethod && (
                <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
                  Tarjeta {getCardBrandLabel(initialMethod.brand)} ···· {initialMethod.last4}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiración (MM)"
                  placeholder="MM"
                  inputMode="numeric"
                  value={expMonth}
                  onChange={(event) => setExpMonth(formatExpMonth(event.target.value))}
                  error={errors.expMonth}
                />
                <Input
                  label="Expiración (AA)"
                  placeholder="AA"
                  inputMode="numeric"
                  value={expYear}
                  onChange={(event) => setExpYear(formatExpYear(event.target.value))}
                  error={errors.expYear}
                />
              </div>

              {!isEdit && (
                <Input
                  label="CVV"
                  placeholder={brand === 'amex' ? '4 dígitos' : '3 dígitos'}
                  inputMode="numeric"
                  type="password"
                  value={cvv}
                  onChange={(event) => setCvv(formatCvv(event.target.value, brand))}
                  error={errors.cvv}
                />
              )}

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(event) => setSetAsDefault(event.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Usar como método de pago predeterminado</span>
              </label>

              {errors.form && (
                <p className="text-sm text-destructive font-medium">{errors.form}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-4 h-4 text-success" />
                No almacenamos el número completo ni el CVV en nuestros servidores.
              </div>
            </div>

            <div className="p-5 pb-safe border-t border-border shrink-0">
              <Button fullWidth size="xl" onClick={handleSubmit} loading={isSaving}>
                {isEdit ? 'Guardar cambios' : 'Guardar tarjeta'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
