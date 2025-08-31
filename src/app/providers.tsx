"use client";

import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";

// This is a client-side component that wraps the entire application
// to provide session context from NextAuth.js and error handling.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        {children}
        <Toaster position="top-right" expand={false} richColors closeButton />
      </SessionProvider>
    </ErrorBoundary>
  );
}
