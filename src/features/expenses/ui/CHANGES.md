# Expense UI Changes

## Overview
Updated ExpenseCard and ExpenseList components to match the new transaction list UI design.

## Changes Made

### 1. New Helper Functions (`expense.helpers.ts`)

Created utility functions for expense display:

- **`getCategoryImage(category)`**: Returns the category mascot image path
  - Uses default category images from CATEGORY_IMAGES
  - Falls back to "Other" category if not found

- **`getCategoryDisplayName(category)`**: Returns formatted category name
  - Returns "Other" for null categories

- **`formatTime(dateString)`**: Smart date formatting
  - Returns "Today" for current date
  - Returns "Yesterday" for previous date
  - Returns "Dec 30" format for other dates

### 2. ExpenseCard Component

**Before:**
- Card-based design with border
- Description on left, amount on right
- Date and category badge below description

**After:**
- Flat design matching transaction list UI
- Category mascot image in rounded square (48x48px)
- Bold title and subtitle layout
- Description as title, time + category as subtitle
- Amount on the right side

**Visual Structure:**
```
[Icon]  Title              $Amount
        Subtitle (Time • Category)
```

### 3. ExpenseList Component

**Before:**
- Simple vertical stack with spacing
- No header or grouping

**After:**
- Section header with title ("Wins in life")
- Border separator below header
- Larger gap between items (24px)
- Proper scrolling container with overflow handling
- Title prop for customization

**Visual Structure:**
```
─────────────────────
Title
─────────────────────

[Expense Item]

[Expense Item]

[Expense Item]
```

## Usage Examples

### Basic Usage
```tsx
import { ExpenseList } from "@/features/expenses";

<ExpenseList expenses={expenses} />
```

### With Custom Title
```tsx
<ExpenseList
  expenses={expenses}
  title="This Week's Expenses"
/>
```

### Empty State
Shows a placeholder message when no expenses exist, maintaining the section header.

## Design System Match

The components now match the reference UI with:
- ✅ 48x48px rounded-2xl icon containers
- ✅ Shadow and border on icon containers
- ✅ Bold 14px titles
- ✅ Gray 12px subtitles
- ✅ 24px gap between items
- ✅ Section headers with border-bottom
- ✅ Proper overflow handling

## Files Modified

1. `/src/features/expenses/domain/expense.helpers.ts` - NEW
2. `/src/features/expenses/ui/ExpenseCard.tsx` - UPDATED
3. `/src/features/expenses/ui/ExpenseList.tsx` - UPDATED
4. `/src/features/expenses/index.ts` - UPDATED (added exports)

## Next Steps

- [ ] Connect to real expense data
- [ ] Add click handlers for expense detail view
- [ ] Add swipe actions (delete, edit)
- [ ] Add expense grouping by date
- [ ] Add loading states
- [ ] Add error boundaries
