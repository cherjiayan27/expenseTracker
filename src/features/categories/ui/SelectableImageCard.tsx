"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { CategoryImage } from "../domain/category.types";

interface SelectableImageCardProps {
  image: CategoryImage;
  onSelect: (imagePath: string) => void;
}

export function SelectableImageCard({ image, onSelect }: SelectableImageCardProps) {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden border border-gray-200 bg-white p-6 
        transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-400"
      onClick={() => onSelect(image.path)}
    >
      {/* Image */}
      <div className="relative flex h-32 items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={image.path}
            alt={image.name}
            fill
            unoptimized
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

