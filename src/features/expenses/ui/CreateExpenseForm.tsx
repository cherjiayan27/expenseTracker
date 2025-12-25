"use client";

import { useEffect, useRef } from "react";
import { useCreateExpense } from "../actions/useCreateExpense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { EXPENSE_CATEGORIES, getTodayDate } from "../domain/expense.calculations";

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function CreateExpenseForm() {
  const { state, formAction, isPending } = useCreateExpense();
  const formRef = useRef<HTMLFormElement>(null);

  // Clear form on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  const today = getTodayDate();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Add New Expense
      </h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SGD)</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max="9999999.99"
              required
              disabled={isPending}
              aria-describedby={!state?.success && state?.error ? "expense-error" : undefined}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              defaultValue={today}
              max={today}
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What did you spend on?"
            maxLength={200}
            required
            disabled={isPending}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category (Optional)</Label>
          <select
            id="category"
            name="category"
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((category: ExpenseCategory) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {!state?.success && state?.error && (
          <div
            id="expense-error"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {state.error}
          </div>
        )}

        {/* Success Message */}
        {state?.success && (
          <div
            className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
            role="status"
          >
            Expense added successfully!
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Adding..." : "Add Expense"}
        </Button>
      </form>
    </Card>
  );
}

