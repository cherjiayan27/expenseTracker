"use client";

import { useState } from "react";
import type { ExpenseCategory, CategoryImage } from "@/features/categories/domain/category.types";
import {
  SELECTION_LIMITS,
  canSelectImage,
  canRemoveImage,
} from "@/features/categories/domain/selectionRules";

interface UseCategorySelectionStateOptions {
  allImages: readonly CategoryImage[];
  initialSelectedPaths: string[];
}

interface SelectionResult {
  changed: boolean;
  paths: string[];
}

/**
 * Pure client-side selection state for category mascots.
 * Does not handle persistence; consumers can persist via returned paths.
 */
export function useCategorySelectionState({
  allImages,
  initialSelectedPaths,
}: UseCategorySelectionStateOptions) {
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[]>(initialSelectedPaths);

  const replaceSelection = (paths: string[]) => {
    setSelectedImagePaths(paths);
  };

  const selectImage = (imagePath: string): SelectionResult => {
    if (!canSelectImage(selectedImagePaths, imagePath)) {
      return { changed: false, paths: selectedImagePaths };
    }

    const newPaths = [...selectedImagePaths, imagePath];
    setSelectedImagePaths(newPaths);
    return { changed: true, paths: newPaths };
  };

  const removeImage = (imagePath: string): SelectionResult => {
    if (!canRemoveImage(selectedImagePaths)) {
      return { changed: false, paths: selectedImagePaths };
    }

    const newPaths = selectedImagePaths.filter((path) => path !== imagePath);
    setSelectedImagePaths(newPaths);
    return { changed: true, paths: newPaths };
  };

  const isImageSelected = (imagePath: string): boolean => {
    return selectedImagePaths.includes(imagePath);
  };

  const isMaxReached = (): boolean => {
    return selectedImagePaths.length >= SELECTION_LIMITS.max;
  };

  const isMinReached = (): boolean => {
    return selectedImagePaths.length <= SELECTION_LIMITS.min;
  };

  const getSelectionCount = () => {
    return {
      current: selectedImagePaths.length,
      min: SELECTION_LIMITS.min,
      max: SELECTION_LIMITS.max,
    };
  };

  const getDefaultImages = (): CategoryImage[] => {
    return allImages.filter((img) => selectedImagePaths.includes(img.path));
  };

  const getAlternativeImages = (category: ExpenseCategory): CategoryImage[] => {
    return allImages.filter(
      (img) => img.category === category && !selectedImagePaths.includes(img.path)
    );
  };

  return {
    selectedImagePaths,
    replaceSelection,
    selectImage,
    removeImage,
    isImageSelected,
    isMaxReached,
    isMinReached,
    getSelectionCount,
    getDefaultImages,
    getAlternativeImages,
  };
}

