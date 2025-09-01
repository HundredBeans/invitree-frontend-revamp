import { SidebarTrigger, Separator, Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui";

export function DashboardHeader() {
  const path = window.location.pathname;
  const pathArray = path.split("/").filter(Boolean);
  const breadcrumbItems = pathArray.map((item, index) => (
    <BreadcrumbItem key={index}>
      <BreadcrumbPage className="capitalize">{item.replace("-", " ")}</BreadcrumbPage>
    </BreadcrumbItem>
  ))

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
            {/* Generate breadcrumb from url */}
            {breadcrumbItems}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}