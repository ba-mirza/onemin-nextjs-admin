import { z } from "zod";

export const articleForm = z.object({
  previewImage: z.any().refine((file) => {
    if (!file || !(file instanceof File)) return false;
    return file.size <= 5 * 1024 * 1024; // 5MB limit
  }, "Нужно выбрать файл не более 5MB"),
  title: z
    .string()
    .min(3, { message: "Название не должно быть меньше 3 символов" }),
  excerpt: z.string().optional(),
  category: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Выберите категорию",
  }),
  lang: z.enum(["ru", "kz"], { message: "Выберите язык" }),
  content: z.any().refine((content) => {
    if (!content) return false;
    if (content.content && Array.isArray(content.content)) {
      return content.content.some(
        (node) => node.content && node.content.length > 0,
      );
    }
    return false;
  }, "Контент статьи не может быть пустым"),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
});

export const updateArticleForm = articleForm
  .partial()
  .extend({
    id: z.string().uuid("Некорректный идентификатор статьи"),
    views_count_custom: z
      .number()
      .int()
      .min(0, "Количество просмотров должно быть неотрицательным числом")
      .nullable()
      .optional(),
    use_custom_views: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (
        data.use_custom_views === true &&
        (data.views_count_custom === null ||
          data.views_count_custom === undefined)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Укажите кастомное количество просмотров",
      path: ["views_count_custom"],
    },
  );
