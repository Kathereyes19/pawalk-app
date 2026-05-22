export type PaymentCardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentMethod {
  id: string;
  userId: string;
  brand: PaymentCardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodRow {
  id: string;
  user_id: string;
  brand: PaymentCardBrand;
  last4: string;
  exp_month: number;
  exp_year: number;
  cardholder_name: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AddPaymentMethodInput {
  cardholderName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  setAsDefault?: boolean;
}

export interface UpdatePaymentMethodInput {
  cardholderName?: string;
  expMonth?: string;
  expYear?: string;
  setAsDefault?: boolean;
}

export type CheckoutPaymentType = 'card' | 'pse' | 'nequi';

export interface CheckoutPaymentSelection {
  type: CheckoutPaymentType;
  paymentMethodId?: string;
  paymentLabel: string;
}
