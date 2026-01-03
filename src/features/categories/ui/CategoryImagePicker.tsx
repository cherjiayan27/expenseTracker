"use client";

import { SelectableImageCard } from "./SelectableImageCard";
import type { ExpenseCategory, CategoryImage } from "../domain/category.types";

interface CategoryImagePickerProps {
  category: ExpenseCategory;
  images: CategoryImage[];
  onImageSelect: (imagePath: string) => void;
}

export function CategoryImagePicker({ category, images, onImageSelect }: CategoryImagePickerProps) {
  if (images.length === 0) {
    return null; // Don't show anything if no alternative images
  }

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
      
      {/* Horizontal Scrollable Layout */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
        {images.map((image) => (
          <div key={image.path} className="w-40 shrink-0 snap-start">
            <SelectableImageCard
              image={image}
              onSelect={onImageSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

