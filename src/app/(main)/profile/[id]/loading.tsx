export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 h-36" />
          <div className="rounded-2xl border bg-card p-6 h-36" />
        </div>
        <div className="rounded-2xl border bg-card p-6 h-64" />
      </div>
    </div>
  );
}
