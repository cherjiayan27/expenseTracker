"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CategoryImage } from "../domain/category.types";

interface CategoryCardProps {
  image: CategoryImage;
  onRemove?: (imagePath: string) => void;
  showRemove?: boolean;
}

export function CategoryCard({ image, onRemove, showRemove = false }: CategoryCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(image.path); // Pass path instead of category
    }
  };

  return (
    <Card
      className="group relative overflow-hidden border border-gray-200 bg-white p-6 
        transition-all duration-300 hover:shadow-lg hover:border-gray-300"
    >
      {/* Remove Button */}
      {showRemove && onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center 
            rounded-full bg-gray-200 text-gray-600 opacity-0 transition-all 
            hover:bg-red-500 hover:text-white group-hover:opacity-100"
          aria-label="Remove"
        >
          <X size={16} />
        </button>
      )}

      {/* Category Image */}
      <div className="relative flex h-32 items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={image.path}
            alt={image.name}
            fill
            priority
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
