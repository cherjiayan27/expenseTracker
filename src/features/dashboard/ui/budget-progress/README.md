# BudgetProgress Component

A beautiful semi-circle progress indicator showing spending against budget.

## Features

- 📊 **Visual Progress**: Semi-circle arc that fills based on spending percentage
- 🎨 **Color Coding**: Changes color based on budget status
  - Black: Under 80% of budget
  - Amber: 80-99% of budget
  - Red: At or over budget
- ✨ **Smooth Animations**: Animated transitions when values change
- 💰 **Currency Formatting**: Displays amounts with proper formatting

## Usage

```tsx
import { BudgetProgress } from "@/features/dashboard/ui";

function MyComponent() {
  return (
    <BudgetProgress
      totalSpending={20.00}
      monthlyBudget={50.00}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalSpending` | `number` | `20.00` | Current month's total spending |
| `monthlyBudget` | `number` | `50.00` | Monthly budget limit |
| `currency` | `string` | `"SGD"` | Currency code (for future use) |

## Examples

### Under Budget (Healthy)
```tsx
<BudgetProgress
  totalSpending={200}
  monthlyBudget={500}
/>
```
Shows black progress arc at 40%

### Near Budget (Warning)
```tsx
<BudgetProgress
  totalSpending={425}
  monthlyBudget={500}
/>
```
Shows amber progress arc at 85%

### Over Budget (Alert)
```tsx
<BudgetProgress
  totalSpending={600}
  monthlyBudget={500}
/>
```
Shows red progress arc at 100% (capped)

## Implementation Details

- Uses SVG path for the semi-circle arc
- Progress is calculated as: `(totalSpending / monthlyBudget) * 100`
- Arc circumference: 377 units
- `strokeDashoffset` controls the fill amount
- Smooth transitions using CSS transitions
- Responsive sizing with relative units

## Customization

To customize colors, modify the `getProgressColor()` function in `BudgetProgress.tsx`:

```tsx
const getProgressColor = () => {
  if (progressPercentage >= 100) return "#EF4444"; // red-500
  if (progressPercentage >= 80) return "#F59E0B"; // amber-500
  return "#000000"; // black
};
```

## Next Steps

- [ ] Connect to real budget data from Supabase
- [ ] Add click handler to navigate to budget settings
- [ ] Add weekly/yearly budget views
- [ ] Add budget remaining indicator
- [ ] Add percentage display option
