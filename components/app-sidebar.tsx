'use client'

import * as React from "react"
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
} from "@/components/ui/sidebar"

import Link from "next/link";
import {usePathname} from "next/navigation";

const navMain = [
  {
    title: "Default page",
    url: "/dashboard",
    disabled: false,
  },
  {
    title: 'Создание статьи',
    url: '/dashboard/create-article',
    disabled: false,
  },
  {
    title: 'Управление категорией',
    url: '/dashboard/categories',
    disabled: false,
  },
  {
    title: 'Управление тегами',
    url: '/dashboard/tags',
    disabled: false,
  },
  {
    title: 'Настройки',
    url: '/dashboard/settings',
    disabled: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <strong>Администрация</strong>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={pathname === item.url.slice(1)} asChild>
                      <Link href={item.url}>
                        <span>{item.title}</span>
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
  )
}
