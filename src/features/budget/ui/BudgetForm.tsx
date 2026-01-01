"use client";

import { useState, useEffect } from "react";
import { useBudget } from "../actions/useBudget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function BudgetForm() {
  const { budget, isLoaded, isSaving, isAuthenticated, saveBudget, deleteBudget } = useBudget();
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form with existing budget
  useEffect(() => {
    if (budget) {
      setMonthlyBudget(budget.monthlyBudget.toString());
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const budgetValue = parseFloat(monthlyBudget);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      setErrorMessage("Please enter a valid budget amount greater than 0");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const result = await saveBudget(budgetValue, "SGD");

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage(result.error || "Failed to save budget");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your budget?")) {
      return;
    }

    const result = await deleteBudget();

    if (result.success) {
      setMonthlyBudget("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage(result.error || "Failed to delete budget");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  if (!isLoaded) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Loading...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please log in to manage your budget.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-green-900">
              Budget saved successfully!
            </p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-red-900">{errorMessage}</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyBudget" className="text-base font-medium text-gray-900">
              Monthly Budget
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center bg-gray-100 px-4 rounded-l-md border border-r-0 border-gray-300">
                <span className="text-gray-700 font-medium">SGD</span>
              </div>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="flex-1 rounded-l-none"
                disabled={isSaving}
              />
            </div>
            <p className="text-sm text-gray-600">
              Set your monthly spending limit to track your expenses better.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSaving || !monthlyBudget}
              className="flex-1"
            >
              {isSaving ? "Saving..." : budget ? "Update Budget" : "Set Budget"}
            </Button>

            {budget && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-6"
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </Card>

      {budget && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">Current Budget</p>
            <p className="text-3xl font-bold text-blue-900">
              {budget.currency} {budget.monthlyBudget.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-blue-700">per month</p>
          </div>
        </Card>
      )}
    </div>
  );
}
