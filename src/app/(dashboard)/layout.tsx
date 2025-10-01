"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        {/* Main Content */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
