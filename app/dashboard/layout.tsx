import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/dyn-breadcrumbs";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <DynamicBreadcrumbs />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
