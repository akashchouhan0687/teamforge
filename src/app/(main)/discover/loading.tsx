export default function DiscoverLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b pb-6 space-y-3">
        <div className="h-5 w-32 bg-muted rounded-full" />
        <div className="h-9 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      {/* Filter Box Skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="h-11 w-full bg-muted rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-10 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Grid of Student Cards Skeletons */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-card p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-36 bg-muted rounded" />
                  <div className="h-3 w-28 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
              <div className="flex gap-1.5 pt-2">
                <div className="h-5 w-16 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
                <div className="h-5 w-14 bg-muted rounded" />
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
