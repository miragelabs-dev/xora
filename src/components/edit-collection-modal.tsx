import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Collection } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { CollectionForm, type CollectionFormValues } from "./collection-form";

interface EditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
}

export function EditCollectionModal({
  isOpen,
  onClose,
  collection,
}: EditCollectionModalProps) {
  const utils = api.useUtils();

  const { mutate: updateCollection, isPending } = api.nft.updateCollection.useMutation({
    onSuccess: () => {
      toast.success('Collection updated successfully');
      utils.nft.getCollections.invalidate();
      utils.nft.getCollectionById.invalidate({ collectionId: collection.id });
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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