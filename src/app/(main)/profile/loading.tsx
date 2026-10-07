export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8 animate-pulse">
      {/* Header Profile Info Skeleton */}
      <div className="bg-card rounded-3xl border p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="h-32 w-32 rounded-full bg-muted border-4 border-background shrink-0" />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="h-10 w-64 bg-muted rounded-lg mx-auto md:mx-0" />
          <div className="h-5 w-48 bg-muted rounded mx-auto md:mx-0" />
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="h-64 w-full bg-muted rounded-3xl" />
          <div className="h-64 w-full bg-muted rounded-3xl" />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="h-48 w-full bg-muted rounded-3xl" />
          <div className="h-96 w-full bg-muted rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
