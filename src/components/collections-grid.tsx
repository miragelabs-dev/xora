'use client';

import { useSession } from "@/app/session-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Collection } from "@/lib/db/schema";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
export function CollectionGrid({
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
