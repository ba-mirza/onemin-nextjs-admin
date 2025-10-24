"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Article } from "@/lib/types/props";

const TableList = ({ articles }: { articles: Article[] }) => {
  const editArticle = (id: string) => {
    console.log(`Editing article with ID: ${id}`);
  };

  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Заголовок</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead className="text-right">Дата</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="select-none">
        {articles.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground"
            >
              Статьи не найдены
            </TableCell>
          </TableRow>
        ) : (
          articles.map((article) => (
            <TableRow onClick={() => editArticle(article.id)} key={article.id}>
              <TableCell className="font-medium">
                {article.id.slice(0, 8)}...
              </TableCell>
              <TableCell>{article.title}</TableCell>
              <TableCell>
                {article.is_published ? (
                  <span className="text-green-600">Опубликовано</span>
                ) : (
                  <span className="text-yellow-600">Черновик</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {new Date(article.updated_at).toLocaleDateString("ru-RU")}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TableList;
