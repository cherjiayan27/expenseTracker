export default function SubscriptionLoading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="grid w-full grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg mb-6">
        <div className="h-9 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Totals card skeleton */}
      <div className="mt-6 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-7 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Subscription list skeleton */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
