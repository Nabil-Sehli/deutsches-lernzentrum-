import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-lg mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="clay-card border-0 p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-4 w-20 rounded-lg mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="clay-card p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg mt-2" />
                    <Skeleton className="h-4 w-1/2 rounded-lg mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
