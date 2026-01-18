"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { formatCurrency } from "@/features/expenses/domain/formatters/currency.formatter";
import { Plus } from "lucide-react";
import { AddSubscriptionModal } from "./modals/AddSubscriptionModal";
import { EditSubscriptionModal } from "./modals/EditSubscriptionModal";
import { SubscriptionList } from "./lists/SubscriptionList";
import { useSubscriptionMutations } from "../actions/useSubscriptionMutations";
import type { Subscription } from "../domain/subscription.types";

interface SubscriptionPageProps {
  initialSubscriptions?: Subscription[];
}

export function SubscriptionPage({ initialSubscriptions = [] }: SubscriptionPageProps) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { delete: deleteSubscription, isPending } = useSubscriptionMutations();
  
  // Sync local state with server data when it changes after router.refresh()
  useEffect(() => {
    setSubscriptions(initialSubscriptions);
  }, [initialSubscriptions]);
  
  const activeSubs = subscriptions.filter((s) => s.isActive);
  const inactiveSubs = subscriptions.filter((s) => !s.isActive);

  const handleDeleteSubscription = async (id: string) => {
    const result = await deleteSubscription(id);
    
    if (result.success) {
      // Refresh server data to get latest subscriptions
      router.refresh();
    } else if (result.error) {
      handleError(result.error);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Auto-dismiss after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    // Refresh server data to get latest subscriptions
    router.refresh();
  };

  const handleEditSuccess = () => {
    setEditingSubscription(null);
    // Refresh server data to get latest subscriptions
    router.refresh();
  };

  // Calculate totals for active subscriptions
  const totalMonthlyEquivalent = activeSubs.reduce((acc, s) => {
    if (s.period === "Yearly") return acc + s.amount / 12;
    if (s.period === "Quarterly") return acc + s.amount / 3;
    return acc + s.amount;
  }, 0);

  const totalYearlyEquivalent = totalMonthlyEquivalent * 12;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button 
          size="sm" 
          className="rounded-full"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 hover:opacity-70"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="mt-6 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Monthly Commitment
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalMonthlyEquivalent)}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Yearly Total
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalYearlyEquivalent)}
                </h2>
              </div>
            </div>
          </div>
          <SubscriptionList 
            subscriptions={activeSubs} 
            onSubscriptionClick={(sub) => setEditingSubscription(sub)}
            onDeleteSubscription={handleDeleteSubscription}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <SubscriptionList 
            subscriptions={inactiveSubs} 
            showTotals={false} 
            onDeleteSubscription={handleDeleteSubscription}
          />
        </TabsContent>
      </Tabs>

      <AddSubscriptionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        onError={handleError}
      />

      <EditSubscriptionModal
        subscription={editingSubscription}
        isOpen={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onSuccess={handleEditSuccess}
        onError={handleError}
      />
    </div>
  );
}
