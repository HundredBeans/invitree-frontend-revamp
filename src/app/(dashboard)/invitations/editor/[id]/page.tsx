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
import type { Invitation, InvitationContent } from "@/types/invitation";
import type { ThemeField, ThemeSection } from "@/types/theme";

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

  const fetchInvitationData = useCallback(async () => {
    if (!documentId || !session) return;
    try {
      const jwt = session.user?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");
      const data = await getInvitationById(documentId, jwt);
      setInvitation(data);

      // Initialize all form states
      setInvitationTitle(data.invitationTitle);
      setInvitationUrl(data.invitationUrl);

      const initialFormData = data.content || {};
      const blueprint = data.theme?.structure_blueprint;

      if (blueprint?.sections) {
        blueprint.sections.forEach((section: ThemeSection) => {
          section.fields.forEach((field: ThemeField) => {
            const topLevelDataKey = field.inferredFrom as keyof Invitation;
            if (
              field.inferredFrom &&
              data[topLevelDataKey] &&
              (!initialFormData[section.id] ||
                !initialFormData[section.id][field.id])
            ) {
              if (!initialFormData[section.id]) {
                initialFormData[section.id] = {};
              }
              const value = data[topLevelDataKey];
              // Ensure we only assign string values to form fields
              initialFormData[section.id][field.id] =
                typeof value === "string" ? value : String(value);
            }
          });
        });
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

      // --- NEW: Combine all data for the update payload ---
      const updatePayload = {
        invitationTitle,
        invitationUrl,
        content: formData,
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

  const blueprint = invitation.theme?.structure_blueprint;

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Editing: {invitation.invitationTitle}
          </h1>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Column */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-xl font-semibold">Edit Content</h2>
            </CardHeader>
          <CardContent className="space-y-8">
            {/* --- NEW "GENERAL SETTINGS" SECTION --- */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 border-b pb-2">
                General Settings
              </h2>
              <div className="space-y-4">
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
                  helperText="This will be the URL slug for your invitation (e.g., /my-wedding)"
                />
              </div>
            </div>

            {/* --- DYNAMIC THEME SECTIONS --- */}
            {blueprint?.sections ? (
              blueprint.sections.map((section: ThemeSection) => (
                <div key={section.id}>
                  <h2 className="text-xl font-semibold text-foreground mb-4 border-b pb-2">
                    {section.name}
                  </h2>
                  <div className="space-y-4">
                    {section.fields.map((field: ThemeField) => (
                      <div key={field.id}>
                        {field.type === "textarea" ? (
                          <FormTextarea
                            id={`${section.id}-${field.id}`}
                            label={field.label}
                            placeholder={field.placeholder}
                            rows={4}
                            value={formData[section.id]?.[field.id] || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) =>
                              handleInputChange(
                                section.id,
                                field.id,
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          <FormInput
                            type={field.type}
                            id={`${section.id}-${field.id}`}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={formData[section.id]?.[field.id] || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              handleInputChange(
                                section.id,
                                field.id,
                                e.target.value,
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                This theme has no editable fields defined.
              </p>
            )}
            </CardContent>
          </Card>

          {/* Preview Column */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <InvitationPreview
              invitation={invitation}
              formData={formData}
              invitationTitle={invitationTitle}
              invitationUrl={invitationUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
