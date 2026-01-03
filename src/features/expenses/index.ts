// Expenses feature public API
// Only exports from this file should be imported by other features or app routes

// Types
export type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseResult,
} from "./domain/expense.types";

// Category Types (re-exported from categories feature)
export type { ExpenseCategory, CategoryImage } from "./domain/expense.categories";

// Hooks
export { useCreateExpense } from "./actions/useCreateExpense";
export { useExpenseForm, useExpenseSubmission } from "./hooks";

// UI Components
export { ExpenseCard, ExpenseList } from "./ui/expense-list";
export { DebtCard, DebtList } from "./ui/debt-list";
export { AddExpenseBottomSheet } from "./ui/add-expense";
export { EditExpenseModal } from "./ui/edit-expense";

// Server Actions (for Server Components)
export { getExpenses } from "./actions/getExpenses";

// Calculations (for Server Components)
export {
  calculateMonthTotal,
  calculateDateTotal,
  calculateRangeTotal,
} from "./domain/calculations/expense-totals";

export {
  getExpensesForDate,
  getExpensesInRange,
  filterDebts,
  filterNonDebts,
} from "./domain/calculations/expense-filters";

export { formatCurrency } from "./domain/formatters/currency.formatter";

export {
  getWeekRange,
  getMonthRange,
  getYearRange,
} from "./domain/utils/date.utils";

// Helpers
export {
  getCategoryImage,
  getCategoryDisplayName,
  formatTime,
} from "./domain/expense.helpers";

// Categories and Images (re-exported from categories feature)
export {
  EXPENSE_CATEGORIES,
  CATEGORY_IMAGES,
  getImagesByCategory,
  getRandomCategoryImage,
  getDefaultCategoryImage,
  getImageByName,
  getCategoriesWithImages,
  categoryHasImages,
} from "./domain/expense.categories";
