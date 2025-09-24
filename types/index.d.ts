interface SearchParams {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}