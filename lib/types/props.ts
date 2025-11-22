export type Lang = "ru" | "kz";
type INS = {
  id: number;
  name: string;
  slug: string;
};

export interface ArticleTable {
  id: string;
  title: string;
  slug: string;
  category_id: number;
  category: INS[];
  lang: Lang;
  is_published: boolean;
  updated_at: string;
}

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
  lang: Lang;
  content: any;
  preview_image: string;
  author_id: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
  views_count: number;
  views_count_custom: number | null;
  use_custom_views: boolean;
  tags: Array<INS>;
}
