"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  updateArticle,
  getArticleById,
} from "@/lib/supabase/action/article.action";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";
import { updateArticleForm } from "@/lib/schema/form";
import { Article } from "@/lib/types/props";
import { categories } from "@/constants";
import { TagsInput } from "./ui/custom/tags-input";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

const UpdateForm = ({
  children,
  articleId,
}: Readonly<{
  children: React.ReactNode;
  articleId: string;
}>) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const form = useForm<z.infer<typeof updateArticleForm>>({
    resolver: zodResolver(updateArticleForm),
    defaultValues: {
      id: "",
      title: "",
      excerpt: "",
      category: "",
      lang: "ru",
      content: "",
      tags: [],
      isPublished: false,
      previewImage: undefined,
      use_custom_views: false,
      views_count_custom: null,
    },
  });

  useEffect(() => {
    const loadArticleData = async () => {
      if (!open) return;

      setIsLoading(true);
      try {
        const result = await getArticleById(articleId);

        if (result.status === "success") {
          const articleData = result.data;
          setArticle(articleData);

          form.reset({
            id: articleData.id,
            title: articleData.title,
            excerpt: articleData.excerpt || "",
            category: articleData.category_id.toString(),
            lang: articleData.lang,
            content: articleData.content,
            tags: articleData.tags.map((tag) => tag.name),
            isPublished: articleData.is_published,
            previewImage: undefined,
            use_custom_views: articleData.use_custom_views,
            views_count_custom: articleData.views_count_custom,
          });
        } else {
          toast.error(`Ошибка загрузки статьи: ${result.error}`);
          setOpen(false);
        }
      } catch (error) {
        toast.error(`Не удалось загрузить данные статьи: ${error.message}`);
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticleData();
  }, [open, articleId, form]);

  const onSubmit = async (values: z.infer<typeof updateArticleForm>) => {
    setIsSubmitting(true);

    const result = await updateArticle(values);

    if (!result) {
      toast("Ошибка: не удалось получить ответ от сервера");
      setIsSubmitting(false);
      return;
    }

    if (result.status === "success") {
      toast(result.message || "Статья успешно обновлена");
      setOpen(false);
      router.refresh();
    } else {
      toast(`Ошибка: ${result.error}`);
    }

    setIsSubmitting(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto overflow-x-hidden px-6 pb-8 pt-2 sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>Редактирование статьи</SheetTitle>
          <SheetDescription>
            {isLoading
              ? "Загрузка данных..."
              : `Внесите изменения в статью: ${article?.title || ""}`}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : article ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-6"
            >
              <FormField
                control={form.control}
                name="previewImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Картинка для статьи</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Оставьте пустым, чтобы не менять изображение
                    </FormDescription>
                    {article.preview_image && (
                      <div className="mt-2">
                        <Image
                          src={article.preview_image}
                          width={128}
                          height={128}
                          alt={article.preview_image}
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок статьи</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краткая выдержка</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="input capitalize">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              className="capitalize"
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Язык статьи</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="kz">Қазақша</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Опубликовать статью
                      </FormLabel>
                      <FormDescription>
                        Статья будет видна всем пользователям
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Теги</FormLabel>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Введите тег и нажмите Enter или пробел"
                      />
                    </FormControl>
                    <FormDescription>
                      Добавьте теги для лучшей категоризации статьи
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Содержание статьи</FormLabel>
                    <FormControl>
                      <div className="border rounded-md">
                        <SimpleEditor
                          onChange={field.onChange}
                          initialContent={article.content}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">Настройки счетчика просмотров</h3>

                <div className="text-sm text-muted-foreground">
                  Реальное количество просмотров:{" "}
                  <strong>{article.views_count || 0}</strong>
                </div>

                <FormField
                  control={form.control}
                  name="use_custom_views"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Использовать кастомный счетчик
                        </FormLabel>
                        <FormDescription>
                          Показывать свое количество просмотров вместо реального
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("use_custom_views") && (
                  <FormField
                    control={form.control}
                    name="views_count_custom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Кастомное количество просмотров</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Например: 10000"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value),
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Это число будет показано пользователям вместо
                          реального счетчика
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <SheetFooter>
                <Button
                  className="btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Отменить</Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </Form>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Не удалось загрузить данные статьи
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UpdateForm;
