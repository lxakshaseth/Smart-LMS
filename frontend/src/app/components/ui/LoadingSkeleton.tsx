export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-xl ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm">
      <LoadingSkeleton className="h-6 w-3/4 mb-4" />
      <LoadingSkeleton className="h-4 w-full mb-2" />
      <LoadingSkeleton className="h-4 w-5/6" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <LoadingSkeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}
