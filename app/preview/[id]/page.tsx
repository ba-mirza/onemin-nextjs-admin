"use client";

import { use, useEffect, useState } from "react";
import { Article } from "@/lib/types/props";
import { tiptapToHtml } from "@/lib/tiptap-utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Eye } from "lucide-react";

import Image from "next/image";

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const storedArticle = sessionStorage.getItem("previewArticle");

    if (storedArticle) {
      const parsedArticle = JSON.parse(storedArticle);
      if (parsedArticle.id === id) {
        setArticle(parsedArticle);
      }
    }
  }, [id]);

  if (!article) return null;

  const htmlContent = tiptapToHtml(article.content);

  const displayedViews =
    article.use_custom_views && article.views_count_custom
      ? article.views_count_custom
      : article.views_count;

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-4 uppercase">{article.title}</h1>

      <div className="flex justify-start gap-4 font-semibold text-md text-muted-foreground mt-4">
        <span className="flex gap-2 items-center">
          <CalendarDays />
          {new Date(article.published_at).toLocaleDateString("ru-RU")}
        </span>
        <span className="flex gap-2 items-center">
          <Eye />
          {displayedViews.toLocaleString("ru-RU")} просмотров
        </span>
      </div>

      {article.preview_image && (
        <div className="mb-8 mt-3">
          <Image
            src={article.preview_image}
            alt={article.title}
            width={1600}
            height={900}
            className="object-cover rounded-lg w-full h-auto"
            priority
          />
        </div>
      )}

      {article.excerpt && (
        <p className="text-xl text-muted-foreground mb-8">{article.excerpt}</p>
      )}

      <div
        className="prose prose-lg max-w-none text-xl"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Separator orientation="horizontal" />
          {article.tags.map((tag) => (
            <Badge
              key={tag.id}
              className="bg-[#C53F3F] text-white text-md select-none mt-4"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
