import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { CollectionForm } from "./collection-form";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCollectionModal({
  isOpen,
  onClose,
}: CreateCollectionModalProps) {
  const utils = api.useUtils();

  const { mutate: createCollection, isPending } = api.nft.createCollection.useMutation({
    onSuccess: () => {
      toast.success('Collection created successfully');
      utils.nft.getCollections.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => onClose(), 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Create a new NFT collection to mint your posts.
          </DialogDescription>
        </DialogHeader>

        <CollectionForm
          onSubmit={createCollection}
          isSubmitting={isPending}
          submitLabel="Create Collection"
        />
      </DialogContent>
    </Dialog>
  );
} 