'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { NFTWithRelations } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Library, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface CollectionDetailProps {
  collectionId: number;
}

function NFTCard({ nft }: { nft: NFTWithRelations }) {
  return (
    <Link href={`/${nft.post.author.username}/status/${nft.post.id}`}>
      <Card className="overflow-hidden transition-all hover:bg-muted/50">
        {nft.post.image && (
          <div className="relative aspect-square">
            <Image
              src={nft.post.image}
              alt="NFT image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-base">#{nft.tokenId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nft.post.content}
          </p>
          <p className="mt-2 text-sm font-medium">
            Owned by {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function CollectionSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-[250px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CollectionDetail({ collectionId }: CollectionDetailProps) {
  const { ref, inView } = useInView();

  const { data: collection, isLoading: isCollectionLoading } = api.nft.getCollectionById.useQuery({
    collectionId,
  });

  const {
    data: nftsData,
    isLoading: isNFTsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.nft.getCollectionNFTs.useInfiniteQuery(
    {
      collectionId,
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

  const isLoading = isCollectionLoading || isNFTsLoading;
  const nfts = nftsData?.pages.flatMap(page => page.items) ?? [];

  if (isLoading) {
    return <CollectionSkeleton />;
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <Library className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Collection Not Found</h3>
          <p className="text-sm text-muted-foreground">
            The collection you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title={collection.name}>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {collection.description || "No description provided"}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/${collection.creator.username}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <UserAvatar
                src={collection.creator.image}
                fallback={collection.creator.username[0]}
                className="h-8 w-8"
              />
              <span>Created by @{collection.creator.username}</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <p>
              <span className="font-medium">{collection.totalSupply}</span>{" "}
              <span className="text-muted-foreground">items</span>
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="space-y-4 px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {nfts.map((nft, i) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <NFTCard nft={nft} />
            </motion.div>
          ))}
        </div>

        {hasNextPage && (
          <div ref={ref} className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
} 