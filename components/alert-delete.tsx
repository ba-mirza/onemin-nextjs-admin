"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteArticle } from "@/lib/supabase/action/article.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AlertDelete = ({
  children,
  articleId,
}: {
  children: React.ReactNode;
  articleId: string;
}) => {
  const router = useRouter();

  const deleteArticleId = async () => {
    toast("Удаление статьи...");
    const result = await deleteArticle(articleId);

    if (!result) {
      toast("Ошибка: не удалось получить ответ от сервера");
      return;
    }

    if (result.status === "success") {
      toast(result.message || "Статья успешно удалена");
      router.refresh();
    } else {
      toast(`Ошибка: ${result.error}`);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Вы уверены что хотите удалить статью?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Удаление статьи приведет к удалению всех связанных с ней данных,
            включая комментарии и связанные файлы. Без возможности
            восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={deleteArticleId}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDelete;
