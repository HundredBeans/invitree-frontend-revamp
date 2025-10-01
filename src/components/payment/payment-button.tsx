"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import { Loader2, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  createPaymentTransaction,
  getPricingTierByName,
  loadMidtransSnap,
  formatCurrency,
} from "@/lib/payment-api";
import type { PaymentButtonProps, PricingTier } from "@/types/payment";

export function PaymentButton({
  invitationId,
  pricingTierId,
  tierName,
  variant = "default",
  size = "default",
  className = "",
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: PaymentButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [pricingTier, setPricingTier] = useState<PricingTier | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load pricing tier on mount
  useEffect(() => {
    async function loadPricingTier() {
      if (!tierName) return;

      try {
        const tier = await getPricingTierByName(tierName);
        setPricingTier(tier);
      } catch (error) {
        console.error("Failed to load pricing tier:", error);
        toast.error("Failed to load pricing information");
      }
    }

    loadPricingTier();
  }, [tierName]);

  // Load Midtrans Snap script
  useEffect(() => {
    async function initializeSnap() {
      try {
        await loadMidtransSnap();
        setSnapLoaded(true);
      } catch (error) {
        console.error("Failed to load Midtrans Snap:", error);
        toast.error("Payment system unavailable");
      }
    }

    initializeSnap();
  }, []);

  const handlePayment = async () => {
    if (!session?.user?.jwt) {
      toast.error("Please log in to make a payment");
      return;
    }

    if (!snapLoaded) {
      toast.error("Payment system is still loading");
      return;
    }

    if (!pricingTier) {
      toast.error("Pricing information not available");
      return;
    }

    setIsLoading(true);
    onPaymentStart?.();

    try {
      // Create payment transaction
      const transaction = await createPaymentTransaction(
        invitationId,
        pricingTierId,
        session.user.jwt
      );

      // Open Midtrans Snap payment
      window.snap.pay(transaction.snapToken, {
        onSuccess: (result) => {
          console.log("Payment success:", result);
          toast.success("Payment successful! Your invitation is now published.");
          onPaymentSuccess?.(result);
        },
        onPending: (result) => {
          console.log("Payment pending:", result);
          toast.info("Payment is being processed. Please wait for confirmation.");
        },
        onError: (result) => {
          console.error("Payment error:", result);
          toast.error("Payment failed. Please try again.");
          onPaymentError?.(result.status_message || "Payment failed");
        },
        onClose: () => {
          console.log("Payment popup closed");
          toast.info("Payment cancelled");
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      onPaymentError?.(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (!pricingTier) return "Loading...";

    return `${pricingTier.displayName} - ${formatCurrency(pricingTier.price, pricingTier.currency)}`;
  };

  const getButtonIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;

    if (pricingTier?.tierLevel === 'free') {
      return <Sparkles className="h-4 w-4" />;
    }

    return <Crown className="h-4 w-4" />;
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !pricingTier || !snapLoaded}
      variant={variant}
      size={size}
      className={className}
    >
      {getButtonIcon()}
      <span className="ml-2">{getButtonText()}</span>
    </Button>
  );
}
