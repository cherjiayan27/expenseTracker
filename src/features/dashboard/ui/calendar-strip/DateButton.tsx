import { cn } from "@/lib/utils";

interface DateButtonProps {
  day: string;
  date: string;
  fullDate: string;
  isSelected: boolean;
  onClick: (date: string) => void;
}

export function DateButton({ day, date, fullDate, isSelected, onClick }: DateButtonProps) {
  return (
    <button
      onClick={() => onClick(fullDate)}
      className="flex flex-col items-center justify-center gap-1 transition-all min-w-[50px] px-1"
      aria-label={`Select ${day} ${date}`}
      aria-pressed={isSelected}
    >
      <span
        className={cn(
          "text-xs font-medium",
          isSelected ? "text-gray-900" : "text-gray-400"
        )}
      >
        {day}
      </span>
      <span
        className={cn(
          "text-base",
          isSelected ? "font-bold text-gray-900" : "font-normal text-gray-400"
        )}
      >
        {date}
      </span>
    </button>
  );
}
