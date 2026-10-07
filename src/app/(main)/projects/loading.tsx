export default function ProjectsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
        <div className="space-y-3 flex-1">
          <div className="h-5 w-32 bg-muted rounded-full" />
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-muted rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-muted rounded-full" />
        </div>
      </div>

      {/* Grid of Project Cards Skeletons */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border bg-card p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-4/5 bg-muted rounded" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
