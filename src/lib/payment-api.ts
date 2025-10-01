// Payment API functions

import { ApiErrorHandler } from "@/lib/api-error-handler";
import type {
  PricingTier,
  Payment,
  PaymentTransaction,
  MidtransConfig,
} from "@/types/payment";
import type {
  StrapiCollectionResponse,
  StrapiSingleResponse,
  ApiRequestOptions,
} from "@/types/api";

// Get the Strapi URL from the environment variables
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Helper function to perform fetch requests to the Strapi API
 */
async function fetchApi<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const requestUrl = `${STRAPI_URL}${endpoint}`;
  const apiErrorHandler = ApiErrorHandler;
  return apiErrorHandler.safeFetch<T>(requestUrl, mergedOptions);
}

/**
 * Get public pricing tiers
 */
export async function getPricingTiers(): Promise<PricingTier[]> {
  const response = await fetchApi<{ success: boolean; data: PricingTier[] }>(
    "/api/pricing-tiers/public"
  );
  return response.data;
}

/**
 * Get pricing tier by tier name
 */
export async function getPricingTierByName(
  tierName: string
): Promise<PricingTier> {
  const response = await fetchApi<{ success: boolean; data: PricingTier }>(
    `/api/pricing-tiers/tier/${tierName}`
  );
  return response.data;
}

/**
 * Get pricing tiers by invitation type
 */
export async function getPricingTiersByInvitationType(
  invitationType: 'Wedding' | 'Event'
): Promise<PricingTier[]> {
  const response = await fetchApi<{ success: boolean; data: PricingTier[] }>(
    `/api/pricing-tiers/invitation-type/${invitationType}`
  );
  return response.data;
}

/**
 * Create a payment transaction
 */
export async function createPaymentTransaction(
  invitationId: string,
  pricingTierId: string,
  jwt: string
): Promise<PaymentTransaction> {
  const response = await fetchApi<{ success: boolean; data: PaymentTransaction }>(
    "/api/payments/create-transaction",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invitationId,
        pricingTierId,
      }),
    }
  );
  return response.data;
}

/**
 * Get payment status by order ID
 */
export async function getPaymentStatus(
  orderId: string,
  jwt: string
): Promise<Payment> {
  const response = await fetchApi<{ success: boolean; data: Payment }>(
    `/api/payments/status/${orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data;
}

/**
 * Get Midtrans configuration
 */
export async function getMidtransConfig(): Promise<MidtransConfig> {
  const response = await fetchApi<{ success: boolean; data: MidtransConfig }>(
    "/api/payments/config"
  );
  return response.data;
}

/**
 * Load Midtrans Snap script
 */
export async function loadMidtransSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.snap) {
      resolve();
      return;
    }

    // Check if script tag already exists
    if (document.querySelector('script[src*="snap.js"]')) {
      // Wait for it to load
      const checkSnap = () => {
        if (window.snap) {
          resolve();
        } else {
          setTimeout(checkSnap, 100);
        }
      };
      checkSnap();
      return;
    }

    // Load the script
    getMidtransConfig()
      .then((config) => {
        const script = document.createElement("script");
        script.src = config.snapUrl;
        script.setAttribute("data-client-key", config.clientKey);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
        document.head.appendChild(script);
      })
      .catch(reject);
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "IDR"): string {
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number
): number {
  return Math.round(originalPrice * (1 - discountPercentage / 100));
}
