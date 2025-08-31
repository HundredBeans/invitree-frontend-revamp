"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { getInvitationById, updateInvitation } from "@/lib/strapi";
import type { Invitation } from "@/types/invitation";

export default function InvitationEditorPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- NEW: Separate state for top-level fields ---
  const [invitationTitle, setInvitationTitle] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [formData, setFormData] = useState<any>({}); // For the dynamic 'content'

  const fetchInvitationData = useCallback(async () => {
    if (!documentId || !session) return;
    try {
      const jwt = (session.user as any)?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");
      const data = await getInvitationById(documentId, jwt);
      setInvitation(data);

      // Initialize all form states
      setInvitationTitle(data.invitationTitle);
      setInvitationUrl(data.invitationUrl);

      let initialFormData = data.content || {};
      const blueprint = data.theme?.structure_blueprint;

      if (blueprint && blueprint.sections) {
        blueprint.sections.forEach((section: any) => {
          section.fields.forEach((field: any) => {
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
              initialFormData[section.id][field.id] = data[topLevelDataKey];
            }
          });
        });
      }
      setFormData(initialFormData);
    } catch (err: any) {
      console.error(err);
      setError(
        "Failed to load invitation data. You may not have permission to view this.",
      );
    } finally {
      setLoading(false);
    }
  }, [documentId, session]);

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
    setFormData((prevData: any) => ({
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
    setError(null);

    try {
      const jwt = (session.user as any)?.jwt;
      if (!jwt) throw new Error("Authentication token not found.");

      // --- NEW: Combine all data for the update payload ---
      const updatePayload = {
        invitationTitle,
        invitationUrl,
        content: formData,
      };

      await updateInvitation(documentId, updatePayload, jwt);
      alert("Invitation saved successfully!");

      // Refetch data to get the latest state (e.g., updated title in the header)
      const updatedData = await getInvitationById(documentId, jwt);
      setInvitation(updatedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save invitation.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return <div className="text-center p-10">Loading Editor...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!invitation) {
    return <div className="text-center p-10">Invitation not found.</div>;
  }

  const blueprint = invitation.theme?.structure_blueprint;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Editing: {invitation.invitationTitle}
            </h1>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="space-y-8">
            {/* --- NEW "GENERAL SETTINGS" SECTION --- */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                General Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="invitationTitle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Invitation Title
                  </label>
                  <input
                    type="text"
                    id="invitationTitle"
                    value={invitationTitle}
                    onChange={(e) => setInvitationTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="invitationUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Invitation URL
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      invitree.id/
                    </span>
                    <input
                      type="text"
                      id="invitationUrl"
                      value={invitationUrl}
                      onChange={(e) => setInvitationUrl(e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- DYNAMIC THEME SECTIONS --- */}
            {blueprint && blueprint.sections ? (
              blueprint.sections.map((section: any) => (
                <div key={section.id}>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    {section.name}
                  </h2>
                  <div className="space-y-4">
                    {section.fields.map((field: any) => (
                      <div key={field.id}>
                        <label
                          htmlFor={`${section.id}-${field.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            id={`${section.id}-${field.id}`}
                            rows={4}
                            placeholder={field.placeholder}
                            value={formData[section.id]?.[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                section.id,
                                field.id,
                                e.target.value,
                              )
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        ) : (
                          <input
                            type={field.type}
                            id={`${section.id}-${field.id}`}
                            placeholder={field.placeholder}
                            value={formData[section.id]?.[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                section.id,
                                field.id,
                                e.target.value,
                              )
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                This theme has no editable fields defined.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
