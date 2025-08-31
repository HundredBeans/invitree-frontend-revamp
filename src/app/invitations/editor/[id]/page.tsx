// src/app/invitations/editor/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";

export default function InvitationEditorPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold">Invitation Editor</h1>
      <p className="text-xl mt-4">
        You are now editing invitation with ID:{" "}
        <span className="font-mono bg-gray-200 p-1 rounded">{id}</span>
      </p>
    </div>
  );
}
