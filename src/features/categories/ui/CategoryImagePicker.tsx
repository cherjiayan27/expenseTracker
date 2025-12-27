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
      
      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {images.map((image) => (
          <SelectableImageCard
            key={image.path}
            image={image}
            onSelect={onImageSelect}
          />
        ))}
      </div>
    </div>
  );
}

