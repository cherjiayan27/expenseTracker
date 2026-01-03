"use client";

import Image from "next/image";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryImage } from "../domain/category.types";

interface SelectableImageCardProps {
  image: CategoryImage;
  onSelect: (imagePath: string) => void;
  isSelected?: boolean;
}

function SelectableImageCardComponent({ image, onSelect, isSelected = false }: SelectableImageCardProps) {
  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden bg-white p-6 transition-all duration-300 hover:shadow-lg",
        isSelected 
          ? "border-2 border-blue-500 shadow-lg shadow-blue-200/50" 
          : "border-2 border-gray-200 hover:border-blue-400"
      )}
      onClick={() => onSelect(image.path)}
      role="button"
      tabIndex={0}
    >
      {/* Image */}
      <div className="relative flex h-32 items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={image.path}
            alt={image.name}
            unoptimized
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
        </div>
      </div>

      {/* Image Name */}
      <p className="mt-3 text-center text-xs font-medium text-gray-700 truncate">
        {image.name}
      </p>
    </Card>
  );
}

export const SelectableImageCard = memo(SelectableImageCardComponent);

