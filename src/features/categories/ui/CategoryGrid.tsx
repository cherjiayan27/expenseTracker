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
      {/* Horizontal Scrollable Layout */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
        {images.map((image) => (
          <div key={image.path} className="w-40 shrink-0 snap-start">
            <CategoryCard
              image={image}
              onRemove={onRemove}
              showRemove={showRemove}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
