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
import UpdateForm from "./update-form";
import { ContextOption } from "./context-option";
import { Input } from "./ui/input";

const TableList = ({ articles }: { articles: Article[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <Input className="w-1/3" type="text" placeholder="Поиск по заголовку" />
      <Table>
        <TableCaption>Список статей</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[200px]">Заголовок</TableHead>
            <TableHead className="text-center">Статус</TableHead>
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
              <UpdateForm articleId={article} key={article.id}>
                <TableRow>
                  <ContextOption articleId={article.id}>
                    <TableCell className="font-medium p-4">
                      {article.id.slice(0, 12)}...
                    </TableCell>
                  </ContextOption>
                  <TableCell
                    className="max-w-[300px] truncate"
                    title={article.title}
                  >
                    {article.title}
                  </TableCell>
                  <TableCell className="text-center">
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
              </UpdateForm>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableList;
