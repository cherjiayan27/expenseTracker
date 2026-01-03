"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface NoteInputRowProps {
  value: string;
  onChange: (value: string) => void;
  isOwe?: boolean;
  onOweChange?: (value: boolean) => void;
}

export function NoteInputRow({ value, onChange, isOwe = false, onOweChange }: NoteInputRowProps) {
  const isRequired = isOwe;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Owe Checkbox */}
      <div className="flex items-center justify-between px-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
          Owe money?
        </label>
        <div className="flex items-center justify-center bg-gray-100 rounded-xl h-12 w-12">
          <Checkbox
            checked={isOwe}
            onCheckedChange={(checked) => onOweChange?.(checked as boolean)}
            className="h-6 w-6 rounded-lg border-none bg-gray-200 data-[state=checked]:bg-black data-[state=checked]:text-white"
          />
        </div>
      </div>

      {/* Note Input */}
      <div className="flex items-center justify-between px-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
          {isOwe ? "Who?" : "Note"}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="w-48">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isOwe ? "Name" : ""}
            className="w-full h-12 px-4 rounded-xl bg-gray-100 border-none text-right font-bold text-gray-900 focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
}

