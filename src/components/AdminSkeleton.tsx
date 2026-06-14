import { Skeleton } from "@/components/ui/skeleton";

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-5 w-80 rounded-lg mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="clay-card border-0 p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-7 w-12 rounded-lg" />
                    <Skeleton className="h-4 w-16 rounded-lg mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-80 rounded-full mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="clay-card border-0 p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-5 h-5 rounded shrink-0 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg mt-2" />
                    <Skeleton className="h-4 w-1/3 rounded-lg mt-1" />
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
