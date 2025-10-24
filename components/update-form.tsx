"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { updateArticle } from "@/lib/supabase/action/article.action";
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

const UpdateForm = ({
  children,
  articleId,
}: Readonly<{
  children: React.ReactNode;
  articleId: Article;
}>) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateArticleForm>>({
    resolver: zodResolver(updateArticleForm),
    defaultValues: {
      id: articleId.id,
      title: articleId.title,
      excerpt: articleId.excerpt || "",
      category: articleId.category_id.toString(),
      lang: articleId.lang,
      content: articleId.content,
      tags: articleId.tags.map((tag) => tag.name),
      isPublished: articleId.is_published,
      previewImage: undefined,
      use_custom_views: articleId.use_custom_views,
      views_count_custom: articleId.views_count_custom,
    },
  });

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
            Внесите изменения в статью: {articleId.title}
          </SheetDescription>
        </SheetHeader>

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
                  {articleId.preview_image && (
                    <div className="mt-2">
                      <Image
                        src={articleId.preview_image}
                        width={128}
                        height={128}
                        alt={articleId.preview_image}
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
                        initialContent={articleId.content}
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
                <strong>{articleId.views_count || 0}</strong>
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
                        Это число будет показано пользователям вместо реального
                        счетчика
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
      </SheetContent>
    </Sheet>
  );
};

export default UpdateForm;
