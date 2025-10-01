"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  ExternalLink, 
  Edit, 
  Sparkles,
  Info,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { getPaymentStatus } from "@/lib/payment-api";
import { getUserInvitations } from "@/lib/strapi";
import type { Payment } from "@/types/payment";
import type { Invitation } from "@/types/invitation";

type PaymentStatus = 'success' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'expired';

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;

  useEffect(() => {
    async function loadPaymentData() {
      // Wait for session to finish loading
      if (sessionStatus === "loading") {
        return;
      }

      if (!orderId) {
        setError("Missing order ID");
        setLoading(false);
        return;
      }

      if (!session?.user?.jwt) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Get payment status
        const paymentData = await getPaymentStatus(orderId, session.user.jwt);
        setPayment(paymentData);

        // Get updated invitation data if payment is successful
        if (paymentData.status === "success") {
          const invitations = await getUserInvitations(session.user.id, session.user.jwt);
          const updatedInvitation = invitations.find(inv => 
            inv.documentId === paymentData.orderId.split('-')[1]
          );
          if (updatedInvitation) {
            setInvitation(updatedInvitation);
          }
        }
      } catch (err) {
        console.error("Failed to load payment data:", err);
        setError("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    }

    loadPaymentData();
  }, [orderId, session, sessionStatus]);

  const checkPaymentStatus = async () => {
    if (!orderId || !session?.user?.jwt) return;
    
    setChecking(true);
    try {
      const paymentData = await getPaymentStatus(orderId, session.user.jwt);
      setPayment(paymentData);
      
      // Reload invitation data if payment became successful
      if (paymentData.status === "success") {
        const invitations = await getUserInvitations(session.user.id, session.user.jwt);
        const updatedInvitation = invitations.find(inv => 
          inv.documentId === paymentData.orderId.split('-')[1]
        );
        if (updatedInvitation) {
          setInvitation(updatedInvitation);
        }
      }
    } catch (err) {
      console.error("Failed to check payment status:", err);
    } finally {
      setChecking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Loading payment information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Information Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">{error || "Payment information not found"}</p>
            <Link href="/invitations">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = payment.status as PaymentStatus;

  // Success state
  if (status === 'success') {
    const tierName = payment.pricingTier?.displayName || "Premium";
    const tierFeatures = payment.pricingTier?.features || [];
    const tierDescription = payment.pricingTier?.description || "Your invitation has been upgraded";

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Header */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
                <p className="text-green-700">Upgraded to {tierName}</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {/* Show tier features if available */}
                {tierFeatures.length > 0 && (
                  <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Features Now Available:
                    </h4>
                    <div className="grid gap-2 text-left">
                      {tierFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <p className="font-mono text-xs">{payment.orderId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: payment.currency,
                        minimumFractionDigits: 0,
                      }).format(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="text-green-600 font-semibold">Paid</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Just now"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {invitation && (
                    <Link href={`/${invitation.invitationUrl}`} target="_blank">
                      <Button className="w-full bg-[#154fc0] hover:bg-[#0039a4]">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Your Published Invitation
                      </Button>
                    </Link>
                  )}
                  
                  <Link href="/invitations">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>

                  {invitation && (
                    <Link href={`/invitations/editor/${invitation.documentId}`}>
                      <Button variant="ghost" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Continue Editing
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 What's Next:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Share your invitation link with guests</li>
                    <li>• Your invitation is now active forever - no expiry!</li>
                    <li>• You can still edit content anytime</li>
                    {payment.pricingTier?.tierLevel === 'ultimate' && (
                      <li>• Track RSVPs and manage guest responses</li>
                    )}
                    {(payment.pricingTier?.tierLevel === 'premium' || payment.pricingTier?.tierLevel === 'ultimate') && (
                      <>
                        <li>• Guests can now leave messages for you</li>
                        <li>• Explore premium themes in the editor</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Pending/Processing state
  if (status === 'pending' || status === 'processing') {
    const tierName = payment.pricingTier?.displayName || "Premium";

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Pending Header */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-amber-800">Payment Processing</CardTitle>
                <p className="text-amber-700">Processing your upgrade to {tierName}</p>
                <p className="text-sm text-amber-600 mt-1">Please wait for confirmation</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={checkPaymentStatus}
                  disabled={checking}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {checking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <p className="font-mono text-xs">{payment.orderId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: payment.currency,
                        minimumFractionDigits: 0,
                      }).format(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="text-amber-600 font-semibold capitalize">{payment.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  What's Happening?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Processing</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your payment is being verified by the payment provider</li>
                    <li>• This usually takes a few minutes</li>
                    <li>• You'll receive confirmation once it's complete</li>
                    <li>• No need to make another payment</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">⏰ Typical Processing Times:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Credit/Debit Card: 1-5 minutes</li>
                    <li>• Bank Transfer: 5-15 minutes</li>
                    <li>• E-Wallet: 1-3 minutes</li>
                    <li>• Virtual Account: 5-10 minutes</li>
                  </ul>
                </div>

                <div className="grid gap-3">
                  <Link href="/invitations">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">While You Wait:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Your invitation is still available with watermark</li>
                    <li>• You can continue editing your content</li>
                    <li>• Once payment is confirmed, the watermark will be removed automatically</li>
                    <li>• You'll receive an email confirmation</li>
                  </ul>
                </div>

                {/* Show features they'll get */}
                {payment.pricingTier?.features && payment.pricingTier.features.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Features You'll Get:
                    </h4>
                    <div className="grid gap-2">
                      {payment.pricingTier.features.slice(0, 5).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {payment.pricingTier.features.length > 5 && (
                        <p className="text-xs text-green-600 mt-1">
                          + {payment.pricingTier.features.length - 5} more features
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Failed/Cancelled/Expired state
  const tierName = payment.pricingTier?.displayName || "Premium";

  const getErrorTitle = () => {
    if (status === "cancelled") return "Payment Cancelled";
    if (status === "expired") return "Payment Expired";
    if (status === "failed") return "Payment Failed";
    return "Payment Error";
  };

  const getErrorMessage = () => {
    const tierText = ` for ${tierName} upgrade`;
    if (status === "cancelled") return `You cancelled the payment process${tierText}.`;
    if (status === "expired") return `The payment session has expired${tierText}. Please try again.`;
    if (status === "failed") return `The payment could not be processed${tierText}. Please check your payment method and try again.`;
    return "An error occurred during payment processing.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Error Header */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">{getErrorTitle()}</CardTitle>
              <p className="text-red-700">{getErrorMessage()}</p>
            </CardHeader>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order ID:</span>
                  <p className="font-mono text-xs">{payment.orderId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-semibold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: payment.currency,
                      minimumFractionDigits: 0,
                    }).format(payment.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-red-600 font-semibold capitalize">{payment.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Can You Do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  onClick={() => router.back()} 
                  className="w-full bg-[#154fc0] hover:bg-[#0039a4]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Payment Again
                </Button>
                
                <Link href="/invitations">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Troubleshooting Tips:
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Ensure your payment method has sufficient funds</li>
                  <li>• Try using a different payment method</li>
                  <li>• Clear your browser cache and try again</li>
                  <li>• Contact your bank if the issue persists</li>
                </ul>
              </div>

              {/* Support Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-700 mb-2">
                  If you continue to experience issues, please contact our support team:
                </p>
                <div className="text-sm text-blue-700">
                  <p>📧 Email: support@invitree.id</p>
                  <p>💬 WhatsApp: Available on our website</p>
                  <p>🕒 Response time: Usually within 24 hours</p>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Alternative Options:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Your invitation is still available with watermark</li>
                  <li>• You can continue editing and sharing for free</li>
                  <li>• Upgrade anytime when you're ready</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

