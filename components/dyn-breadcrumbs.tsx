"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathTranslations: Record<string, string> = {
  dashboard: "На главную",
  new: "Создание статьи",
  categories: "Управление категорией",
  settings: "Настройки",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbs = segments.map((segment) => {
    return pathTranslations[segment] || segment;
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex gap-4 items-center">
        {breadcrumbs.map((crumb, index) => (
          <div key={index}>
            <BreadcrumbItem className="select-none" key={index}>
              {crumb}
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator key={`sep-${index}`} />
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
