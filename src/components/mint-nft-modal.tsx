'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface MintNFTModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MintNFTModal({ postId, isOpen, onClose, onSuccess }: MintNFTModalProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

  const { data: collections, isLoading: isLoadingCollections } = api.nft.getCollections.useQuery({
    type: "my",
    limit: 50,
  });

  const { mutate: mintNFT, isPending: isMinting } = api.nft.mintPostAsNFT.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleMint = () => {
    mintNFT({
      postId,
      collectionId: selectedCollectionId ?? undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" data-no-navigate>
        <DialogHeader>
          <DialogTitle>Mint as NFT</DialogTitle>
          <DialogDescription>
            Choose a collection to mint your post as an NFT.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {isLoadingCollections ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !collections?.items.length ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No collections found.</p>
              <p className="text-sm">A new collection will be created for you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collections.items.map((collection) => (
                <Card
                  key={collection.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedCollectionId === collection.id ? "border-primary" : ""
                    }`}
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{collection.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {collection.totalSupply} NFTs
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isMinting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMint}
            disabled={isMinting}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              'Mint NFT'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 