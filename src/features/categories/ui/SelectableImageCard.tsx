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
        "group relative cursor-pointer overflow-hidden border border-gray-200 bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-400",
        isSelected && "border-blue-500 ring-2 ring-blue-200 ring-offset-2 ring-offset-white"
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

