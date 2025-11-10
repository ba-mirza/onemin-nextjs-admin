"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navMain = [
  {
    title: "На главную",
    url: "/dashboard",
    disabled: false,
  },
  {
    title: "Создание статьи",
    url: "/dashboard/new",
    disabled: false,
  },
  {
    title: "Управление категорией",
    url: "/dashboard/categories",
    disabled: false,
  },
  {
    title: "Настройки",
    url: "/dashboard/settings",
    disabled: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center py-3.5 border-1 border-dashed border-gray-400 rounded-lg bg-white shadow-2xs">
          <UserButton />
          <strong className="select-none">Администратор</strong>
          <p className="text-lg">Асель Болатқызы</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="hover:outline hover:outline-dashed p-6"
                    isActive={pathname === item.url.slice(1)}
                    asChild
                  >
                    <Link href={item.url}>
                      <span className="text-lg">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
