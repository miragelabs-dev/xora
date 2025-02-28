import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionWithCreator } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { CollectionForm, type CollectionFormValues } from "./collection-form";

interface EditCollectionModalProps {
  collection: CollectionWithCreator;
  children: React.ReactNode;
}

export function EditCollectionModal({
  collection,
  children,
}: EditCollectionModalProps) {
  const utils = api.useUtils();

  const [isOpen, setIsOpen] = useState(false);

  const { mutate: updateCollection, isPending } = api.nft.updateCollection.useMutation({
    onSuccess: () => {
      toast.success('Collection updated successfully');
      utils.nft.getCollections.invalidate();
      utils.nft.getCollectionById.invalidate({ collectionId: collection.id });
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: CollectionFormValues) => {
    updateCollection({
      id: collection.id,
      ...data,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Edit your NFT collection details.
          </DialogDescription>
        </DialogHeader>

        <CollectionForm
          defaultValues={collection}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
} 