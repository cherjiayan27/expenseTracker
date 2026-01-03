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

interface CategorySelectorsProps {
  category: ExpenseCategory;
  subCategory: string | null;
  availableSubCategories: Array<{ name: string; path: string }>;
  onCategoryChange: (category: ExpenseCategory) => void;
  onSubCategoryChange: (subCategory: string | null) => void;
}

export function CategorySelectors({
  category,
  subCategory,
  availableSubCategories,
  onCategoryChange,
  onSubCategoryChange,
}: CategorySelectorsProps) {
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
    <div className="w-full mb-3 flex gap-4">
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 ml-3 mb-1 block">Category</label>
        <Select value={category} onValueChange={(value) => onCategoryChange(value as ExpenseCategory)}>
          <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-100">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="z-[70]">
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 ml-3 mb-1 block">Sub-category</label>
        {showTextField ? (
          <Input
            type="text"
            value={textFieldValue}
            onChange={(e) => onSubCategoryChange(e.target.value || null)}
            placeholder="Type something"
            className="w-full h-12 px-6 rounded-xl bg-gray-100 border-none text-sm font-medium text-black hover:bg-gray-200/50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : (
          <Select value={subCategory || ""} onValueChange={(value) => onSubCategoryChange(value || null)}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-100">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent className="z-[70]">
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
  );
}
