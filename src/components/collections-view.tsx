'use client';

import { useSession } from "@/app/session-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Collection } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Library, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { CreateCollectionModal } from "./create-collection-modal";
import { EditCollectionModal } from "./edit-collection-modal";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { UserAvatar } from "./user-avatar";

type TabValue = "all" | "my";

type CollectionWithCreator = Collection & {
  creator: {
    username: string;
    image: string | null;
  };
};

function useCollections(activeTab: TabValue) {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.nft.getCollections.useInfiniteQuery(
    {
      type: activeTab,
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

  return {
    ref,
    collections: data?.pages.flatMap(page => page.items) ?? [],
    isLoading,
    hasNextPage,
  };
}

function CollectionCard({ collection }: { collection: CollectionWithCreator }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwner = useSession().user.id === collection.creatorId;

  return (
    <Card className="overflow-hidden transition-all hover:bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar
              src={collection.creator.image}
              fallback={collection.creator.username[0]}
              className="h-6 w-6"
            />
            <CardTitle className="text-lg">{collection.name}</CardTitle>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -m-3">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}>
                  Edit Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription>by @{collection.creator.username}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {collection.description || "No description"}
        </p>
        <p className="mt-2 text-sm font-medium">
          {collection.totalSupply} NFTs
        </p>
      </CardContent>

      <EditCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collection={collection}
      />
    </Card>
  );
}

function EmptyState({ activeTab }: { activeTab: TabValue }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <Library className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No Collections Found</h3>
        <p className="text-sm text-muted-foreground">
          {activeTab === "my"
            ? "Start creating your NFT collection by minting your posts!"
            : "Be the first to create an NFT collection by minting your posts!"}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CollectionGrid({
  collections,
  showLoadMore = false,
  loadMoreRef,
}: {
  collections: CollectionWithCreator[];
  showLoadMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
}) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {collections.map((collection, i) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Link href={`/nft-collections/${collection.id}`}>
            <CollectionCard collection={collection} />
          </Link>
        </motion.div>
      ))}

      {showLoadMore && (
        <div ref={loadMoreRef} className="col-span-full flex justify-center p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}
    </div>
  );
}

export function CollectionsView() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    ref,
    collections,
    isLoading,
    hasNextPage,
  } = useCollections(activeTab);

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
      <div className="border-b px-4">
        <div className="flex items-center justify-between">
          <TabsList className="w-full justify-start gap-8">
            <TabsTrigger value="all" className="relative">
              Explore Collections
            </TabsTrigger>
            <TabsTrigger value="my" className="relative">
              My Collections
            </TabsTrigger>
          </TabsList>
          {activeTab === "my" && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="ml-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="all">
        {isLoading ? <LoadingState /> :
          !collections.length ? <EmptyState activeTab={activeTab} /> :
            <CollectionGrid
              collections={collections}
              showLoadMore={hasNextPage}
              loadMoreRef={ref}
            />}
      </TabsContent>

      <TabsContent value="my">
        {isLoading ? <LoadingState /> :
          !collections.length ? <EmptyState activeTab={activeTab} /> :
            <CollectionGrid
              collections={collections}
              showLoadMore={hasNextPage}
              loadMoreRef={ref}
            />}
      </TabsContent>

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Tabs>
  );
} 