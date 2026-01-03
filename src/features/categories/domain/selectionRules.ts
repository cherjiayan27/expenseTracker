import type { CategoryImage } from "./category.types";

// Central limits for category mascot selections
export const SELECTION_LIMITS = {
  min: 4,
  max: 10,
} as const;

/**
 * Determine if an image can be added given current selections.
 */
export function canSelectImage(selectedPaths: string[], imagePath: string): boolean {
  if (selectedPaths.includes(imagePath)) return false;
  return selectedPaths.length < SELECTION_LIMITS.max;
}

/**
 * Determine if an image can be removed given current selections.
 */
export function canRemoveImage(selectedPaths: string[]): boolean {
  return selectedPaths.length > SELECTION_LIMITS.min;
}

/**
 * Validate selection size against limits.
 */
export function validateSelectionCount(paths: string[]): { ok: true } | { ok: false; error: string } {
  if (paths.length < SELECTION_LIMITS.min) {
    return { ok: false, error: `You must select at least ${SELECTION_LIMITS.min} images` };
  }

  if (paths.length > SELECTION_LIMITS.max) {
    return { ok: false, error: `You can select at most ${SELECTION_LIMITS.max} images` };
  }

  return { ok: true };
}

/**
 * Build a default selection set:
 * - Use images flagged as default.
 * - If fewer than min, top up with non-defaults to meet the minimum.
 * - Always cap at max.
 */
export function buildDefaultSelectionPaths(images: readonly CategoryImage[]): string[] {
  const defaultPaths = images.filter((img) => img.isDefault).map((img) => img.path);

  if (defaultPaths.length >= SELECTION_LIMITS.min) {
    return defaultPaths.slice(0, SELECTION_LIMITS.max);
  }

  const nonDefaultImages = images.filter((img) => !img.isDefault);
  const additionalNeeded = SELECTION_LIMITS.min - defaultPaths.length;
  const additionalPaths = nonDefaultImages.slice(0, additionalNeeded).map((img) => img.path);

  return [...defaultPaths, ...additionalPaths].slice(0, SELECTION_LIMITS.max);
}

