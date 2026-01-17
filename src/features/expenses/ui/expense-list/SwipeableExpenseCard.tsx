"use client";

import { useState, useRef, useTransition } from "react";
import type { Expense } from "../../domain/expense.types";
import { ExpenseCard } from "./ExpenseCard";
import { deleteExpense } from "../../actions/deleteExpense";
import { Trash2 } from "lucide-react";

type SwipeableExpenseCardProps = {
  expense: Expense;
  onClick?: () => void;
  onDeleteSuccess?: () => void;
};

const DELETE_BUTTON_WIDTH = 80;
const DELETE_BUTTON_GAP = 8;
const SWIPE_THRESHOLD = 40;

export function SwipeableExpenseCard({ expense, onClick, onDeleteSuccess }: SwipeableExpenseCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    startXRef.current = touch.clientX;
    currentXRef.current = translateX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const diff = touch.clientX - startXRef.current;
    const newTranslate = currentXRef.current + diff;

    // Clamp between -(DELETE_BUTTON_WIDTH + gap) and 0
    const maxSwipe = DELETE_BUTTON_WIDTH + DELETE_BUTTON_GAP;
    const clampedTranslate = Math.max(-maxSwipe, Math.min(0, newTranslate));
    setTranslateX(clampedTranslate);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;

    // Snap to open or closed based on threshold
    const maxSwipe = DELETE_BUTTON_WIDTH + DELETE_BUTTON_GAP;
    if (translateX < -SWIPE_THRESHOLD) {
      setTranslateX(-maxSwipe);
      setIsOpen(true);
    } else {
      setTranslateX(0);
      setIsOpen(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteExpense(expense.id);
      if (result.success) {
        onDeleteSuccess?.();
      } else {
        console.error("Delete failed:", result.error);
        // Reset swipe state on error
        setTranslateX(0);
        setIsOpen(false);
      }
    });
  };

  const handleCardClick = () => {
    if (isOpen) {
      // Close the swipe if open
      setTranslateX(0);
      setIsOpen(false);
    } else {
      onClick?.();
    }
  };

  const showDeleteButton = translateX < 0;

  return (
    <div className="relative overflow-hidden">
      {/* Delete button behind the card - only render when swiping */}
      {showDeleteButton && (
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center bg-red-500 rounded-lg"
          style={{ width: DELETE_BUTTON_WIDTH, right: 0 }}
        >
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex flex-col items-center justify-center w-full h-full text-white disabled:opacity-50"
          aria-label="Delete expense"
        >
          <Trash2 className={`w-5 h-5 ${isPending ? 'animate-pulse' : ''}`} />
          <span className="text-xs mt-1">{isPending ? '...' : 'Delete'}</span>
        </button>
        </div>
      )}

      {/* Swipeable card */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ExpenseCard expense={expense} onClick={handleCardClick} />
      </div>
    </div>
  );
}
