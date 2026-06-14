import { Skeleton } from "@/components/ui/skeleton";

export function QuizPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="mb-8">
            <Skeleton className="h-4 w-24 rounded-lg mb-4" />
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
          <div className="clay-card p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
            </div>
            <div className="space-y-3 ml-11">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-14 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
