"use client";

import { CategoryImagePicker } from "./CategoryImagePicker";
import type { ExpenseCategory, CategoryImage } from "../domain/category.types";

interface SelectionGridProps {
  alternativesByCategory: Record<ExpenseCategory, CategoryImage[]>;
  onImageSelect: (category: ExpenseCategory, imagePath: string) => void;
}

export function SelectionGrid({ alternativesByCategory, onImageSelect }: SelectionGridProps) {
  const categories = Object.keys(alternativesByCategory) as ExpenseCategory[];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const images = alternativesByCategory[category];
        if (images.length === 0) return null;
        
        return (
          <CategoryImagePicker
            key={category}
            category={category}
            images={images}
            onImageSelect={(path) => onImageSelect(category, path)}
          />
        );
      })}
    </div>
  );
}

