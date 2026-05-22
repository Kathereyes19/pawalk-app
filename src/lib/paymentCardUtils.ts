import type { PaymentCardBrand } from '@/types';

export interface CardFormValues {
  cardholderName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

export interface CardFormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
}

const BRAND_GRADIENTS: Record<PaymentCardBrand, string> = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-orange-500 to-red-600',
  amex: 'from-teal-600 to-cyan-700',
  unknown: 'from-slate-600 to-slate-800',
};

const BRAND_LABELS: Record<PaymentCardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  unknown: 'Tarjeta',
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(cardNumber: string): PaymentCardBrand {
  const digits = digitsOnly(cardNumber);
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  const brand = detectCardBrand(digits);
  const chunkSize = brand === 'amex' ? 4 : 4;
  const parts: string[] = [];

  if (brand === 'amex') {
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 10);
    const c = digits.slice(10, 15);
    return [a, b, c].filter(Boolean).join(' ');
  }

  for (let i = 0; i < digits.length; i += chunkSize) {
    parts.push(digits.slice(i, i + chunkSize));
  }
  return parts.join(' ');
}

export function formatExpMonth(value: string): string {
  return digitsOnly(value).slice(0, 2);
}

export function formatExpYear(value: string): string {
  return digitsOnly(value).slice(0, 4);
}

export function formatCvv(value: string, brand: PaymentCardBrand): string {
  const max = brand === 'amex' ? 4 : 3;
  return digitsOnly(value).slice(0, max);
}

export function getCardBrandLabel(brand: PaymentCardBrand): string {
  return BRAND_LABELS[brand];
}

export function getCardBrandGradient(brand: PaymentCardBrand): string {
  return BRAND_GRADIENTS[brand];
}

function passesLuhn(cardNumber: string): boolean {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isExpired(expMonth: string, expYear: string, now = new Date()): boolean {
  const month = Number(expMonth);
  const year = Number(expYear.length === 2 ? `20${expYear}` : expYear);
  if (!month || !year) return true;
  const expiry = new Date(year, month, 0, 23, 59, 59);
  return expiry < now;
}

export function validateCardForm(values: CardFormValues): CardFormErrors {
  const errors: CardFormErrors = {};
  const brand = detectCardBrand(values.cardNumber);
  const digits = digitsOnly(values.cardNumber);

  if (!values.cardholderName.trim()) {
    errors.cardholderName = 'Ingresa el nombre del titular';
  } else if (values.cardholderName.trim().length < 2) {
    errors.cardholderName = 'Nombre demasiado corto';
  }

  const minLength = brand === 'amex' ? 15 : 16;
  if (digits.length < minLength) {
    errors.cardNumber = `Ingresa un número de tarjeta válido (${minLength} dígitos)`;
  } else if (!passesLuhn(digits)) {
    errors.cardNumber = 'Número de tarjeta inválido';
  }

  const month = Number(values.expMonth);
  if (!values.expMonth || month < 1 || month > 12) {
    errors.expMonth = 'Mes inválido';
  }

  const yearDigits = formatExpYear(values.expYear);
  if (yearDigits.length < 2) {
    errors.expYear = 'Año inválido';
  } else if (isExpired(values.expMonth, yearDigits)) {
    errors.expYear = 'Tarjeta vencida';
  }

  const cvvLength = brand === 'amex' ? 4 : 3;
  if (digitsOnly(values.cvv).length < cvvLength) {
    errors.cvv = `CVV debe tener ${cvvLength} dígitos`;
  }

  return errors;
}

export function maskCardNumber(last4: string, brand: PaymentCardBrand): string {
  return `${getCardBrandLabel(brand)} ···· ${last4}`;
}

export function formatExpiry(month: number, year: number): string {
  const yy = String(year).slice(-2);
  return `${String(month).padStart(2, '0')}/${yy}`;
}
