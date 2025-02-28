'use client';

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";
import Link from "next/link";

function TrendingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function TrendsPage() {
  const { data: trends, isLoading } = api.post.getTrendingHashtags.useQuery({
    limit: 30
  });

  return (
    <div>
      <PageHeader title="Trends" />

      <Card className="divide-y">
        {isLoading ? (
          <TrendingSkeleton />
        ) : !trends?.length ? (
          <div className="p-4 text-center text-muted-foreground">
            No trending topics
          </div>
        ) : (
          trends.map((trend) => (
            <Link
              key={trend.tag}
              href={`/search?q=%23${trend.tag}`}
              className="block space-y-1 p-4 transition-colors hover:bg-muted"
            >
              <p className="text-lg font-medium">#{trend.tag}</p>
              <p className="text-sm text-muted-foreground">
                {trend.count} {trend.count === 1 ? 'post' : 'posts'}
              </p>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
} 