// src/app/invitations/new/page.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createInvitation, getThemes } from "@/lib/strapi";
import { Theme } from "@/types/theme";
import { Palette } from "lucide-react";

export default function NewInvitationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // State to handle creation loading
  const [error, setError] = useState<string | null>(null);
  const [selectedInvitationType, setSelectedInvitationType] = useState<"Wedding" | "Event">("Wedding");

  // Filter themes based on selected invitation type
  const filteredThemes = themes.filter(theme => {
    // Convert theme invitationType to match our format (theme uses lowercase, we use capitalized)
    const themeType = theme.invitationType === "wedding" ? "Wedding" : "Event";
    return themeType === selectedInvitationType;
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchThemes = async () => {
      try {
        const themesData = await getThemes();
        setThemes(themesData);
      } catch (err: any) {
        setError("Failed to load themes. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [session, status, router]);

  const handleThemeSelect = async (themeDocumentId: string) => {
    if (!session) return;
    setIsCreating(true);
    setError(null);

    try {
      const userId = (session.user as any)?.id;
      const jwt = (session.user as any)?.jwt;

      if (!userId || !jwt) {
        throw new Error("Authentication error. Please log in again.");
      }

      const newInvitation = await createInvitation(themeDocumentId, userId, jwt, selectedInvitationType);
      // Redirect to the editor page for the new invitation
      router.push(`/invitations/editor/${newInvitation.documentId}`);
    } catch (err: any) {
      setError(err.message || "Could not create invitation.");
      setIsCreating(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="text-center p-10">Loading Themes...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Create a New Invitation
            </h1>
            <p className="text-lg text-gray-600">
              Choose a theme to get started
            </p>
          </div>

          {/* Compact Invitation Type Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSelectedInvitationType("Wedding")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedInvitationType === "Wedding"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Wedding
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvitationType("Event")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedInvitationType === "Event"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Event
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 bg-red-100 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="text-blue-500 text-center p-4">
            Creating your {selectedInvitationType.toLowerCase()} invitation...
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {selectedInvitationType} Themes
          </h2>
          <p className="text-gray-600">
            Select a theme for your {selectedInvitationType.toLowerCase()} invitation
          </p>
        </div>

        {filteredThemes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedInvitationType} Themes Available
            </h3>
            <p className="text-gray-500 mb-4">
              We're working on adding more themes for {selectedInvitationType.toLowerCase()} invitations.
            </p>
            <button
              onClick={() => setSelectedInvitationType(selectedInvitationType === "Wedding" ? "Event" : "Wedding")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Try {selectedInvitationType === "Wedding" ? "Event" : "Wedding"} themes instead
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${isCreating ? "opacity-50 pointer-events-none" : ""}`}
          >
            {filteredThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="border rounded-lg bg-white shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 w-full text-left"
              onClick={() => handleThemeSelect(theme.documentId)}
            >
              <div className="relative w-full h-60">
                <Image
                  src={
                    theme.thumbnailUrl ||
                    "https://placehold.co/600x400/EEE/31343C?text=No+Image"
                  }
                  alt={theme.themeName}
                  layout="fill"
                  objectFit="cover"
                  className="bg-gray-200"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {theme.themeName}
                </h2>
              </div>
            </button>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
