"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditSubscriptionForm } from "../../hooks/edit/useEditSubscriptionForm";
import { useSubscriptionMutations } from "../../actions/useSubscriptionMutations";
import type { SubscriptionPeriod, Subscription } from "../../domain/subscription.types";

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function EditSubscriptionModal({ subscription, isOpen, onClose, onSuccess, onError }: EditSubscriptionModalProps) {
  const scrollPositionRef = useRef(0);
  const {
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
  } = useEditSubscriptionForm(subscription, isOpen);

  const { update, isPending } = useSubscriptionMutations();

  useEffect(() => {
    if (!isOpen) return;
    scrollPositionRef.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!subscription) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("amount", amount);
    formData.append("period", period);
    formData.append("nextPaymentDate", nextPaymentDate);
    formData.append("isExpiring", isExpiring.toString());

    const result = await update(subscription.id, formData);
    
    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  if (!isOpen || !subscription) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Subscription</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="flex flex-col gap-6">
              {/* Amount Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Amount
                </Label>
                <div className="flex items-center bg-gray-100 rounded-2xl px-4 h-14">
                  <span className="text-xl text-gray-900 mr-2 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none text-right w-full text-xl text-gray-900 font-bold focus:outline-none focus:ring-0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Name Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Subscription Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Netflix, Spotify"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-gray-50 border-gray-100 px-4 text-base focus:bg-white transition-colors"
                />
              </div>

              {/* Grid for Period and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Billing Cycle
                  </Label>
                  <Select 
                    value={period} 
                    onValueChange={(value: SubscriptionPeriod) => setPeriod(value)}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 px-4 text-base focus:bg-white transition-colors">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl z-[80]">
                      <SelectItem value="Monthly" className="rounded-xl">Monthly</SelectItem>
                      <SelectItem value="Quarterly" className="rounded-xl">Quarterly</SelectItem>
                      <SelectItem value="Yearly" className="rounded-xl">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {isExpiring ? "Final Payment Date" : "Next Payment Date"}
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={nextPaymentDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && val < today) {
                          setNextPaymentDate(today);
                        } else {
                          setNextPaymentDate(val);
                        }
                      }}
                      min={today}
                      className="h-14 rounded-2xl bg-gray-50 border-gray-100 px-4 text-base focus:bg-white transition-colors appearance-none block w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Expire Checkbox */}
              <div className="flex items-center space-x-3 px-1">
                <Checkbox 
                  id="edit-expire-checkbox" 
                  checked={isExpiring}
                  onCheckedChange={(checked) => setIsExpiring(checked as boolean)}
                />
                <Label 
                  htmlFor="edit-expire-checkbox" 
                  className="text-sm font-medium text-gray-600 cursor-pointer"
                >
                  Subscription expires on this date
                </Label>
              </div>
            </div>
          </div>

          <div className="p-8 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-base hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-14 rounded-2xl bg-black text-white font-bold text-base hover:bg-gray-900 transition-colors shadow-lg shadow-black/10"
              disabled={!isValid || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
