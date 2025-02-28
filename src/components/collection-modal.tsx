import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Collection } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const collectionSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be less than 255 characters"),
  symbol: z.string()
    .min(2, "Symbol must be at least 2 characters")
    .max(10, "Symbol must be less than 10 characters")
    .regex(/^[A-Z]+$/, "Symbol must be uppercase letters only"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection;
  mode: 'create' | 'edit';
}

export function CollectionModal({
  isOpen,
  onClose,
  collection,
  mode
}: CollectionModalProps) {
  const utils = api.useUtils();

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name ?? '',
      symbol: collection?.symbol ?? '',
      description: collection?.description ?? '',
    },
  });

  const { mutate: createCollection, isPending: isCreating } = api.nft.createCollection.useMutation({
    onSuccess: () => {
      toast.success('Collection created successfully');
      utils.nft.getCollections.invalidate();
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateCollection, isPending: isUpdating } = api.nft.updateCollection.useMutation({
    onSuccess: () => {
      toast.success('Collection updated successfully');
      utils.nft.getCollections.invalidate();
      utils.nft.getCollectionById.invalidate({ collectionId: collection!.id });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CollectionFormValues) => {
    if (mode === 'create') {
      createCollection(data);
    } else {
      updateCollection({
        id: collection!.id,
        ...data,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Collection' : 'Edit Collection'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new NFT collection to mint your posts.'
              : 'Edit your NFT collection details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Collection name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SYMBOL"
                      {...field}
                      value={field.value.toUpperCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Collection description"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'create' ? 'Create' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 