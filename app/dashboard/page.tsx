"use server";

import TableList from "@/components/TableList";
import { getAllArticlesLight } from "@/lib/supabase/action/article.action";
import { ArticleTable } from "@/lib/types/props";

const DashboardPage = async () => {
  const result = await getAllArticlesLight({ limit: 50, offset: 0 });

  if (result.status !== "success") {
    return (
      <section>
        <div className="text-center text-red-500 py-8">
          Ошибка загрузки статей: {result.error}
        </div>
      </section>
    );
  }

  const articles: ArticleTable[] = result.data;

  return (
    <section>
      <TableList articles={articles} />
    </section>
  );
};

export default DashboardPage;
