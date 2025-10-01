"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PricingTierSelector } from "@/components/payment/pricing-tier-selector";
import { getInvitationById } from "@/lib/strapi";
import { useErrorHandler } from "@/hooks/use-error-handler";
import type { Invitation } from "@/types/invitation";
import Link from "next/link";

export default function UpgradePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { handleError } = useErrorHandler();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvitation() {
      if (status === "loading") return;
      
      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      if (!params.id || !session?.user?.jwt) return;

      try {
        setIsLoading(true);
        const data = await getInvitationById(params.id as string, session.user.jwt);
        setInvitation(data);
      } catch (error) {
        handleError(error, "Failed to load invitation");
        router.push("/invitations");
      } finally {
        setIsLoading(false);
      }
    }

    loadInvitation();
  }, [params.id, session, status, router, handleError]);

  if (isLoading || status === "loading") {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The invitation you're looking for doesn't exist or you don't have permission to access it.
            </p>
            <Link href="/invitations">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invitations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already published, redirect to editor
  if (invitation.invitationStatus === "published") {
    router.push(`/invitations/editor/${invitation.documentId}`);
    return null;
  }

  // Get invitation type, default to 'Wedding' if not specified
  const invitationType = (invitation as any).invitationType || 'Wedding';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/invitations">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invitations
          </Button>
        </Link>
        
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold mb-2">Upgrade Your Invitation</h1>
          <p className="text-xl text-gray-600">
            {invitation.invitationTitle}
          </p>
        </div>
      </div>

      {/* Pricing Selector */}
      <PricingTierSelector
        invitationId={invitation.documentId}
        invitationType={invitationType}
        onPaymentSuccess={() => {
          // Redirect to editor after successful payment
          router.push(`/invitations/editor/${invitation.documentId}`);
        }}
        onPaymentError={(error) => {
          console.error("Payment error:", error);
        }}
      />

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Why Upgrade?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div>
              <h3 className="font-semibold mb-2">✨ Professional Appearance</h3>
              <p className="text-sm text-gray-600">
                Remove the "Created with invitree.id" watermark and make your invitation look completely professional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎨 Premium Features</h3>
              <p className="text-sm text-gray-600">
                Access exclusive themes, dual language support, background music, video support, and more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📊 RSVP Management</h3>
              <p className="text-sm text-gray-600">
                Track guest responses, manage attendance, and get real-time updates with our Ultimate tier.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💎 Lifetime Access</h3>
              <p className="text-sm text-gray-600">
                One-time payment, no recurring fees. Your invitation stays live forever.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔒 Secure Payment</h3>
              <p className="text-sm text-gray-600">
                Powered by Midtrans, Indonesia's leading payment gateway. Your payment is safe and secure.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

