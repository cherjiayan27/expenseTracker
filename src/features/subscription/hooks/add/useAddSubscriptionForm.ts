"use client";

import { useState } from "react";
import { formatDateToString } from "@/features/expenses/domain/utils/date.utils";

type SubscriptionPeriod = "Yearly" | "Quarterly" | "Monthly";

export function useAddSubscriptionForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<SubscriptionPeriod>("Monthly");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [isExpiring, setIsExpiring] = useState(false);

  const today = formatDateToString(new Date());

  const resetForm = () => {
    setName("");
    setAmount("");
    setPeriod("Monthly");
    setNextPaymentDate("");
    setIsExpiring(false);
  };

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
    resetForm,
    isValid,
  };
}
