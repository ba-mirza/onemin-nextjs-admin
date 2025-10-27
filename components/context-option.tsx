"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const ContextOption = ({
  children,
  articleId,
}: Readonly<{
  children: React.ReactNode;
  articleId: string;
}>) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled>
          Предварительный просмотр {articleId}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
