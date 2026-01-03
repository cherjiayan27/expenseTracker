"use client";

import { memo, useMemo } from "react";
import { SelectableImageCard } from "./SelectableImageCard";
import type { ExpenseCategory, CategoryImage } from "../domain/category.types";

interface CategoryImagePickerProps {
  category: ExpenseCategory;
  images: CategoryImage[];
  onImageSelect: (imagePath: string) => void;
  isImageSelected?: (path: string) => boolean;
}

function CategoryImagePickerComponent({ category, images, onImageSelect, isImageSelected }: CategoryImagePickerProps) {
  if (images.length === 0) {
    return null; // Don't show anything if no alternative images
  }

  // Separate meal-time images for Food & Drinks category
  const { mealImages, otherImages } = useMemo(() => {
    if (category === "Food & Drinks") {
      const mealNames = ["Breakfast", "Lunch", "Dinner", "Dessert", "Supper"];
      const meals = images.filter((img) => mealNames.includes(img.name));
      const others = images.filter((img) => !mealNames.includes(img.name));
      return { mealImages: meals, otherImages: others };
    }
    return { mealImages: [], otherImages: images };
  }, [category, images]);

  const hasMealSection = category === "Food & Drinks" && mealImages.length > 0;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
      
      {/* Meal Section (only for Food & Drinks) */}
      {hasMealSection && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 px-2">Meals</h4>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
            {mealImages.map((image) => (
              <div key={image.path} className="w-40 shrink-0 snap-start">
                <SelectableImageCard
                  image={image}
                  isSelected={isImageSelected ? isImageSelected(image.path) : false}
                  onSelect={onImageSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Images Section */}
      {otherImages.length > 0 && (
        <div className="space-y-2">
          {hasMealSection && <h4 className="text-sm font-medium text-gray-700 px-2">Other Items</h4>}
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
            {otherImages.map((image) => (
              <div key={image.path} className="w-40 shrink-0 snap-start">
                <SelectableImageCard
                  image={image}
                  isSelected={isImageSelected ? isImageSelected(image.path) : false}
                  onSelect={onImageSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const CategoryImagePicker = memo(CategoryImagePickerComponent);

