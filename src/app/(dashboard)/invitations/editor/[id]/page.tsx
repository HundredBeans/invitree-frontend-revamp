"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormInput,
} from "@/components/ui";
import { InvitationPreview } from "@/components/invitation-preview";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { getInvitationById, updateInvitation } from "@/lib/strapi";
import type { Invitation, InvitationContent } from "@/types/invitation";
import { FormRenderer } from "@/components/form-renderer";
import { weddingFormSections } from "@/config/wedding-form-config";
import {
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function InvitationEditorPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { handleError, showSuccess } = useErrorHandler();

  // --- NEW: Separate state for top-level fields ---
  const [invitationTitle, setInvitationTitle] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [formData, setFormData] = useState<InvitationContent>({}); // For the dynamic 'content'
  const [typeSpecificDetails, setTypeSpecificDetails] = useState<any>(null); // Direct API structure

  // Floating editor panel state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["basic"]));
  const [pendingFieldFocus, setPendingFieldFocus] = useState<{section: string, field: string, arrayIndex?: number} | null>(null);

  // Effect to handle field focusing after section expansion
  useEffect(() => {
    if (pendingFieldFocus && isEditorOpen) {
      const { section, field } = pendingFieldFocus;
      const fieldId = `${section}-${field}`;

      // Wait for the DOM to update after section expansion
      const focusField = () => {
        const element = document.getElementById(fieldId);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Add a highlight effect
          element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);

          // Clear the pending focus
          setPendingFieldFocus(null);
        } else {
          // If element still not found, try again
          setTimeout(focusField, 100);
        }
      };

      // Start focusing after a delay
      setTimeout(focusField, 300);
    }
  }, [pendingFieldFocus, isEditorOpen, expandedSections]);

  // Lock/unlock page scroll when editor panel is open/closed
  useEffect(() => {
    if (isEditorOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;

      // Lock scroll and prevent scroll bar jumping
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';

      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = '';
      };
    } else {
      // Ensure scroll is unlocked
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    }
  }, [isEditorOpen]);

  // Effect to handle field focusing
  useEffect(() => {
    if (pendingFieldFocus && isEditorOpen) {
      // Clear the pending focus after a short delay to allow the form to render
      const timer = setTimeout(() => {
        setPendingFieldFocus(null);
      }, 500); // Increased delay to ensure form is rendered
      return () => clearTimeout(timer);
    }
  }, [isEditorOpen, pendingFieldFocus]);

  // Simple helper to get wedding details
  const getWeddingDetails = () => {
    return invitation?.typeSpecificDetails?.[0] as any;
  };

  // Helper functions for floating editor
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Handle field clicks from the preview
  const handleFieldClick = (section: string, field: string) => {
    console.log("Field clicked:", { section, field });

    // Map section names from theme to form config section IDs
    const getSectionKey = (sectionName: string): string => {
      switch (sectionName) {
        case "cover": return "coverSection";
        case "opening": return "openingSection";
        case "groomDetails": return "groomDetails";
        case "eventDetails": return "eventDetails";
        case "additional": return "additional";
        default: return "basic";
      }
    };

    // Expand the relevant section
    const sectionKey = getSectionKey(section);
    console.log("Mapped section key:", sectionKey);

    const newExpanded = new Set(expandedSections);
    newExpanded.add(sectionKey);
    setExpandedSections(newExpanded);

    // For array fields, we need to pass both the index and field name
    // e.g., "0.name" -> { arrayIndex: 0, field: "name" }
    let arrayIndex = null;
    let actualField = field;

    if (field.includes('.')) {
      const parts = field.split('.');
      arrayIndex = parseInt(parts[0]);
      actualField = parts[1];
    }

    // Set pending field focus with the mapped section name, field, and array index
    setPendingFieldFocus({
      section: sectionKey,
      field: actualField,
      arrayIndex: arrayIndex ?? undefined
    });
    console.log("Set pending field focus:", { section: sectionKey, field: actualField, arrayIndex });

    // Open the editor panel
    setIsEditorOpen(true);
  };

  const fetchInvitationData = useCallback(async () => {
    if (!documentId || !session) return;
    try {
      const jwt = session.user?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");
      let data = await getInvitationById(documentId, jwt);

      // Note: Themes should be manually created and registered in Strapi admin dashboard

      setInvitation(data);

      // Initialize all form states
      setInvitationTitle(data.invitationTitle);
      setInvitationUrl(data.invitationUrl);

      // Initialize with existing typeSpecificDetails
      setTypeSpecificDetails(data.typeSpecificDetails);

      // Initialize empty form data - we'll update typeSpecificDetails directly
      setFormData({});
    } catch (err: unknown) {
      console.error(err);
      handleError(
        err,
        "Failed to load invitation data. You may not have permission to view this.",
      );
    } finally {
      setLoading(false);
    }
  }, [documentId, session, handleError]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchInvitationData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, fetchInvitationData, router]);

  // Simple update function that works directly with API structure
  const updateField = (path: string, value: any) => {
    if (!invitation?.typeSpecificDetails?.[0]) return;

    setInvitation(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      const weddingDetails = updated.typeSpecificDetails![0] as any;

      // Simple path-based updates
      const keys = path.split('.');
      let current = weddingDetails;

      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      // Set the final value
      current[keys[keys.length - 1]] = value || null;

      return updated;
    });
  };

  const handleSave = async () => {
    if (!documentId || !session) return;
    setIsSaving(true);

    try {
      const jwt = session.user?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");

      // Use the updated typeSpecificDetails directly - no conversion needed
      const updatePayload = {
        invitationTitle,
        invitationUrl,
        typeSpecificDetails: typeSpecificDetails || invitation?.typeSpecificDetails,
      };

      await updateInvitation(documentId, updatePayload, jwt);
      showSuccess("Invitation saved successfully!");

      // Refetch data to get the latest state (e.g., updated title in the header)
      const updatedData = await getInvitationById(documentId, jwt);
      setInvitation(updatedData);
    } catch (err: unknown) {
      console.error(err);
      handleError(err, "Failed to save invitation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return <div className="text-center p-10">Loading Editor...</div>;
  }

  if (!invitation) {
    return <div className="text-center p-10">Invitation not found.</div>;
  }

  const weddingDetails = invitation.typeSpecificDetails?.[0];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full-width Preview */}
      <div className="w-full h-screen overflow-hidden relative">
        <InvitationPreview
          invitation={invitation}
          formData={formData}
          invitationTitle={invitationTitle}
          invitationUrl={invitationUrl}
          onFieldClick={handleFieldClick}
          isEditable={true}
        />

      </div>

      {/* Floating Editor Button */}
      <Button
        onClick={() => setIsEditorOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Edit3 className="h-6 w-6" />
      </Button>

      {/* Floating Editor Panel */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditorOpen(false)}
          />

          {/* Editor Panel */}
          <div className="relative ml-auto w-full max-w-md h-full bg-background shadow-2xl overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <h2 className="text-lg font-semibold">Edit Invitation</h2>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Basic Information Section */}
              <div className="border rounded-lg">
                <button
                  onClick={() => toggleSection("basic")}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    <span className="font-medium">Basic Information</span>
                  </div>
                  {expandedSections.has("basic") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.has("basic") && (
                  <div className="p-3 border-t space-y-4">
                    <FormInput
                      id="invitationTitle"
                      label="Invitation Title"
                      value={invitationTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInvitationTitle(e.target.value)
                      }
                    />
                    <FormInput
                      id="invitationUrl"
                      label="Invitation URL"
                      value={invitationUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInvitationUrl(e.target.value)
                      }
                      helperText="This will be the URL slug for your invitation"
                    />
                  </div>
                )}
              </div>

              {/* Wedding-specific sections */}
              {weddingDetails && (
                <FormRenderer
                  sections={weddingFormSections}
                  data={getWeddingDetails()}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                  onFieldChange={updateField}
                  pendingFieldFocus={pendingFieldFocus}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
