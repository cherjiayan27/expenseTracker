"use client";

import { useState, useEffect } from "react";
import { CATEGORY_IMAGES } from "../domain/category.definitions";
import type { ExpenseCategory, CategoryImage } from "../domain/category.types";

const STORAGE_KEY = "selected_category_images";
const MAX_SELECTIONS = 10; // Maximum number of images that can be selected
const MIN_SELECTIONS = 6; // Minimum number of images that must be selected

export function useCategoryPreferences() {
  // Store just an array of selected image paths
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with hardcoded default images
  const initializeDefaults = () => {
    const defaultPaths = CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .map((img) => img.path);
    
    // Ensure we have at least MIN_SELECTIONS
    if (defaultPaths.length < MIN_SELECTIONS) {
      // Add random non-default images to reach minimum
      const nonDefaultImages = CATEGORY_IMAGES.filter((img) => !img.isDefault);
      const additionalNeeded = MIN_SELECTIONS - defaultPaths.length;
      const additionalPaths = nonDefaultImages.slice(0, additionalNeeded).map((img) => img.path);
      setSelectedImagePaths([...defaultPaths, ...additionalPaths].slice(0, MAX_SELECTIONS));
    } else {
      setSelectedImagePaths(defaultPaths.slice(0, MAX_SELECTIONS));
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure loaded data meets minimum and doesn't exceed max
        if (parsed.length < MIN_SELECTIONS) {
          // If saved data is below minimum, reinitialize
          initializeDefaults();
        } else {
          setSelectedImagePaths(parsed.slice(0, MAX_SELECTIONS));
        }
      } catch (error) {
        console.error("Failed to parse category preferences:", error);
        // Reset to defaults if corrupted
        localStorage.removeItem(STORAGE_KEY);
        // Set hardcoded defaults
        initializeDefaults();
      }
    } else {
      // First time - initialize with hardcoded defaults
      initializeDefaults();
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedImagePaths));
    }
  }, [selectedImagePaths, isLoaded]);

  // Get current default/selected images
  const getDefaultImages = (): CategoryImage[] => {
    return CATEGORY_IMAGES.filter((img) => selectedImagePaths.includes(img.path));
  };

  // Get alternative images (all non-selected images)
  const getAlternativeImages = (category: ExpenseCategory): CategoryImage[] => {
    return CATEGORY_IMAGES.filter(
      (img) => img.category === category && !selectedImagePaths.includes(img.path)
    );
  };

  // Select/add an image to defaults
  const selectImage = (imagePath: string): boolean => {
    let wasAdded = false;
    
    setSelectedImagePaths((prev) => {
      if (prev.includes(imagePath)) {
        return prev; // Already selected
      }
      
      if (prev.length >= MAX_SELECTIONS) {
        wasAdded = false;
        return prev; // Max limit reached, don't add
      }
      
      wasAdded = true;
      return [...prev, imagePath];
    });
    
    return wasAdded;
  };

  // Remove an image from defaults
  const removeImage = (imagePath: string): boolean => {
    let wasRemoved = false;
    
    setSelectedImagePaths((prev) => {
      if (prev.length <= MIN_SELECTIONS) {
        wasRemoved = false;
        return prev; // Min limit reached, don't remove
      }
      
      wasRemoved = true;
      return prev.filter((path) => path !== imagePath);
    });
    
    return wasRemoved;
  };

  // Check if an image is selected
  const isImageSelected = (imagePath: string): boolean => {
    return selectedImagePaths.includes(imagePath);
  };

  // Check if max limit is reached
  const isMaxReached = (): boolean => {
    return selectedImagePaths.length >= MAX_SELECTIONS;
  };

  // Check if min limit is reached
  const isMinReached = (): boolean => {
    return selectedImagePaths.length <= MIN_SELECTIONS;
  };

  // Get current count, min, and max
  const getSelectionCount = () => {
    return {
      current: selectedImagePaths.length,
      min: MIN_SELECTIONS,
      max: MAX_SELECTIONS,
    };
  };

  return {
    isLoaded,
    getDefaultImages,
    getAlternativeImages,
    selectImage,
    removeImage,
    isImageSelected,
    isMaxReached,
    isMinReached,
    getSelectionCount,
  };
}

