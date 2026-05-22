import { getSupabaseClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import {
  detectCardBrand,
  digitsOnly,
  formatExpYear,
  validateCardForm,
} from '@/lib/paymentCardUtils';
import {
  loadStoredPaymentMethods,
  saveStoredPaymentMethods,
} from '@/lib/paymentMethodsStorage';
import type {
  AddPaymentMethodInput,
  PaymentMethod,
  PaymentMethodRow,
  UpdatePaymentMethodInput,
} from '@/types';

function ensurePaymentMethodId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `pm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeYear(year: string): number {
  const digits = formatExpYear(year);
  if (digits.length === 2) return Number(`20${digits}`);
  return Number(digits);
}

function mapRowToPaymentMethod(row: PaymentMethodRow): PaymentMethod {
  return {
    id: row.id,
    userId: row.user_id,
    brand: row.brand,
    last4: row.last4,
    expMonth: row.exp_month,
    expYear: row.exp_year,
    cardholderName: row.cardholder_name,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPaymentMethodToRow(
  method: PaymentMethod
): Omit<PaymentMethodRow, 'created_at' | 'updated_at'> {
  return {
    id: method.id,
    user_id: method.userId,
    brand: method.brand,
    last4: method.last4,
    exp_month: method.expMonth,
    exp_year: method.expYear,
    cardholder_name: method.cardholderName,
    is_default: method.isDefault,
  };
}

function applyDefaultSelection(methods: PaymentMethod[], defaultId?: string | null): PaymentMethod[] {
  if (methods.length === 0) return [];

  const hasDefault = methods.some((method) => method.isDefault);
  if (defaultId) {
    return methods.map((method) => ({
      ...method,
      isDefault: method.id === defaultId,
    }));
  }

  if (hasDefault) return methods;

  return methods.map((method, index) => ({
    ...method,
    isDefault: index === 0,
  }));
}

function saveLocalMethods(userId: string, methods: PaymentMethod[]): PaymentMethod[] {
  const normalized = applyDefaultSelection(methods);
  saveStoredPaymentMethods(userId, normalized);
  return normalized;
}

async function syncDefaultToSupabase(userId: string, methods: PaymentMethod[]): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  for (const method of methods) {
    await supabase
      .from('payment_methods')
      .update({
        is_default: method.isDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', method.id)
      .eq('user_id', userId);
  }
}

export async function fetchPaymentMethodsByUserId(
  userId: string
): Promise<{ methods: PaymentMethod[]; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { methods: applyDefaultSelection(loadStoredPaymentMethods(userId)), error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { methods: applyDefaultSelection(loadStoredPaymentMethods(userId)), error: null };
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return {
      methods: applyDefaultSelection(loadStoredPaymentMethods(userId)),
      error: new Error(error.message),
    };
  }

  const remote = (data as PaymentMethodRow[]).map(mapRowToPaymentMethod);
  const localById = new Map(loadStoredPaymentMethods(userId).map((item) => [item.id, item]));
  const merged = remote.length
    ? remote
    : [...localById.values()];

  const normalized = applyDefaultSelection(merged);
  saveStoredPaymentMethods(userId, normalized);
  return { methods: normalized, error: null };
}

export async function createPaymentMethod(
  userId: string,
  input: AddPaymentMethodInput
): Promise<{ method: PaymentMethod | null; error: Error | null }> {
  const formErrors = validateCardForm(input);
  if (Object.keys(formErrors).length > 0) {
    const firstError = Object.values(formErrors).find(Boolean);
    return { method: null, error: new Error(firstError ?? 'Datos de tarjeta inválidos') };
  }

  const digits = digitsOnly(input.cardNumber);
  const brand = detectCardBrand(digits);
  const now = new Date().toISOString();
  const existing = loadStoredPaymentMethods(userId);
  const shouldBeDefault = input.setAsDefault ?? existing.length === 0;

  const method: PaymentMethod = {
    id: ensurePaymentMethodId(),
    userId,
    brand,
    last4: digits.slice(-4),
    expMonth: Number(input.expMonth),
    expYear: normalizeYear(input.expYear),
    cardholderName: input.cardholderName.trim(),
    isDefault: shouldBeDefault,
    createdAt: now,
    updatedAt: now,
  };

  let next = existing.map((item) =>
    shouldBeDefault ? { ...item, isDefault: false } : item
  );
  next = [method, ...next];
  next = saveLocalMethods(userId, next);

  if (!isSupabaseConfigured()) {
    return { method: next.find((item) => item.id === method.id) ?? method, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { method: next.find((item) => item.id === method.id) ?? method, error: null };
  }

  if (shouldBeDefault) {
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert(mapPaymentMethodToRow(method))
    .select('*')
    .single();

  if (error) {
    return {
      method: next.find((item) => item.id === method.id) ?? method,
      error: null,
    };
  }

  const persisted = mapRowToPaymentMethod(data as PaymentMethodRow);
  next = saveLocalMethods(
    userId,
    next.map((item) => (item.id === method.id ? persisted : item))
  );
  return { method: persisted, error: null };
}

export async function updatePaymentMethod(
  userId: string,
  methodId: string,
  input: UpdatePaymentMethodInput
): Promise<{ method: PaymentMethod | null; error: Error | null }> {
  const existing = loadStoredPaymentMethods(userId);
  const current = existing.find((item) => item.id === methodId);
  if (!current) {
    return { method: null, error: new Error('Método de pago no encontrado') };
  }

  const expMonth = input.expMonth ? Number(input.expMonth) : current.expMonth;
  const expYear = input.expYear ? normalizeYear(input.expYear) : current.expYear;

  if (input.expMonth || input.expYear) {
    const validation = validateCardForm({
      cardholderName: input.cardholderName ?? current.cardholderName,
      cardNumber: `424242424242${current.last4}`,
      expMonth: String(expMonth).padStart(2, '0'),
      expYear: String(expYear).slice(-2),
      cvv: '123',
    });
    if (validation.expMonth || validation.expYear) {
      return {
        method: null,
        error: new Error(validation.expYear ?? validation.expMonth ?? 'Fecha inválida'),
      };
    }
  }

  const updated: PaymentMethod = {
    ...current,
    cardholderName: input.cardholderName?.trim() || current.cardholderName,
    expMonth,
    expYear,
    isDefault: input.setAsDefault ?? current.isDefault,
    updatedAt: new Date().toISOString(),
  };

  let next = existing.map((item) => {
    if (item.id === methodId) return updated;
    if (input.setAsDefault) return { ...item, isDefault: false };
    return item;
  });

  next = saveLocalMethods(userId, next);

  if (!isSupabaseConfigured()) {
    return { method: next.find((item) => item.id === methodId) ?? updated, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { method: next.find((item) => item.id === methodId) ?? updated, error: null };
  }

  if (input.setAsDefault) {
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      cardholder_name: updated.cardholderName,
      exp_month: updated.expMonth,
      exp_year: updated.expYear,
      is_default: updated.isDefault,
      updated_at: updated.updatedAt,
    })
    .eq('id', methodId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    return { method: next.find((item) => item.id === methodId) ?? updated, error: null };
  }

  const persisted = mapRowToPaymentMethod(data as PaymentMethodRow);
  next = saveLocalMethods(
    userId,
    next.map((item) => (item.id === methodId ? persisted : item))
  );
  return { method: persisted, error: null };
}

export async function deletePaymentMethod(
  userId: string,
  methodId: string
): Promise<{ error: Error | null }> {
  const existing = loadStoredPaymentMethods(userId);
  const removed = existing.find((item) => item.id === methodId);
  if (!removed) {
    return { error: new Error('Método de pago no encontrado') };
  }

  let next = existing.filter((item) => item.id !== methodId);
  if (removed.isDefault && next.length > 0) {
    next = applyDefaultSelection(next, next[0].id);
  }
  next = saveLocalMethods(userId, next);

  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', methodId)
    .eq('user_id', userId);

  if (error) {
    return { error: new Error(error.message) };
  }

  await syncDefaultToSupabase(userId, next);
  return { error: null };
}

export async function setDefaultPaymentMethod(
  userId: string,
  methodId: string
): Promise<{ error: Error | null }> {
  const result = await updatePaymentMethod(userId, methodId, { setAsDefault: true });
  return { error: result.error };
}

export function getDefaultPaymentMethod(methods: PaymentMethod[]): PaymentMethod | null {
  return methods.find((method) => method.isDefault) ?? methods[0] ?? null;
}
