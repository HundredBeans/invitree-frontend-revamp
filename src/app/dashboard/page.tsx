// src/app/dashboard/page.tsx

"use client";

import Link from "next/link"; // <-- IMPORT LINK
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserInvitations } from "@/lib/strapi";
import type { Invitation } from "@/types/invitation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchInvitations = async () => {
      try {
        const userId = (session.user as any)?.id;
        const jwt = (session.user as any)?.jwt;

        if (userId && jwt) {
          const userInvitations = await getUserInvitations(userId, jwt);
          setInvitations(userInvitations);
        } else {
          throw new Error("User session is invalid.");
        }
      } catch (err: any) {
        console.error("Failed to fetch invitations:", err);
        setError(err.message || "Could not load invitations.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {session.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Your Invitations
          </h2>
        </div>

        {error && (
          <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
        )}

        <div className="space-y-4">
          {invitations.length > 0 ? (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {invitation.invitationTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Type: {invitation.invitationType} | Status:{" "}
                    <span
                      className={`font-medium ${
                        invitation.invitationStatus === "published"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {invitation.invitationStatus}
                    </span>
                  </p>
                </div>
                <Link href={`/invitations/editor/${invitation.id}`}>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">
                You don't have any invitations yet.
              </p>
              {/* --- THIS IS THE UPDATED BUTTON --- */}
              <Link href="/invitations/new">
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Create New Invitation
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
