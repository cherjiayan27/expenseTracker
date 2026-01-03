"use client";

import { Delete } from "lucide-react";

interface NumberKeypadProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

export function NumberKeypad({ value, onChange }: NumberKeypadProps) {
  const handleNumberClick = (num: string) => {
    onChange((prev: string) => {
      // Handle initial zero
      if (prev === "0" && num !== ".") {
        return num;
      }
      // Prevent multiple decimals
      if (num === "." && prev.includes(".")) {
        return prev;
      }
      // Limit to 2 decimal places
      if (prev.includes(".")) {
        const decimalPart = prev.split(".")[1];
        if (decimalPart && decimalPart.length >= 2) {
          return prev;
        }
      }
      return prev + num;
    });
  };

  const handleDelete = () => {
    onChange((prev: string) => {
      if (prev.length <= 1) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  };

  return (
    <div className="h-full w-full">
      <div 
        className="grid grid-cols-3 gap-3 w-full h-full px-6"
        style={{ 
          gridTemplateRows: 'repeat(4, 1fr)'
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="flex items-center justify-center w-full h-full active:scale-95 transition-transform touch-manipulation"
          >
            <span className="text-3xl font-semibold text-black">{num}</span>
          </button>
        ))}

        <button
          onClick={() => handleNumberClick(".")}
          className="flex items-center justify-center w-full h-full active:scale-95 transition-transform touch-manipulation"
        >
          <span className="text-3xl font-semibold text-black pb-3">.</span>
        </button>

        <button
          onClick={() => handleNumberClick("0")}
          className="flex items-center justify-center w-full h-full active:scale-95 transition-transform touch-manipulation"
        >
          <span className="text-3xl font-semibold text-black">0</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center justify-center w-full h-full active:scale-95 transition-transform touch-manipulation"
        >
          <Delete className="h-7 w-7 text-black stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
