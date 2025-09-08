"use client";

import { SidebarTrigger, Separator, Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function DashboardHeader() {
  const pathname = usePathname();
  const pathArray = pathname.split("/").filter(Boolean);

  // Process breadcrumb items with special handling for editor pages
  const processedPathArray = [...pathArray];
  let editorId: string | null = null;

  // Check if we're on an invitation editor page with ID
  if (pathArray.length === 3 &&
      pathArray[0] === "invitations" &&
      pathArray[1] === "editor") {
    // Store the ID and remove it from the displayed path
    editorId = pathArray[2];
    processedPathArray.pop(); // Remove the ID from display
  }

  const breadcrumbItems = processedPathArray.map((item, index) => {
    // Determine the href for each breadcrumb item
    let href: string;
    if (item === "editor" && editorId) {
      // For editor breadcrumb, include the ID in the href
      href = `/${pathArray.slice(0, index + 2).join("/")}`;
    } else {
      // For other breadcrumbs, use the normal path
      href = `/${processedPathArray.slice(0, index + 1).join("/")}`;
    }

    return (
      <>
        <BreadcrumbItem key={item}>
          <Link href={href}>
            <BreadcrumbPage className="capitalize">{item.replace("-", " ")}</BreadcrumbPage>
          </Link>
        </BreadcrumbItem>
        {index < processedPathArray.length - 1 && <BreadcrumbSeparator key={`sep-${index}`} />}
      </>
    );
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
