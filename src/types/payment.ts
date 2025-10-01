// Payment-related TypeScript types

export type TierName =
  | 'wedding_free'
  | 'wedding_basic'
  | 'wedding_premium'
  | 'wedding_ultimate'
  | 'event_free'
  | 'event_basic'
  | 'event_premium'
  | 'event_ultimate';

export type TierLevel = 'free' | 'basic' | 'premium' | 'ultimate';
export type InvitationType = 'Wedding' | 'Event';

export interface PricingTier {
  id: number;
  documentId: string;
  tierName: TierName;
  invitationType: InvitationType;
  tierLevel: TierLevel;
  displayName: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'IDR' | 'USD';
  discountPercentage: number;
  isPopular: boolean;
  includedFeatures: string[];
  features: string[];
  validFrom?: string;
  validUntil?: string;
}

export interface Payment {
  id: number;
  orderId: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired';
  amount: number;
  currency: 'IDR' | 'USD';
  paymentType: string;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
  pricingTier?: {
    id: number;
    documentId: string;
    tierName: TierName;
    tierLevel: TierLevel;
    displayName: string;
    description: string;
    invitationType: InvitationType;
    features: string[];
    includedFeatures: string[];
  } | null;
}

export interface PaymentTransaction {
  paymentId: number;
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  amount: number;
  currency: string;
}

export interface MidtransConfig {
  clientKey: string;
  snapUrl: string;
  isProduction: boolean;
}

export interface PaymentButtonProps {
  invitationId: string;
  pricingTierId: string;
  tierName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (payment: Payment) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export interface PaymentStatusCardProps {
  invitation: {
    id: string;
    invitationStatus: 'draft' | 'published' | 'archived';
    invitationTitle: string;
  };
  className?: string;
}

// Midtrans Snap types
declare global {
  interface Window {
    snap: {
      pay: (snapToken: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export interface SnapPaymentResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}
