"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getPublicInvitation } from "@/lib/strapi";
import { getTypeFromUrlPrefix, isValidUrlPrefix } from "@/lib/invitation-url-utils";
import { renderThemeComponent, isThemeAvailable } from "@/themes";
import type { Invitation } from "@/types/invitation";

interface InvitationPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlParams, setUrlParams] = useState<{ type: string; slug: string } | null>(null);

  // Await params and set them in state
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setUrlParams(resolvedParams);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    async function fetchInvitation() {
      if (!urlParams) return;

      try {
        setLoading(true);
        setError(null);

        // Validate URL prefix
        if (!isValidUrlPrefix(urlParams.type)) {
          notFound();
          return;
        }

        // Get invitation type from URL prefix
        const invitationType = getTypeFromUrlPrefix(urlParams.type);

        // Fetch the invitation
        const invitationData = await getPublicInvitation(urlParams.slug, invitationType);
        setInvitation(invitationData);
      } catch (err) {
        console.error("Error fetching invitation:", err);
        if (err instanceof Error && err.message.includes("not found")) {
          notFound();
        } else {
          setError("Failed to load invitation. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (urlParams?.type && urlParams?.slug) {
      fetchInvitation();
    }
  }, [urlParams]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No invitation found (this should trigger notFound() but just in case)
  if (!invitation) {
    notFound();
    return null;
  }

  // Render the invitation using the theme component
  return (
    <div className="min-h-screen bg-background">
      {/* Main invitation content */}
      <main>
        {invitation.theme?.slug && isThemeAvailable(invitation.theme.slug) ? (
          // Render using the theme component
          renderThemeComponent(invitation.theme.slug, {
            invitation,
            invitationTitle: invitation.invitationTitle,
            invitationUrl: invitation.invitationUrl,
            isEditable: false, // Public view is not editable
          })
        ) : (
          // Fallback simple display if theme is not available
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {invitation.invitationTitle}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {invitation.invitationType} Invitation
              </p>
              {invitation.eventDate && (
                <p className="text-lg text-muted-foreground mb-8">
                  {new Date(invitation.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
              <div className="bg-card border rounded-lg p-6">
                <p className="text-muted-foreground">
                  This invitation is using a theme that is not currently available.
                  Please contact the invitation creator for more details.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
