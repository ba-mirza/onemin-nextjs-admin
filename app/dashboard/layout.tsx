import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

// const LoadingTemplate = (
//     <div className="flex flex-1 flex-col gap-4 p-4">
//         {Array.from({ length: 24 }).map((_, index) => (
//             <div
//                 key={index}
//                 className="bg-muted/50 aspect-video h-12 w-full rounded-lg"
//             />
//         ))}
//     </div>
// )

const DashboardLayout = async (
    { children }: { children: React.ReactNode }
) => {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    #
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

export default DashboardLayout