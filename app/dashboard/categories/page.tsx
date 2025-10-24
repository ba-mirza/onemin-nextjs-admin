import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CategoriesPage = () => {
  return (
    <section className="flex flex-col gap-2">
      <label htmlFor="categoryName">Название категории</label>
      <Input disabled id="categoryName" />
      <Button disabled>Создать новую категорию</Button>
      <p className="opacity-75">В разработке...</p>
    </section>
  );
};

export default CategoriesPage;
