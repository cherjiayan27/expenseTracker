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
  } = useCategoryPreferences();

  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [showMinWarning, setShowMinWarning] = useState(false);

  // Get selected images
  const defaultImages = isLoaded ? getDefaultImages() : [];
  const selectionCount = isLoaded ? getSelectionCount() : { current: 0, min: 6, max: 10 };

  // Get alternatives grouped by category
  const alternativesByCategory: Record<ExpenseCategory, CategoryImage[]> = {} as Record<ExpenseCategory, CategoryImage[]>;
  
  if (isLoaded) {
    const categories = getCategoriesWithImages();
    categories.forEach((category) => {
      alternativesByCategory[category] = getAlternativeImages(category);
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* High-End Grain Texture */}
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none contrast-125 brightness-100 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilterCategories">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.6" 
              numOctaves="3" 
              stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterCategories)" />
        </svg>
      </div>

      {/* Subtle Ambient Background Detail */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Max Warning Toast */}
      {showMaxWarning && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-amber-900">
              Maximum limit reached! You have {selectionCount.max} images selected.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Remove an image to add a new one.
            </p>
          </div>
        </div>
      )}

      {/* Min Warning Toast */}
      {showMinWarning && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-blue-900">
              Minimum limit reached! You must keep at least {selectionCount.min} images.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Add more images before removing this one.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 space-y-12">
        {/* Default Section */}
        <section>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Default</h1>
                <p className="mt-2 text-gray-600">Your selected category images</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {selectionCount.current} / {selectionCount.max}
                </p>
                <p className="text-xs text-gray-600">images selected (min: {selectionCount.min})</p>
              </div>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Selection</h2>
            <p className="mt-2 text-gray-600">
              {isMaxReached() 
                ? "Remove an image above to add a new one" 
                : "Choose images to add to your collection"}
            </p>
          </div>
          <SelectionGrid 
            alternativesByCategory={alternativesByCategory}
            onImageSelect={(_, path) => handleImageSelect(path)}
          />
        </section>
      </div>
    </div>
  );
}


