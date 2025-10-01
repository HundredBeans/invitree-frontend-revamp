"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Crown, Sparkles, Check } from "lucide-react";
import { getPricingTiersByInvitationType, formatCurrency } from "@/lib/payment-api";
import type { PaymentStatusCardProps, PricingTier } from "@/types/payment";
import Link from "next/link";

export function PaymentStatusCard({ invitation, className = "" }: PaymentStatusCardProps) {
  const [freeTier, setFreeTier] = useState<PricingTier | null>(null);
  const [basicTier, setBasicTier] = useState<PricingTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        // Get the invitation type from the invitation object
        // Default to 'Wedding' if not specified
        const invitationType = (invitation as any).invitationType || 'Wedding';
        const tiers = await getPricingTiersByInvitationType(invitationType);

        // Find the free and basic tiers
        const free = tiers.find(t => t.tierLevel === 'free');
        const basic = tiers.find(t => t.tierLevel === 'basic');

        setFreeTier(free || null);
        setBasicTier(basic || null);
      } catch (error) {
        console.error("Failed to load pricing:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, [invitation]);

  // Don't show card for published invitations
  if (invitation.invitationStatus === "published") {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-green-600" />
            <CardTitle className="text-sm font-medium text-green-800">Premium Active</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Published
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            Your invitation is live and professional - no watermark!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ${className}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-sm text-amber-700">Loading pricing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-medium text-amber-800">
            {freeTier?.displayName || 'Free Plan'}
          </CardTitle>
        </div>
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          Draft
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-amber-900 mb-2">Ready to go premium?</h3>
          <p className="text-sm text-amber-700 mb-3">
            {basicTier?.description || 'Remove the watermark and make your invitation look completely professional.'}
          </p>
        </div>

        {/* Current Features (from Free Tier) */}
        {freeTier && freeTier.features && freeTier.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-amber-800 uppercase tracking-wide">
              Current Features
            </h4>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-amber-700">
              {freeTier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Benefits (from Basic Tier) */}
        {basicTier && basicTier.features && basicTier.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-amber-800 uppercase tracking-wide">
              Upgrade to {basicTier.displayName}
            </h4>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-amber-700">
              {basicTier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Display */}
        {basicTier && (
          <div className="bg-white/50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-900">Upgrade Price</span>
              {basicTier.discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {basicTier.discountPercentage}% OFF
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#154fc0]">
                {formatCurrency(basicTier.price, basicTier.currency)}
              </span>
              {basicTier.originalPrice && basicTier.originalPrice > basicTier.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(basicTier.originalPrice, basicTier.currency)}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-600 mt-1">One-time payment • Lifetime access</p>
          </div>
        )}

        {/* Upgrade Button */}
        <Link href={`/invitations/upgrade/${invitation.id}`}>
          <Button
            size="default"
            className="w-full bg-[#154fc0] hover:bg-[#0039a4]"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </Link>

        {/* Future Features Teaser */}
        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-600 text-center">
            More tiers available: Premium & Ultimate with RSVP, Themes, and more!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
