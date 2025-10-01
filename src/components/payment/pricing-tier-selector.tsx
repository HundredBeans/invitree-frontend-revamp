"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PricingTierCard } from "./pricing-tier-card";
import { 
  getPricingTiersByInvitationType, 
  createPaymentTransaction,
  loadMidtransSnap 
} from "@/lib/payment-api";
import type { PricingTier, InvitationType } from "@/types/payment";

interface PricingTierSelectorProps {
  invitationId: string;
  invitationType: InvitationType;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PricingTierSelector({
  invitationId,
  invitationType,
  onPaymentSuccess,
  onPaymentError,
}: PricingTierSelectorProps) {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load pricing tiers
  useEffect(() => {
    async function loadTiers() {
      try {
        const data = await getPricingTiersByInvitationType(invitationType);
        // Sort by tier level: free, basic, premium, ultimate
        const sortOrder = { free: 0, basic: 1, premium: 2, ultimate: 3 };
        const sorted = data.sort((a, b) => sortOrder[a.tierLevel] - sortOrder[b.tierLevel]);
        setTiers(sorted);
      } catch (error) {
        console.error("Failed to load pricing tiers:", error);
        toast.error("Failed to load pricing options");
      } finally {
        setIsLoading(false);
      }
    }

    loadTiers();
  }, [invitationType]);

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

  const handleTierSelect = async (tier: PricingTier) => {
    if (!session?.user?.jwt) {
      toast.error("Please log in to upgrade");
      return;
    }

    // Free tier doesn't require payment
    if (tier.tierLevel === 'free') {
      toast.info("You're already on the free tier!");
      return;
    }

    if (!snapLoaded) {
      toast.error("Payment system is still loading");
      return;
    }

    setSelectedTier(tier);
    setIsProcessing(true);

    try {
      // Create payment transaction
      const transaction = await createPaymentTransaction(
        invitationId,
        tier.documentId,
        session.user.jwt
      );

      // Open Midtrans Snap payment
      window.snap.pay(transaction.snapToken, {
        onSuccess: (result) => {
          console.log("Payment success:", result);
          toast.success(`Successfully upgraded to ${tier.displayName}!`);
          onPaymentSuccess?.();
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
          setIsProcessing(false);
          setSelectedTier(null);
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      onPaymentError?.(error instanceof Error ? error.message : "Payment failed");
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pricing tiers available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the perfect tier for your {invitationType.toLowerCase()} invitation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            onSelect={handleTierSelect}
            isSelected={selectedTier?.id === tier.id}
            isLoading={isProcessing && selectedTier?.id === tier.id}
            disabled={isProcessing}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>All prices are in Indonesian Rupiah (IDR)</p>
        <p>Secure payment powered by Midtrans</p>
      </div>
    </div>
  );
}

