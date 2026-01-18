"use client";

import { Card, CardContent } from "@/components/ui/card";

export function SubscriptionSkeleton() {
  return (
    <Card className="animate-pulse mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
