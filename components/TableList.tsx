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

import { Trash2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Article } from "@/lib/types/props";
import UpdateForm from "./update-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AlertDelete from "./alert-delete";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "./ui/spinner";

const TableList = ({ articles }: { articles: Article[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1200);
  const isSearching = searchQuery !== debouncedSearchQuery;

  const filteredArticles = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return articles;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return articles.filter((article) =>
      article.title.toLowerCase().includes(query),
    );
  }, [articles, debouncedSearchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="warn">
        <AlertTitle>Предупреждение!</AlertTitle>
        <AlertDescription>
          Фильтр по колонкам на данный момент недоступен
        </AlertDescription>
      </Alert>
      <div className="flex gap-4 items-center">
        <Input
          className="w-1/3"
          type="text"
          placeholder="Поиск по заголовку"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && <Spinner />}
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">По категориям</SelectItem>
            <SelectItem value="tag">По тегам</SelectItem>
            <SelectItem value="isPublished">По датам</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableCaption>
          {" "}
          {debouncedSearchQuery && (
            <span>
              Найдено: {filteredArticles.length} из {articles.length}
            </span>
          )}
          {!debouncedSearchQuery && <span>Список статей</span>}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[200px]">Заголовок</TableHead>
            <TableHead className="text-center">Статус</TableHead>
            <TableHead className="text-right">Дата</TableHead>
            <TableHead className="text-center">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="select-none">
          {filteredArticles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {debouncedSearchQuery
                  ? "По вашему запросу ничего не найдено"
                  : "Статьи не найдены"}
              </TableCell>
            </TableRow>
          ) : (
            filteredArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium p-4">
                  {article.id.slice(0, 12)}...
                </TableCell>
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
                <TableCell className="flex gap-4 justify-center">
                  <UpdateForm articleId={article}>
                    <Button variant="outline" size="sm">
                      Править
                    </Button>
                  </UpdateForm>
                  <AlertDelete articleId={article.id}>
                    <Button
                      className="rounded-full"
                      size="sm"
                      variant="outline"
                    >
                      <Trash2Icon color="red" />
                    </Button>
                  </AlertDelete>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableList;
