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
  FormTextarea,
} from "@/components/ui";
import { InvitationPreview } from "@/components/invitation-preview";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { getInvitationById, updateInvitation } from "@/lib/strapi";
import {
  extractFormDataFromTypeSpecificDetails,
  convertFormDataToTypeSpecificDetails
} from "@/lib/theme-helpers";
import type { Invitation, InvitationContent } from "@/types/invitation";
import {
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Heart,
  MessageSquare,
  Users,
  Calendar,
  Info
} from "lucide-react";

type EditorSection = "basic" | "cover" | "opening" | "couple" | "events" | "additional";

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

  // Floating editor panel state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSection>("basic");
  const [expandedSections, setExpandedSections] = useState<Set<EditorSection>>(new Set(["basic"]));
  const [pendingFieldFocus, setPendingFieldFocus] = useState<{section: string, field: string} | null>(null);

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

  // Helper functions for floating editor
  const toggleSection = (section: EditorSection) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionIcon = (section: EditorSection) => {
    switch (section) {
      case "basic": return Edit3;
      case "cover": return Heart;
      case "opening": return MessageSquare;
      case "couple": return Users;
      case "events": return Calendar;
      case "additional": return Info;
      default: return Edit3;
    }
  };

  const getSectionTitle = (section: EditorSection) => {
    switch (section) {
      case "basic": return "Basic Information";
      case "cover": return "Cover Section";
      case "opening": return "Opening Section";
      case "couple": return "Couple Details";
      case "events": return "Event Details";
      case "additional": return "Additional Information";
      default: return "Section";
    }
  };

  // Handle field clicks from the preview
  const handleFieldClick = (section: string, field: string) => {
    // Map section names to EditorSection types
    const getSectionKey = (sectionName: string): EditorSection => {
      switch (sectionName) {
        case "cover": return "cover";
        case "opening": return "opening";
        case "groomDetails": return "couple";
        case "eventDetails": return "events";
        case "additional": return "additional";
        default: return "basic";
      }
    };

    // Expand the relevant section
    const sectionKey = getSectionKey(section);
    const newExpanded = new Set(expandedSections);
    newExpanded.add(sectionKey);
    setExpandedSections(newExpanded);

    // Set pending field focus
    setPendingFieldFocus({ section, field });

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

      let initialFormData = data.content || {};

      // If we have typeSpecificDetails, extract form data from it
      if (data.typeSpecificDetails && data.typeSpecificDetails.length > 0) {
        const extractedFormData = extractFormDataFromTypeSpecificDetails(data.typeSpecificDetails);
        // Use typeSpecificDetails as the primary source
        initialFormData = extractedFormData;
      }

      setFormData(initialFormData);
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

  const handleInputChange = (
    sectionId: string,
    fieldId: string,
    value: string,
  ) => {
    setFormData((prevData: InvitationContent) => ({
      ...prevData,
      [sectionId]: {
        ...prevData[sectionId],
        [fieldId]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!documentId || !session) return;
    setIsSaving(true);

    try {
      const jwt = session.user?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");

      // Convert form data to typeSpecificDetails structure
      const typeSpecificDetails = convertFormDataToTypeSpecificDetails(
        formData,
        invitation?.typeSpecificDetails
      );

      // --- NEW: Combine all data for the update payload ---
      const updatePayload = {
        invitationTitle,
        invitationUrl,
        content: formData,
        typeSpecificDetails,
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
                <>
                  {/* Cover Section */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("cover")}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">Cover Section</span>
                      </div>
                      {expandedSections.has("cover") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.has("cover") && (
                      <div className="p-3 border-t space-y-4">
                        <FormInput
                          id="cover-title"
                          label="Wedding Title"
                          placeholder="e.g., Daffa & Afifa"
                          value={formData.cover?.title || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("cover", "title", e.target.value)
                          }
                        />
                        <FormInput
                          id="cover-subtitle"
                          label="Subtitle"
                          placeholder="e.g., Together Forever"
                          value={formData.cover?.subtitle || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("cover", "subtitle", e.target.value)
                          }
                        />
                        <FormInput
                          id="cover-header"
                          label="Header Text"
                          placeholder="e.g., The wedding of"
                          value={formData.cover?.header || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("cover", "header", e.target.value)
                          }
                        />
                        <FormInput
                          id="cover-subheader"
                          label="Subheader Text"
                          placeholder="e.g., request the honor of your presence"
                          value={formData.cover?.subheader || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("cover", "subheader", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Opening Section */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("opening")}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Opening Section</span>
                      </div>
                      {expandedSections.has("opening") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.has("opening") && (
                      <div className="p-3 border-t space-y-4">
                        <FormTextarea
                          id="opening-quotes"
                          label="Opening Quote or Message"
                          placeholder="Enter a meaningful quote or personal message for your guests"
                          rows={4}
                          value={formData.opening?.quotes || ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("opening", "quotes", e.target.value)
                          }
                        />
                        <FormInput
                          type="url"
                          id="opening-decorationUrl"
                          label="Decoration Image URL"
                          placeholder="https://example.com/decoration.png"
                          value={formData.opening?.decorationUrl || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("opening", "decorationUrl", e.target.value)
                          }
                        />
                        <FormInput
                          type="url"
                          id="opening-imageUrl"
                          label="Opening Section Image URL"
                          placeholder="https://example.com/opening-image.jpg"
                          value={formData.opening?.imageUrl || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("opening", "imageUrl", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Couple Details Section */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("couple")}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Couple Details</span>
                      </div>
                      {expandedSections.has("couple") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.has("couple") && (
                      <div className="p-3 border-t space-y-6">
                        {/* Groom Details */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Groom</h4>
                          <div className="space-y-3">
                            <FormInput
                              id="groomDetails-groomName"
                              label="Groom's Name"
                              placeholder="e.g., Daffa"
                              value={formData.groomDetails?.groomName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "groomName", e.target.value)
                              }
                            />
                            <FormInput
                              id="groomDetails-groomFullName"
                              label="Groom's Full Name"
                              placeholder="e.g., Mohammad Daffa"
                              value={formData.groomDetails?.groomFullName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "groomFullName", e.target.value)
                              }
                            />
                            <FormInput
                              type="url"
                              id="groomDetails-groomImageUrl"
                              label="Groom's Photo URL"
                              placeholder="https://example.com/groom-photo.jpg"
                              value={formData.groomDetails?.groomImageUrl || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "groomImageUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Bride Details */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Bride</h4>
                          <div className="space-y-3">
                            <FormInput
                              id="groomDetails-brideName"
                              label="Bride's Name"
                              placeholder="e.g., Afifa"
                              value={formData.groomDetails?.brideName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "brideName", e.target.value)
                              }
                            />
                            <FormInput
                              id="groomDetails-brideFullName"
                              label="Bride's Full Name"
                              placeholder="e.g., Afifa Atira"
                              value={formData.groomDetails?.brideFullName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "brideFullName", e.target.value)
                              }
                            />
                            <FormInput
                              type="url"
                              id="groomDetails-brideImageUrl"
                              label="Bride's Photo URL"
                              placeholder="https://example.com/bride-photo.jpg"
                              value={formData.groomDetails?.brideImageUrl || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("groomDetails", "brideImageUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Details Section */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("events")}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Event Details</span>
                      </div>
                      {expandedSections.has("events") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.has("events") && (
                      <div className="p-3 border-t space-y-6">
                        {/* Akad Event */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Akad</h4>
                          <div className="space-y-3">
                            <FormInput
                              id="eventDetails-akadEventName"
                              label="Akad Event Name"
                              placeholder="e.g., Akad Nikah"
                              value={formData.eventDetails?.akadEventName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "akadEventName", e.target.value)
                              }
                            />
                            <FormInput
                              type="datetime-local"
                              id="eventDetails-akadDatetimeStart"
                              label="Akad Start Date & Time"
                              value={formData.eventDetails?.akadDatetimeStart || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "akadDatetimeStart", e.target.value)
                              }
                            />
                            <FormInput
                              type="datetime-local"
                              id="eventDetails-akadDatetimeEnd"
                              label="Akad End Date & Time"
                              value={formData.eventDetails?.akadDatetimeEnd || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "akadDatetimeEnd", e.target.value)
                              }
                            />
                            <FormInput
                              id="eventDetails-akadLocation"
                              label="Akad Location"
                              placeholder="e.g., Masjid Istiqlal"
                              value={formData.eventDetails?.akadLocation || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "akadLocation", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Reception Event */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Reception</h4>
                          <div className="space-y-3">
                            <FormInput
                              id="eventDetails-resepsiEventName"
                              label="Reception Event Name"
                              placeholder="e.g., Resepsi"
                              value={formData.eventDetails?.resepsiEventName || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "resepsiEventName", e.target.value)
                              }
                            />
                            <FormInput
                              type="datetime-local"
                              id="eventDetails-resepsiDatetimeStart"
                              label="Reception Start Date & Time"
                              value={formData.eventDetails?.resepsiDatetimeStart || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "resepsiDatetimeStart", e.target.value)
                              }
                            />
                            <FormInput
                              type="datetime-local"
                              id="eventDetails-resepsiDatetimeEnd"
                              label="Reception End Date & Time"
                              value={formData.eventDetails?.resepsiDatetimeEnd || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "resepsiDatetimeEnd", e.target.value)
                              }
                            />
                            <FormInput
                              id="eventDetails-resepsiLocation"
                              label="Reception Location"
                              placeholder="e.g., Grand Ballroom"
                              value={formData.eventDetails?.resepsiLocation || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleInputChange("eventDetails", "resepsiLocation", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information Section */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("additional")}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Additional Information</span>
                      </div>
                      {expandedSections.has("additional") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.has("additional") && (
                      <div className="p-3 border-t space-y-4">
                        <FormTextarea
                          id="additional-additionalNote"
                          label="Additional Notes"
                          placeholder="Any additional information for your guests"
                          rows={4}
                          value={formData.additional?.additionalNote || ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("additional", "additionalNote", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
