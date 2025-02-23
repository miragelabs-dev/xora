import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: {
    name?: string;
    bio?: string;
  };
}

export function EditProfileDialog({
  open,
  onOpenChange,
  defaultValues,
}: EditProfileDialogProps) {
  const [name, setName] = useState(defaultValues.name || "");
  const [bio, setBio] = useState(defaultValues.bio || "");

  const utils = api.useUtils();

  const { mutate: updateProfile, isPending } = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              placeholder="Your bio"
              className="resize-none"
            />
            <span className="text-xs text-muted-foreground">
              {bio.length}/160
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => updateProfile({ name, bio })}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 