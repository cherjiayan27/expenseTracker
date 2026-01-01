"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <Select value={subCategory || ""} onValueChange={(value) => onSubCategoryChange(value || null)}>
          <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-100">
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent className="z-[70]">
            {availableSubCategories.map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
