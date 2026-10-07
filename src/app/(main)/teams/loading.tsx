export default function TeamsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-card rounded-3xl border p-8 space-y-4">
        <div className="h-6 w-24 bg-muted rounded-full" />
        <div className="h-12 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-muted rounded" />
      </div>

      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl border bg-card p-6 space-y-4">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-muted border-2 border-background" />
                <div className="h-10 w-10 rounded-full bg-muted border-2 border-background" />
                <div className="h-10 w-10 rounded-full bg-muted border-2 border-background" />
              </div>
              <div className="pt-4 border-t flex justify-end">
                <div className="h-10 w-32 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
