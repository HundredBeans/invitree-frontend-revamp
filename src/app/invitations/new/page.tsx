// src/app/invitations/new/page.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createInvitation, getThemes } from "@/lib/strapi";
import { Theme } from "@/types/theme";

export default function NewInvitationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // State to handle creation loading
  const [error, setError] = useState<string | null>(null);

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

  const handleThemeSelect = async (themeId: number) => {
    if (!session) return;
    setIsCreating(true);
    setError(null);

    try {
      const userId = (session.user as any)?.id;
      const jwt = (session.user as any)?.jwt;

      if (!userId || !jwt) {
        throw new Error("Authentication error. Please log in again.");
      }

      const newInvitation = await createInvitation(themeId, userId, jwt);
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Create a New Invitation
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose a theme to get started
        </p>

        {error && (
          <div className="text-red-500 bg-red-100 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="text-blue-500 text-center p-4">
            Creating your invitation...
          </div>
        )}

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${isCreating ? "opacity-50 pointer-events-none" : ""}`}
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="border rounded-lg bg-white shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 w-full text-left"
              onClick={() => handleThemeSelect(theme.id)}
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
      </div>
    </div>
  );
}
