"use client";

import { useState, useCallback, useMemo } from "react";
import { ArticleTable } from "@/lib/types/props";
import { getAllArticlesLight } from "@/lib/supabase/action/article.action";

interface UseBatchPaginationProps {
  initialArticles: ArticleTable[];
  batchSize?: number;
  pageSize?: number;
}

export const useBatchPagination = ({
  initialArticles,
  batchSize = 50,
  pageSize = 10,
}: UseBatchPaginationProps) => {
  const [allArticles, setAllArticles] =
    useState<ArticleTable[]>(initialArticles);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length === batchSize);
  const [totalArticlesInDB, setTotalArticlesInDB] = useState<number | null>(
    null,
  );

  const loadNextBatch = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getAllArticlesLight({
        limit: batchSize,
        offset: allArticles.length,
      });

      if (result.status === "success") {
        const newArticles = result.data;
        setAllArticles((prev) => [...prev, ...newArticles]);

        if (newArticles.length < batchSize) {
          setHasMore(false);
          setTotalArticlesInDB(allArticles.length + newArticles.length);
        }
      }
    } catch (error) {
      console.error("Error loading next batch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [allArticles.length, batchSize, isLoading, hasMore]);

  const currentArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allArticles.slice(startIndex, endIndex);
  }, [allArticles, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (totalArticlesInDB !== null) {
      return Math.ceil(totalArticlesInDB / pageSize);
    }

    if (hasMore) {
      return Math.ceil(allArticles.length / pageSize) + 1;
    }

    return Math.ceil(allArticles.length / pageSize);
  }, [allArticles.length, pageSize, hasMore, totalArticlesInDB]);

  const checkAndLoadBatch = useCallback(
    (page: number) => {
      const requiredArticles = page * pageSize;
      const threshold = allArticles.length - 20;

      if (requiredArticles >= threshold && hasMore && !isLoading) {
        loadNextBatch();
      }
    },
    [allArticles.length, pageSize, hasMore, isLoading, loadNextBatch],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;

      setCurrentPage(page);
      checkAndLoadBatch(page);
    },
    [totalPages, checkAndLoadBatch],
  );

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  return {
    currentArticles,
    currentPage,
    totalPages,
    isLoading,
    hasMore,
    hasNextPage,
    hasPrevPage,
    goToPage,
    totalArticles: totalArticlesInDB ?? allArticles.length,
    loadedArticles: allArticles.length,
  };
};
