export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
        <div className="space-y-3 flex-1">
          <div className="h-5 w-32 bg-muted rounded-full" />
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-muted rounded" />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-32 bg-muted rounded-full" />
          <div className="h-10 w-32 bg-muted rounded-full" />
        </div>
      </div>

      {/* Grid top layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-48 w-full bg-muted rounded-3xl" />
          <div className="h-64 w-full bg-muted rounded-3xl" />
          <div className="h-64 w-full bg-muted rounded-3xl" />
        </div>
        <div className="space-y-8">
          <div className="h-96 w-full bg-muted rounded-3xl" />
          <div className="h-64 w-full bg-muted rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
