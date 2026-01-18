"use client";

import { useState } from "react";
import { createSubscription, updateSubscription, deleteSubscription } from "./index";
import type { SubscriptionResult, Subscription } from "../domain/subscription.types";

/**
 * Client-side hook for subscription mutations
 * Tracks loading state without useTransition (Server Actions handle their own transitions)
 */
export function useSubscriptionMutations() {
  const [isPending, setIsPending] = useState(false);

  const create = async (formData: FormData): Promise<SubscriptionResult<Subscription>> => {
    setIsPending(true);
    try {
      return await createSubscription(formData);
    } finally {
      setIsPending(false);
    }
  };

  const update = async (id: string, formData: FormData): Promise<SubscriptionResult<Subscription>> => {
    setIsPending(true);
    try {
      return await updateSubscription(id, formData);
    } finally {
      setIsPending(false);
    }
  };

  const deleteItem = async (id: string): Promise<SubscriptionResult<void>> => {
    setIsPending(true);
    try {
      return await deleteSubscription(id);
    } finally {
      setIsPending(false);
    }
  };

  return { create, update, delete: deleteItem, isPending };
}
