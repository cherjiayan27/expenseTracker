"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  isOwe?: boolean;
  onOweChange?: (value: boolean) => void;
}

export function NoteInput({ value, onChange, isOwe = false, onOweChange }: NoteInputProps) {
  const label = isOwe ? "Who do you owe?" : "Jot something down";
  const isRequired = isOwe;

  return (
    <div className="w-full flex gap-4">
      {/* Owe Checkbox */}
      <div className="flex-shrink-0">
        <label className="text-xs font-medium text-gray-500 ml-3 mb-1 block">
          Owe?
        </label>
        <label className="h-12 rounded-xl bg-gray-100 flex items-center justify-center px-4 cursor-pointer hover:bg-gray-200/50 transition-colors">
          <Checkbox
            checked={isOwe}
            onCheckedChange={(checked) => onOweChange?.(checked as boolean)}
            className="cursor-pointer"
          />
        </label>
      </div>

      {/* Note Input */}
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 ml-3 mb-1 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isOwe ? "Enter name" : ""}
          className="w-full h-12 px-6 rounded-xl bg-gray-100 border-none text-base font-medium text-black hover:bg-gray-200/50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}
