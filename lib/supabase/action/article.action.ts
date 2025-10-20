"use server";

import { createSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { articleForm } from "@/lib/schema/form";
import z from "zod";
import slugify from "slugify";
import { generateUniqueSlug } from "@/lib/utils";
import { errorResponse, successResponse } from "@/lib/types/api-response";

export const getAllArticles = async (filters?: {
  lang?: "ru" | "kz";
  category?: number;
  isPublished?: boolean;
}) => {
  try {
    const supabase = await createSupabaseClient();

    let query = supabase.from("articles").select(`
                *,
                category:categories(id, name, slug),
                tags:article_tags(
                    tag:tags(id, name, slug)
                )
            `);

    if (filters?.lang) {
      query = query.eq("lang", filters.lang);
    }
    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }
    if (filters?.isPublished !== undefined) {
      query = query.eq("is_published", filters.isPublished);
    }

    const { data: articles, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      return errorResponse(
        `Ошибка получения статей: ${error.message}`,
        "DATABASE_ERROR",
      );
    }

    const articlesWithTags = articles.map((article) => ({
      ...article,
      tags: article.tags.map((at: { tag: string }) => at.tag),
    }));

    return successResponse(articlesWithTags);
  } catch (error) {
    console.error("Error fetching articles:", error);
    if (error instanceof Error) {
      return errorResponse(error.message, "INTERNAL_SERVER_ERROR");
    }
  }
};

export const createArticle = async (data: z.infer<typeof articleForm>) => {
  const supabase = await createSupabaseClient();
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Пользователь не авторизован", "UNAUTHORIZED");
  }

  try {
    const tagIds: string[] = [];

    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName, {
          lower: true,
          strict: true,
          locale: "ru",
        });

        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("slug", tagSlug)
          .single();

        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({
              name: tagName,
              slug: tagSlug,
            })
            .select("id")
            .single();

          if (tagError) {
            console.error(`Ошибка создания тега "${tagName}":`, tagError);
            continue;
          }

          if (newTag) {
            tagIds.push(newTag.id);
          }
        }
      }
    }

    const file = data.previewImage as File;

    if (!file) {
      return errorResponse("Загрузите изображение", "UPLOAD_ERROR");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return errorResponse(
        `Ошибка загрузки изображения: ${uploadError.message}`,
        "UPLOAD_ERROR",
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("article-images").getPublicUrl(filePath);

    const titleSlug = generateUniqueSlug(data.title);

    const publishedAt = data.isPublished ? new Date().toISOString() : null;

    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        title: data.title,
        slug: titleSlug,
        excerpt: data.excerpt || null,
        category_id: parseInt(data.category),
        lang: data.lang,
        content: data.content,
        preview_image: publicUrl,
        author_id: userId,
        is_published: data.isPublished,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from("article-images").remove([filePath]);

      return errorResponse(
        `Ошибка создания статьи: ${insertError.message}`,
        "DATABASE_ERROR",
      );
    }

    if (tagIds.length > 0) {
      const articleTags = tagIds.map((tagId) => ({
        article_id: article.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from("article_tags")
        .insert(articleTags);

      if (tagsError) {
        console.error("Ошибка привязки тегов:", tagsError);
      }

      console.log("Article created successfully:", article);

      return successResponse(article, `Статья успешно ${status}`);
    }
  } catch (e) {
    console.error("Error creating article:", e);
    if (e instanceof Error) {
      return errorResponse(e, "INTERNAL_ERROR");
    }
  }
};
