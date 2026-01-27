export default function BudgetLoading() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Main Content */}
      <div className="space-y-8 pt-8">
        <section>
          {/* Title skeleton */}
          <div className="mb-6 text-center px-4">
            <div className="h-10 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>

          {/* Budget display skeleton */}
          <div className="max-w-md mx-auto px-4 pb-16 pt-0">
            <div className="flex flex-col items-center">
              {/* Currency label */}
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />

              {/* Large budget number */}
              <div className="h-24 w-48 bg-gray-200 rounded animate-pulse" />

              {/* Slider skeleton */}
              <div className="w-full mt-8 px-4">
                <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
