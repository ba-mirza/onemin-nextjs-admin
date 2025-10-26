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
  const deleteArticleId = () => {
    console.log("Delete article ID", articleId);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled>Предварительный просмотр</ContextMenuItem>
        <ContextMenuItem onClick={deleteArticleId} variant="destructive">
          Удалить статью
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
