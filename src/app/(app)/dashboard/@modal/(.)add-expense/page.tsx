"use client";

import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CreateExpenseForm } from "@/features/expenses/ui/CreateExpenseForm";

export default function AddExpenseModal() {
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto rounded-t-2xl [&>button]:hidden"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Add New Expense</SheetTitle>
        <CreateExpenseForm 
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
}

