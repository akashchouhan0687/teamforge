export default function TeamDetailLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl space-y-10 animate-pulse">
      {/* Header Back Link */}
      <div className="h-4 w-24 bg-muted rounded mb-6" />

      {/* Header Card Skeleton */}
      <div className="bg-card rounded-3xl border p-8 md:p-12 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded-full" />
            <div className="h-12 w-64 bg-muted rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-full" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Members Skeleton */}
          <div className="rounded-3xl border bg-card p-6 md:p-8 space-y-6">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border bg-background">
                  <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Side Panel Skeleton */}
          <div className="rounded-3xl border bg-card p-6 space-y-4">
            <div className="h-6 w-32 bg-muted rounded-lg mb-4" />
            <div className="h-16 w-full bg-muted rounded-2xl" />
            <div className="h-16 w-full bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
