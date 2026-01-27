"use client";

import { useCategoryPreferences } from "@/features/user";
import { CategoryGrid, SelectionGrid } from "@/features/categories";
import { getCategoriesWithImages } from "@/features/categories";
import type { ExpenseCategory, CategoryImage } from "@/features/categories";
import { useState } from "react";

export default function CategoriesPage() {
  const {
    isLoaded,
    getDefaultImages,
    getAlternativeImages,
    selectImage,
    removeImage,
    isMaxReached,
    isMinReached,
    getSelectionCount,
    isImageSelected,
  } = useCategoryPreferences();

  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [showMinWarning, setShowMinWarning] = useState(false);

  // Get selected images
  const defaultImages = isLoaded ? getDefaultImages() : [];
  const selectionCount = isLoaded ? getSelectionCount() : { current: 0, min: 6, max: 10 };

  // Get alternatives grouped by category (exclude "Other" category)
  const alternativesByCategory: Record<ExpenseCategory, CategoryImage[]> = {} as Record<ExpenseCategory, CategoryImage[]>;
  
  if (isLoaded) {
    const categories = getCategoriesWithImages();
    categories.forEach((category) => {
      // Hide "Other" category from selection
      if (category !== "Other") {
        alternativesByCategory[category] = getAlternativeImages(category);
      }
    });
  }

  // Handle image selection from alternatives
  const handleImageSelect = (imagePath: string) => {
    const wasAdded = selectImage(imagePath);
    
    if (!wasAdded && isMaxReached()) {
      // Show warning that max is reached
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 3000);
    }
  };

  // Handle remove from defaults
  const handleRemove = (imagePath: string) => {
    const wasRemoved = removeImage(imagePath);
    
    if (!wasRemoved && isMinReached()) {
      // Show warning that min is reached
      setShowMinWarning(true);
      setTimeout(() => setShowMinWarning(false), 3000);
    } else {
      setShowMaxWarning(false); // Clear max warning if shown
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white pb-32">
        {/* Default Section */}
        <div className="space-y-12 pt-3">
          <section>
            <div className="mb-6 text-center">
              <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mx-auto mt-2" />
              <div className="mt-4 max-w-xs mx-auto flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="px-4">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 text-center">
              <div className="h-9 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
              <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mx-auto mt-2" />
            </div>
            <div className="px-4 space-y-8">
              {Array.from({ length: 3 }).map((_, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 relative">

      {/* Max Warning Toast */}
      {showMaxWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-amber-900">
              {selectionCount.max}-image limit reached.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Remove one to add another.
            </p>
          </div>
        </div>
      )}

      {/* Min Warning Toast */}
      {showMinWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-blue-900">
              Keep at least {selectionCount.min} images.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Add an image to remove this one.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 space-y-12 pt-3">
        {/* Default Section */}
        <section>
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Default</h1>
            <p className="mt-2 text-gray-600">Your selected category images</p>
            
            <div className="mt-4 max-w-xs mx-auto flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    selectionCount.current < selectionCount.min ? 'bg-blue-500' : 'bg-black'
                  }`}
                  style={{ width: `${(selectionCount.current / selectionCount.max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 shrink-0">
                {selectionCount.current}/{selectionCount.max}
              </span>
            </div>
          </div>
          <CategoryGrid 
            images={defaultImages}
            onRemove={handleRemove}
            showRemove={true}
          />
        </section>

        {/* Selection Section */}
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Selection</h2>
            <p className="mt-2 text-gray-600">
              {isMaxReached() 
                ? "Remove an image above to add a new one" 
                : "Choose images to add to your collection"}
            </p>
          </div>
          <SelectionGrid 
            alternativesByCategory={alternativesByCategory}
            isImageSelected={(path) => isLoaded ? isImageSelected(path) : false}
            onImageSelect={(_, path) => handleImageSelect(path)}
          />
        </section>
      </div>
    </div>
  );
}


