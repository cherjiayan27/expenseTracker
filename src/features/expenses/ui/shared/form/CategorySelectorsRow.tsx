"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/features/categories/domain/category.definitions";

interface CategorySelectorsRowProps {
  category: ExpenseCategory;
  subCategory: string | null;
  availableSubCategories: Array<{ name: string; path: string }>;
  onCategoryChange: (category: ExpenseCategory) => void;
  onSubCategoryChange: (subCategory: string | null) => void;
}

export function CategorySelectorsRow({
  category,
  subCategory,
  availableSubCategories,
  onCategoryChange,
  onSubCategoryChange,
}: CategorySelectorsRowProps) {
  const isOtherCategory = category === "Other";
  const isOtherSubCategory = subCategory === "Other";

  // Add an "Other" option when not already in the Other category
  const subCategoryOptions = isOtherCategory
    ? availableSubCategories
    : [...availableSubCategories, { name: "Other", path: "" }];

  // Stay in free-text mode when:
  // - category is "Other"
  // - user picked "Other" in the select
  // - current subCategory isn't one of the known options (user typed a custom value)
  const subCategoryIsKnown = subCategoryOptions.some((item) => item.name === subCategory);
  const showTextField = isOtherCategory || isOtherSubCategory || (!!subCategory && !subCategoryIsKnown);
  const textFieldValue = isOtherSubCategory ? "" : subCategory ?? "";

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
        <div className="w-48">
          <Select value={category} onValueChange={(value) => onCategoryChange(value as ExpenseCategory)}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-gray-100 border-none px-4 font-bold text-gray-900 focus:ring-0">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="z-[90]">
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Sub-category</label>
        <div className="w-48">
          {showTextField ? (
            <Input
              type="text"
              value={textFieldValue}
              onChange={(e) => onSubCategoryChange(e.target.value || null)}
              placeholder=""
              className="w-full h-12 px-4 rounded-xl bg-gray-100 border-none text-right font-bold text-gray-900 focus-visible:ring-0"
            />
          ) : (
            <Select value={subCategory || ""} onValueChange={(value) => onSubCategoryChange(value || null)}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-gray-100 border-none px-4 font-bold text-gray-900 focus:ring-0">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="z-[90]">
                {subCategoryOptions.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

