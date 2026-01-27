"use client";

import { Calendar } from "lucide-react";

export function EventsPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">No events yet</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Events will appear here once you start tracking them.
        </p>
      </div>
    </div>
  );
}
