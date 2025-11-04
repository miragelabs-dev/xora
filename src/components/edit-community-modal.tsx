import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Community } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { CommunityForm, type CommunityFormSubmitValues } from "./community-form";

interface EditCommunityModalProps {
  community: Pick<Community, "id" | "title" | "cover" | "description">;
  children: React.ReactNode;
}

export function EditCommunityModal({
  community,
  children,
}: EditCommunityModalProps) {
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: updateCommunity, isPending } = api.community.update.useMutation({
    onSuccess: () => {
      toast.success("Community updated successfully");
      utils.community.list.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (values: CommunityFormSubmitValues) => {
    updateCommunity({
      communityId: community.id,
      title: values.title,
      cover: values.cover,
      description: values.description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
          <DialogDescription>
            Update the community details.
          </DialogDescription>
        </DialogHeader>

        <CommunityForm
          defaultValues={community}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
