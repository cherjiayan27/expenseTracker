"use client";

import { memo, useMemo } from "react";
import { CategoryImagePicker } from "./CategoryImagePicker";
import type { ExpenseCategory, CategoryImage } from "../domain/category.types";

interface SelectionGridProps {
  alternativesByCategory: Record<ExpenseCategory, CategoryImage[]>;
  onImageSelect: (category: ExpenseCategory, imagePath: string) => void;
  isImageSelected?: (path: string) => boolean;
}

function SelectionGridComponent({ alternativesByCategory, onImageSelect, isImageSelected }: SelectionGridProps) {
  const categories = useMemo(
    () => Object.keys(alternativesByCategory) as ExpenseCategory[],
    [alternativesByCategory]
  );

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
            isImageSelected={isImageSelected}
            onImageSelect={(path) => onImageSelect(category, path)}
          />
        );
      })}
    </div>
  );
}

export const SelectionGrid = memo(SelectionGridComponent);

