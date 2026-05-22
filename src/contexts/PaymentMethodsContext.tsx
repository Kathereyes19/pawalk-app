import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserId } from '@/lib/mockUser';
import {
  createPaymentMethod,
  deletePaymentMethod,
  fetchPaymentMethodsByUserId,
  getDefaultPaymentMethod,
  setDefaultPaymentMethod,
  updatePaymentMethod,
} from '@/features/paymentMethods';
import type { AddPaymentMethodInput, PaymentMethod, UpdatePaymentMethodInput } from '@/types';

export interface PaymentMethodsContextValue {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
  refreshPaymentMethods: () => Promise<void>;
  addPaymentMethod: (input: AddPaymentMethodInput) => Promise<{ error: string | null }>;
  editPaymentMethod: (
    methodId: string,
    input: UpdatePaymentMethodInput
  ) => Promise<{ error: string | null }>;
  removePaymentMethod: (methodId: string) => Promise<{ error: string | null }>;
  makeDefaultPaymentMethod: (methodId: string) => Promise<{ error: string | null }>;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | undefined>(undefined);

export const PaymentMethodsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const userId = resolveUserId(user?.id ?? null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPaymentMethods = useCallback(async () => {
    if (!userId) {
      setPaymentMethods([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { methods, error: fetchError } = await fetchPaymentMethodsByUserId(userId);
    setPaymentMethods(methods);
    setError(fetchError?.message ?? null);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!session && !userId) {
      setPaymentMethods([]);
      return;
    }
    void refreshPaymentMethods();
  }, [authLoading, session, userId, refreshPaymentMethods]);

  const addPaymentMethod = useCallback(
    async (input: AddPaymentMethodInput) => {
      if (!userId) return { error: 'Inicia sesión para guardar métodos de pago.' };
      const { method, error: createError } = await createPaymentMethod(userId, input);
      if (createError || !method) {
        return { error: createError?.message ?? 'No se pudo agregar la tarjeta.' };
      }
      await refreshPaymentMethods();
      return { error: null };
    },
    [userId, refreshPaymentMethods]
  );

  const editPaymentMethod = useCallback(
    async (methodId: string, input: UpdatePaymentMethodInput) => {
      if (!userId) return { error: 'Inicia sesión para editar métodos de pago.' };
      const { error: updateError } = await updatePaymentMethod(userId, methodId, input);
      if (updateError) return { error: updateError.message };
      await refreshPaymentMethods();
      return { error: null };
    },
    [userId, refreshPaymentMethods]
  );

  const removePaymentMethod = useCallback(
    async (methodId: string) => {
      if (!userId) return { error: 'Inicia sesión para eliminar métodos de pago.' };
      const { error: deleteError } = await deletePaymentMethod(userId, methodId);
      if (deleteError) return { error: deleteError.message };
      await refreshPaymentMethods();
      return { error: null };
    },
    [userId, refreshPaymentMethods]
  );

  const makeDefaultPaymentMethod = useCallback(
    async (methodId: string) => {
      if (!userId) return { error: 'Inicia sesión para actualizar métodos de pago.' };
      const { error: defaultError } = await setDefaultPaymentMethod(userId, methodId);
      if (defaultError) return { error: defaultError.message };
      await refreshPaymentMethods();
      return { error: null };
    },
    [userId, refreshPaymentMethods]
  );

  const defaultPaymentMethod = useMemo(
    () => getDefaultPaymentMethod(paymentMethods),
    [paymentMethods]
  );

  const value = useMemo<PaymentMethodsContextValue>(
    () => ({
      paymentMethods,
      defaultPaymentMethod,
      isLoading,
      error,
      refreshPaymentMethods,
      addPaymentMethod,
      editPaymentMethod,
      removePaymentMethod,
      makeDefaultPaymentMethod,
    }),
    [
      paymentMethods,
      defaultPaymentMethod,
      isLoading,
      error,
      refreshPaymentMethods,
      addPaymentMethod,
      editPaymentMethod,
      removePaymentMethod,
      makeDefaultPaymentMethod,
    ]
  );

  return (
    <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>
  );
};

export function usePaymentMethods(): PaymentMethodsContextValue {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
}
