"use client";

import { CategoryCard } from "./CategoryCard";
import type { CategoryImage } from "../domain/category.types";

interface CategoryGridProps {
  images: CategoryImage[];
  onRemove?: (imagePath: string) => void;
  showRemove?: boolean;
}

export function CategoryGrid({ images, onRemove, showRemove = false }: CategoryGridProps) {
  return (
    <div className="mt-8">
      {/* Grid Layout - 2x2 on mobile, 2x3 on larger screens */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <CategoryCard
            key={image.path}
            image={image}
            onRemove={onRemove}
            showRemove={showRemove}
          />
        ))}
      </div>
    </div>
  );
}
