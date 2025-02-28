'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Library } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./ui/skeleton";

interface UserCollectionsViewProps {
  userId: number;
}

function CollectionCard({ collection }: { collection: any }) {
  return (
    <Link href={`/nft-collections/${collection.id}`}>
      <Card className="overflow-hidden transition-all hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">{collection.name}</CardTitle>
          <CardDescription>{collection.description || "No description"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-sm font-medium">
            {collection.totalSupply} NFTs
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <Library className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No Collections Found</h3>
        <p className="text-sm text-muted-foreground">
          This user hasn't created any NFT collections yet.
        </p>
      </div>
    </div>
  );
}

export function UserCollectionsView({ userId }: UserCollectionsViewProps) {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.nft.getUserCollections.useInfiniteQuery(
    {
      userId,
      limit: 12
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const collections = data?.pages.flatMap(page => page.items) ?? [];

  if (collections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <CollectionCard collection={collection} />
          </motion.div>
        ))}
      </div>

      <div ref={ref} />
    </div>
  );
} 