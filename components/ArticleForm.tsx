"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { categories } from "@/constants";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { TagsInput } from "@/components/ui/custom/tags-input";
import { articleForm } from "@/lib/schema/form";
import { Switch } from "@/components/ui/switch";
import { createArticle } from "@/lib/supabase/action/article.action";
import { toast } from "sonner";

const ArticleForm = () => {
  const form = useForm<z.infer<typeof articleForm>>({
    resolver: zodResolver(articleForm),
    defaultValues: {
      title: "",
      excerpt: "",
      category: "",
      lang: "kz",
      content: {},
      tags: [],
      isPublished: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof articleForm>) => {
    const response = await createArticle(values);

    if (response && response.status) {
      toast(response.message, {
        description: Date.now().toString(),
      });
    } else {
      toast("Something went wrong!");
    }

    return;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel className="text-base">Опубликовать статью</FormLabel>
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
                  <SimpleEditor onChange={field.onChange} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <button
            className="btn-primary"
            type="submit"
            name="action"
            value="draft"
          >
            Создать
          </button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleForm;
