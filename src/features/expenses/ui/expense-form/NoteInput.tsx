"use client";

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteInput({ value, onChange }: NoteInputProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <Plus className="absolute left-6 h-6 w-6 text-gray-400 stroke-[2.5] pointer-events-none" />
        <Input
          type="text"
          placeholder="Jot something down"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 pl-16 pr-6 rounded-xl bg-gray-100 border-none text-sm font-medium placeholder:text-gray-400 text-black hover:bg-gray-200/50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}
