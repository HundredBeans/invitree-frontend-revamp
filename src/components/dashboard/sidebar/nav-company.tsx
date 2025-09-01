"use client"

import * as React from "react"

export function NavCompany({
  company,
}: {
  company: {
    name: string
    logo: React.ElementType
    plan: string
  }
}) {

  return (
    <div
      className="flex items-center gap-2 p-0 group-data-[state=expanded]:p-2 transition-padding duration-200 ease-in-out"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <company.logo className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {company.name}
        </span>
        <span className="truncate text-xs">{company.plan}</span>
      </div>
    </div>
  )
}
