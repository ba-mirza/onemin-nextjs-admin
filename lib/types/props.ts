export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  lang: "ru" | "kz";
  content: any;
  preview_image: string;
  author_id: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
  views_count: number;
  views_count_custom: number | null;
  use_custom_views: boolean;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}
