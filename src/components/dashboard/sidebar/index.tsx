"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  Mails,
  TreePine
} from "lucide-react"

import { NavMain } from "@/components/dashboard/sidebar/nav-main"
import { NavUser } from "@/components/dashboard/sidebar/nav-user"
import { NavCompany } from "@/components/dashboard/sidebar/nav-company"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { NavSecondary } from "./nav-secondary"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  company:{
    name: "Invitree.id",
    logo: TreePine,
    plan: "Free Plan",
  },
  navMain: [
    {
      title: "Invitations",
      url: "/invitations",
      icon: Mails,
    }
  ],
  navSecondary: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavCompany company={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary title="Platform" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          avatar: session?.user?.email?.charAt(0).toUpperCase() || "U",
          name: session?.user?.name || "User",
          email: session?.user?.email || "User",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
