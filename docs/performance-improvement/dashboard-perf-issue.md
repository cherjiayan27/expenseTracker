Dashboard Performance Issue - Summary

Problem
The "Add Expense" button and date selection in the dashboard were very slow and caused noticeable lag.

Root Cause
Both interactions used URL query parameters (?add-expense=true&date=2025-01-02) to manage state. Every time you:
Clicked "Add Expense" (open/close)
Selected a date in the calendar
Next.js treated it as a navigation, which triggered:
Full page re-render
Server component re-execution
Supabase database refetch (expenses + budget)
All this work just to show/hide a modal or filter client-side data

Solution
Moved state management from URL to client-side React state:
Bottom Sheet (Add Expense):
Changed from router.push("?add-expense=true") navigation
To local useState in useBottomSheetState
Button now opens instantly without server round-trip
Date Selection:
Changed from router.push("?date=...") navigation
To local useState in useDateFilter
Used history.replaceState to keep URL updated for bookmarking (without navigation)
Refresh always resets to today

Result:
✅ Instant button response (no server re-render)
✅ Fast date filtering (client-only)
✅ Still refetches data only when needed (after successful expense submission)
✅ URLs remain shareable/bookmarkable