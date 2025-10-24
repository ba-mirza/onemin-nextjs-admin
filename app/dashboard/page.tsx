"use server";

import TableList from "@/components/TableList";
import { getAllArticles } from "@/lib/supabase/action/article.action";
import { Article } from "@/lib/types/props";

const DashboardPage = async () => {
  const result = await getAllArticles();

  if (result.status !== "success") {
    return (
      <section>
        <div className="text-center text-red-500 py-8">
          Ошибка загрузки статей: {result.error}
        </div>
      </section>
    );
  }

  const articles: Article[] = result.data;

  return (
    <section>
      <TableList articles={articles} />
    </section>
  );
};

export default DashboardPage;
