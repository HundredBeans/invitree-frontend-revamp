"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { formatCurrency } from "@/lib/payment-api";
import type { PricingTier } from "@/types/payment";

interface PricingTierCardProps {
  tier: PricingTier;
  onSelect: (tier: PricingTier) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingTierCard({
  tier,
  onSelect,
  isSelected = false,
  isLoading = false,
  disabled = false,
}: PricingTierCardProps) {
  const getTierIcon = () => {
    switch (tier.tierLevel) {
      case 'free':
        return <Sparkles className="h-5 w-5 text-gray-500" />;
      case 'basic':
        return <Check className="h-5 w-5 text-blue-500" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'ultimate':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTierColor = () => {
    switch (tier.tierLevel) {
      case 'free':
        return 'border-gray-200';
      case 'basic':
        return 'border-blue-200';
      case 'premium':
        return 'border-purple-300 shadow-lg';
      case 'ultimate':
        return 'border-yellow-300 shadow-xl';
      default:
        return 'border-gray-200';
    }
  };

  const getButtonText = () => {
    if (tier.tierLevel === 'free') {
      return 'Start Free';
    }
    return `Choose ${tier.displayName}`;
  };

  const getButtonVariant = () => {
    if (tier.tierLevel === 'premium') {
      return 'default';
    }
    return 'outline';
  };

  return (
    <Card 
      className={`relative ${getTierColor()} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${tier.isPopular ? 'border-2' : ''}`}
    >
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          {getTierIcon()}
        </div>
        <CardTitle className="text-xl">{tier.displayName}</CardTitle>
        <CardDescription className="text-sm">{tier.description}</CardDescription>
        
        <div className="mt-4">
          {tier.price === 0 ? (
            <div className="text-3xl font-bold">Free</div>
          ) : (
            <>
              <div className="text-3xl font-bold">
                {formatCurrency(tier.price, tier.currency)}
              </div>
              {tier.originalPrice && tier.originalPrice > tier.price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(tier.originalPrice, tier.currency)}
                </div>
              )}
              {tier.discountPercentage > 0 && (
                <div className="text-sm text-green-600 font-semibold">
                  Save {tier.discountPercentage}%
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onSelect(tier)}
          disabled={disabled || isLoading}
          variant={getButtonVariant()}
          className={`w-full ${
            tier.tierLevel === 'premium' 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' 
              : ''
          }`}
        >
          {isLoading ? 'Processing...' : getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}

