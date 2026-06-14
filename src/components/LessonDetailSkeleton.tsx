import { Skeleton } from "@/components/ui/skeleton";

export function LessonDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <Skeleton className="h-4 w-16 rounded-lg mb-6" />
          <Skeleton className="h-9 w-3/4 rounded-lg" />
          <Skeleton className="h-5 w-1/2 rounded-lg mt-2 mb-6" />
          <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
          <div className="clay-card border-0 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-lg mt-2" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
