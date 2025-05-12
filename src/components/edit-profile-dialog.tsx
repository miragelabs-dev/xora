import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { UserAvatar } from "@/components/user-avatar";
import { useDefaultBanner } from "@/hooks/use-default-banner";
import { User } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  bio: z.string()
    .max(160, "Bio must be less than 160 characters")
    .nullable(),
  image: z.string().optional(),
  cover: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.secure_url;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username || "",
      bio: user.bio || "",
      image: user.image || "",
      cover: user.cover || "",
    },
  });

  const utils = api.useUtils();
  const image = form.watch("image");
  const cover = form.watch("cover");

  const { mutate: updateProfile, isPending } = api.user.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      onOpenChange(false);

      utils.auth.me.invalidate();

      utils.user.getProfileByUsername.invalidate({
        username: updatedUser.username
      });

      if (updatedUser.username !== user.username) {
        utils.post.feed.invalidate({
          userId: updatedUser.id
        });

        router.push(`/${updatedUser.username}`)
      }

      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("This username is already taken");
      } else {
        toast.error("Something went wrong. Please try again later");
      }
    },
  });

  const handleFileUpload = async (
    file: File,
    fieldName: "image" | "cover",
    setUploading: (value: boolean) => void
  ) => {
    try {
      setUploading(true);
      const url = await uploadFile(file);
      form.setValue(fieldName, url, { shouldDirty: true });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, "image", setIsUploading);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, "cover", setIsUploadingCover);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile({
      username: data.username,
      bio: data.bio || null,
      image: data.image || null,
      cover: data.cover || null,
    });
  };

  const ImageUploadOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
      <ImageIcon className="h-8 w-8 text-white" />
    </div>
  );

  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const defaultBanner = useDefaultBanner()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div
                className="relative h-32 w-full cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => coverInputRef.current?.click()}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
                {isUploadingCover ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {cover ? (
                      <Image
                        src={cover || defaultBanner}
                        alt="Cover"
                        fill
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <ImageUploadOverlay />
                  </>
                )}
              </div>

              <div className="flex items-center justify-center -mt-12 relative z-10">
                <div
                  className="relative rounded-full overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="relative h-24 w-24">
                    {isUploading ? (
                      <LoadingSpinner />
                    ) : (
                      <UserAvatar
                        src={image}
                        className="h-24 w-24 text-4xl transition-opacity group-hover:opacity-80"
                        fallback={user.username[0]}
                      />
                    )}
                    <ImageUploadOverlay />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your bio"
                        className="resize-none"
                        maxLength={160}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/160
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending || isUploading || isUploadingCover}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 