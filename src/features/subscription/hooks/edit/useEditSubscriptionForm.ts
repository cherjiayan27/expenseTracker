"use client";

import { useState, useEffect } from "react";
import { formatDateToString } from "@/features/expenses/domain/utils/date.utils";
import type { Subscription, SubscriptionPeriod } from "../../domain/subscription.types";

export function useEditSubscriptionForm(subscription: Subscription | null, isOpen: boolean) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<SubscriptionPeriod>("Monthly");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [isExpiring, setIsExpiring] = useState(false);

  const today = formatDateToString(new Date());

  useEffect(() => {
    if (!subscription || !isOpen) return;

    setName(subscription.name);
    setAmount(subscription.amount.toString());
    setPeriod(subscription.period);
    setNextPaymentDate(subscription.nextPaymentDate);
    setIsExpiring(!!subscription.isExpiring);
  }, [subscription, isOpen]);

  const isValid = !!(name && amount && nextPaymentDate);

  return {
    name,
    setName,
    amount,
    setAmount,
    period,
    setPeriod,
    nextPaymentDate,
    setNextPaymentDate,
    isExpiring,
    setIsExpiring,
    today,
    isValid,
  };
}
