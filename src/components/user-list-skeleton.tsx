import { Skeleton } from "@/components/ui/skeleton";

export function UserListSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-border p-4"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
} 