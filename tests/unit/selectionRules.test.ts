import { describe, it, expect } from "vitest";
import {
  SELECTION_LIMITS,
  canSelectImage,
  canRemoveImage,
  validateSelectionCount,
  buildDefaultSelectionPaths,
} from "@/features/categories/domain/selectionRules";
import type { CategoryImage } from "@/features/categories/domain/category.types";

const makeImage = (overrides: Partial<CategoryImage>): CategoryImage => ({
  name: overrides.name ?? "default",
  category: overrides.category ?? "Food & Drinks",
  path: overrides.path ?? "/path/default",
  isDefault: overrides.isDefault,
});

describe("selectionRules", () => {
  it("canSelectImage prevents duplicates and enforces max", () => {
    const current = Array.from({ length: SELECTION_LIMITS.max }, (_, i) => `/p${i}`);

    expect(canSelectImage(current, current[0])).toBe(false); // duplicate
    expect(canSelectImage(current.slice(0, SELECTION_LIMITS.max), "/new")).toBe(false); // at max
    expect(canSelectImage(current.slice(0, SELECTION_LIMITS.max - 1), "/new")).toBe(true); // below max
  });

  it("canRemoveImage blocks when at or below min", () => {
    const atMin = Array.from({ length: SELECTION_LIMITS.min }, (_, i) => `/p${i}`);
    const aboveMin = [...atMin, "/extra"];

    expect(canRemoveImage(atMin)).toBe(false);
    expect(canRemoveImage(aboveMin)).toBe(true);
  });

  it("validateSelectionCount enforces bounds", () => {
    expect(validateSelectionCount([])).toMatchObject({ ok: false });
    expect(
      validateSelectionCount(Array.from({ length: SELECTION_LIMITS.min }, (_, i) => `/p${i}`))
    ).toMatchObject({ ok: true });
    expect(
      validateSelectionCount(Array.from({ length: SELECTION_LIMITS.max + 1 }, (_, i) => `/p${i}`))
    ).toMatchObject({ ok: false });
  });

  it("buildDefaultSelectionPaths uses defaults, tops up to min, and caps at max", () => {
    const images: CategoryImage[] = [
      makeImage({ name: "d1", path: "/d1", isDefault: true }),
      makeImage({ name: "d2", path: "/d2", isDefault: true }),
      makeImage({ name: "d3", path: "/d3", isDefault: true }),
      makeImage({ name: "nd1", path: "/nd1" }),
      makeImage({ name: "nd2", path: "/nd2" }),
      makeImage({ name: "nd3", path: "/nd3" }),
      makeImage({ name: "nd4", path: "/nd4" }),
      makeImage({ name: "nd5", path: "/nd5" }),
    ];

    const defaults = buildDefaultSelectionPaths(images);
    expect(defaults.length).toBe(SELECTION_LIMITS.min); // topped up to min (6)
    expect(defaults.slice(0, 3)).toEqual(["/d1", "/d2", "/d3"]); // keeps defaults first

    // When many defaults exist, cap at max
    const manyDefaults = buildDefaultSelectionPaths(
      Array.from({ length: 12 }, (_, i) =>
        makeImage({ path: `/d${i}`, name: `d${i}`, isDefault: true })
      )
    );
    expect(manyDefaults.length).toBe(SELECTION_LIMITS.max);
  });
});

