"use client";

import { SessionProvider } from "next-auth/react";

// This is a client-side component that wraps the entire application
// to provide session context from NextAuth.js.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
