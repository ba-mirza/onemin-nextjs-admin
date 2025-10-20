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
    // Проверяем что контент не пустой (базовая проверка)
    if (content.content && Array.isArray(content.content)) {
      return content.content.some(
        (node: any) => node.content && node.content.length > 0,
      );
    }
    return false;
  }, "Контент статьи не может быть пустым"),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
});
