'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { CommunityForm, type CommunityFormSubmitValues } from "./community-form";

interface CreateCommunityModalProps {
  children: ReactNode;
}

export function CreateCommunityModal({ children }: CreateCommunityModalProps) {
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: createCommunity, isPending } = api.community.create.useMutation({
    onSuccess: () => {
      toast.success("Community created successfully");
      utils.community.list.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (values: CommunityFormSubmitValues) => {
    createCommunity(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>
            Create a new community for members to connect.
          </DialogDescription>
        </DialogHeader>

        <CommunityForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Create Community"
        />
      </DialogContent>
    </Dialog>
  );
}
