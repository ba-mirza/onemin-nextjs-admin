"use server";

import { createSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { articleForm, updateArticleForm } from "@/lib/schema/form";
import z from "zod";
import slugify from "slugify";
import { generateUniqueSlug } from "@/lib/utils";
import { errorResponse, successResponse } from "@/lib/types/api-response";
import { Article } from "@/lib/types/props";

export const getAllArticles = async (filters?: {
  lang?: "ru" | "kz";
  category?: number;
  isPublished?: boolean;
  limit?: number;
}) => {
  try {
    const supabase = await createSupabaseClient();

    let query = supabase.from("articles").select(`
        *,
        category:categories(id, name, slug),
        tags:article_tags(
          tag:tags(id, name, slug)
        ),
        stats:article_stats(views_count)
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

    const articlesWithDetails = articles.map((article) => ({
      ...article,
      tags: article.tags.map((at) => at.tag),
      views_count: article.stats?.views_count || 0,
    }));

    articlesWithDetails.forEach((a) => delete a.stats);

    return successResponse(articlesWithDetails);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Неизвестная ошибка",
      "INTERNAL_SERVER_ERROR",
    );
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
        views_count_custom: 0,
        use_custom_views: false,
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

      return successResponse(article, `Статья успешно создана`);
    }
  } catch (e) {
    console.error("Error creating article:", e);
    if (e instanceof Error) {
      return errorResponse(e, "INTERNAL_ERROR");
    }
  }
};

export const updateArticle = async (
  data: z.infer<typeof updateArticleForm>,
) => {
  try {
    const supabase = await createSupabaseClient();
    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Пользователь не авторизован", "UNAUTHORIZED");
    }

    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select("id, author_id, preview_image, slug")
      .eq("id", data.id)
      .single();

    if (fetchError || !existingArticle) {
      return errorResponse("Статья не найдена", "NOT_FOUND");
    }

    if (existingArticle.author_id !== userId) {
      return errorResponse(
        "Нет прав для редактирования этой статьи",
        "FORBIDDEN",
      );
    }

    const updateData: Partial<Article> = {
      updated_at: new Date().toISOString(),
    };

    if (data.previewImage && data.previewImage instanceof File) {
      const file = data.previewImage;
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

      updateData.preview_image = publicUrl;

      if (existingArticle.preview_image) {
        const oldPath = existingArticle.preview_image
          .split("/")
          .slice(-2)
          .join("/");
        await supabase.storage.from("article-images").remove([oldPath]);
      }
    }

    if (data.title) {
      updateData.title = data.title;
      updateData.slug = generateUniqueSlug(data.title);
    }

    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.category) updateData.category_id = parseInt(data.category);
    if (data.lang) updateData.lang = data.lang;
    if (data.content) updateData.content = data.content;

    if (data.isPublished !== undefined) {
      updateData.is_published = data.isPublished;

      const { data: currentArticle } = await supabase
        .from("articles")
        .select("published_at")
        .eq("id", data.id)
        .single();

      if (data.isPublished && !currentArticle?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
      if (!data.isPublished) {
        updateData.published_at = null;
      }
    }

    if (data.use_custom_views !== undefined) {
      updateData.use_custom_views = data.use_custom_views;

      if (!data.use_custom_views) {
        updateData.views_count_custom = null;
      }
    }

    if (data.views_count_custom !== undefined) {
      updateData.views_count_custom = data.views_count_custom;
    }

    const { data: article, error: updateError } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse(
        `Ошибка обновления статьи: ${updateError.message}`,
        "DATABASE_ERROR",
      );
    }

    if (data.tags !== undefined) {
      await supabase.from("article_tags").delete().eq("article_id", data.id);

      const tagIds: string[] = [];

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
          const { data: newTag } = await supabase
            .from("tags")
            .insert({ name: tagName, slug: tagSlug })
            .select("id")
            .single();

          if (newTag) tagIds.push(newTag.id);
        }
      }

      if (tagIds.length > 0) {
        const articleTags = tagIds.map((tagId) => ({
          article_id: data.id,
          tag_id: tagId,
        }));

        await supabase.from("article_tags").insert(articleTags);
      }
    }

    return successResponse(article, "Статья успешно обновлена");
  } catch (error) {
    console.error("Error updating article:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Неизвестная ошибка",
      "INTERNAL_ERROR",
    );
  }
};

export const deleteArticle = async (articleId: string) => {
  try {
    const supabase = await createSupabaseClient();
    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Пользователь не авторизован", "UNAUTHORIZED");
    }

    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("id, author_id, preview_image")
      .eq("id", articleId)
      .single();

    if (fetchError || !article) {
      return errorResponse("Статья не найдена", "NOT_FOUND");
    }

    if (article.author_id !== userId) {
      return errorResponse("Нет прав для удаления этой статьи", "FORBIDDEN");
    }

    if (article.preview_image) {
      try {
        const filePath = article.preview_image.split("/").slice(-2).join("/");
        await supabase.storage.from("article-images").remove([filePath]);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await supabase.from("article_tags").delete().eq("article_id", articleId);

    await supabase.from("article_stats").delete().eq("article_id", articleId);

    const { error: deleteError } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);

    if (deleteError) {
      return errorResponse(
        `Ошибка удаления статьи: ${deleteError.message}`,
        "DATABASE_ERROR",
      );
    }

    return successResponse(null, "Статья успешно удалена");
  } catch (error) {
    console.error("Error deleting article:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Неизвестная ошибка",
      "INTERNAL_ERROR",
    );
  }
};
