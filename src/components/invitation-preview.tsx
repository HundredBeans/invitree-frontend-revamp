"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { renderThemeComponent, isThemeAvailable } from "@/themes";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Invitation, InvitationContent } from "@/types/invitation";

type ViewportSize = "mobile" | "tablet" | "desktop";

interface InvitationPreviewProps {
  invitation: Invitation;
  formData: InvitationContent;
  invitationTitle: string;
  invitationUrl: string;
  onFieldClick?: (section: string, field: string) => void;
  isEditable?: boolean;
}

export function InvitationPreview({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  onFieldClick,
  isEditable = false
}: InvitationPreviewProps) {
  const [viewport, setViewport] = React.useState<ViewportSize>("desktop");
  const weddingDetails = invitation.typeSpecificDetails?.[0];

  // Viewport dimensions
  const getViewportStyles = (size: ViewportSize) => {
    switch (size) {
      case "mobile":
        return "w-[375px] min-h-[667px] border border-muted-foreground/20 rounded-lg shadow-lg"; // iPhone SE dimensions
      case "tablet":
        return "w-[768px] min-h-[1024px] border border-muted-foreground/20 rounded-lg shadow-lg"; // iPad dimensions
      case "desktop":
        return "w-full min-h-[600px]"; // Full width
      default:
        return "w-full min-h-[600px]";
    }
  };

  // Helper function to get field value with fallback to typeSpecificDetails
  const getFieldValue = (sectionId: string, fieldId: string): string => {
    const formValue = formData[sectionId]?.[fieldId];
    if (formValue) return formValue;

    // Fallback to typeSpecificDetails for wedding invitations
    if (weddingDetails && invitation.invitationType === "Wedding") {
      switch (`${sectionId}.${fieldId}`) {
        case "cover.title":
          return weddingDetails.coverSection?.title || "";
        case "cover.subtitle":
          return weddingDetails.coverSection?.subtitle || "";
        case "cover.header":
          return weddingDetails.coverSection?.header || "";
        case "cover.subheader":
          return weddingDetails.coverSection?.subheader || "";
        case "opening.quotes":
          return weddingDetails.openingSection?.quotes || "";
        case "opening.decorationUrl":
          return weddingDetails.openingSection?.decorationUrl || "";
        case "opening.imageUrl":
          return weddingDetails.openingSection?.imageUrl || "";
        case "coupleDetails.groomName":
          return weddingDetails.coupleDetails?.find(d => d.gender === "male")?.name || "";
        case "coupleDetails.groomFullName":
          return weddingDetails.coupleDetails?.find(d => d.gender === "male")?.fullName || "";
        case "coupleDetails.brideName":
          return weddingDetails.coupleDetails?.find(d => d.gender === "female")?.name || "";
        case "coupleDetails.brideFullName":
          return weddingDetails.coupleDetails?.find(d => d.gender === "female")?.fullName || "";
        case "eventDetails.akadEventName":
          return weddingDetails.eventDetails?.find(e => e.eventName.toLowerCase().includes("akad"))?.eventName || "";
        case "eventDetails.akadLocation":
          return weddingDetails.eventDetails?.find(e => e.eventName.toLowerCase().includes("akad"))?.eventLocation || "";
        case "eventDetails.resepsiEventName":
          return weddingDetails.eventDetails?.find(e => e.eventName.toLowerCase().includes("resepsi"))?.eventName || "";
        case "eventDetails.resepsiLocation":
          return weddingDetails.eventDetails?.find(e => e.eventName.toLowerCase().includes("resepsi"))?.eventLocation || "";
        case "additional.additionalNote":
          return weddingDetails.additionalNote || "";
        default:
          return "";
      }
    }

    return "";
  };

  // Simplified preview for non-wedding invitations
  const renderSimplePreview = () => {
    return (
      <div className="space-y-6">
        {/* Basic invitation info */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {invitationTitle || "Invitation"}
          </h2>
          <p className="text-muted-foreground">
            Type: {invitation.invitationType}
          </p>
          {invitation.eventDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Date: {new Date(invitation.eventDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Content preview */}
        {Object.keys(formData).length > 0 && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-3">Content Preview:</h3>
            {Object.entries(formData).map(([sectionId, sectionData]) => (
              <div key={sectionId} className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  {sectionId}
                </h4>
                {Object.entries(sectionData).map(([fieldId, value]) => (
                  value && (
                    <div key={fieldId} className="mb-2">
                      <span className="text-xs text-muted-foreground">{fieldId}:</span>
                      <p className="text-sm">{value}</p>
                    </div>
                  )
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };



  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Live Preview
          </CardTitle>

          {/* Viewport Controls */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewport("mobile")}
              className={`p-2 rounded-md transition-colors ${
                viewport === "mobile"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-2 rounded-md transition-colors ${
                viewport === "tablet"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("desktop")}
              className={`p-2 rounded-md transition-colors ${
                viewport === "desktop"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-6">
          {/* Viewport Container */}
          <div className="flex justify-center">
            <div className={`${getViewportStyles(viewport)} mx-auto transition-all duration-300 ease-in-out`}>
              {/* Preview container with invitation styling */}
              <div className={`${viewport === "desktop" ? "bg-gradient-to-br from-background to-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20" : "bg-white"} h-full overflow-hidden`}>
                {/* Viewport indicator - only show for mobile/tablet */}
                {viewport !== "desktop" && (
                  <div className="text-center mb-4 p-2 bg-muted/30">
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      {viewport === "mobile" && (
                        <>
                          <Smartphone className="w-3 h-3" />
                          Mobile (375px)
                        </>
                      )}
                      {viewport === "tablet" && (
                        <>
                          <Tablet className="w-3 h-3" />
                          Tablet (768px)
                        </>
                      )}
                    </div>
                  </div>
                )}
                {/* Main invitation title - only show for desktop */}
                {viewport === "desktop" && (
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
                      {invitationTitle || "Your Invitation Title"}
                    </h1>
                    {invitationUrl && (
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                        invitree.com/{invitationUrl}
                      </div>
                    )}
                  </div>
                )}

                {/* Theme-based content sections */}
                {invitation.invitationType === "Wedding" && weddingDetails && invitation.theme?.slug && isThemeAvailable(invitation.theme.slug) ? (
                  // Use the dedicated wedding theme component for better preview
                  <div className={viewport === "desktop" ? "border rounded-lg overflow-hidden" : "overflow-hidden"}>
                    {renderThemeComponent(invitation.theme.slug, {
                      invitation,
                      formData,
                      invitationTitle,
                      invitationUrl,
                      isEditable,
                      onFieldClick
                    })}
                  </div>
                ) : (
                  // Use simplified preview for all other cases
                  renderSimplePreview()
                )}

                {/* Footer info - only show for desktop */}
                {viewport === "desktop" && (
                  <div className="mt-12 pt-6 border-t border-muted-foreground/20">
                    <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                      <span className="bg-muted/50 rounded-full px-2 py-1">
                        {invitation.invitationType}
                      </span>
                      <span className="bg-muted/50 rounded-full px-2 py-1 capitalize">
                        {invitation.invitationStatus}
                      </span>
                      {invitation.eventDate && (
                        <span className="bg-muted/50 rounded-full px-2 py-1">
                          {new Date(invitation.eventDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
