export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Default Section */}
      <div className="space-y-12 pt-3">
        <section>
          <div className="mb-6 text-center">
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mx-auto mt-2" />

            {/* Progress bar skeleton */}
            <div className="mt-4 max-w-xs mx-auto flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Category grid skeleton */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>

        {/* Selection Section */}
        <section>
          <div className="mb-6 text-center">
            <div className="h-9 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mx-auto mt-2" />
          </div>

          {/* Selection grid skeleton - grouped by category */}
          <div className="px-4 space-y-8">
            {Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
