import type { MenuCategory } from "../types";
import ProductCard from "./ProductCard";

type CategorySectionProps = {
  category: MenuCategory;
  currency: string;
};

const CategorySection = ({ category, currency }: CategorySectionProps) => {
  if (category.products.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{category.name}</h2>
      <div className="space-y-3">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
