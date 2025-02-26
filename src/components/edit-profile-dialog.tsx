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
import { User } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().max(50, "Name is too long").optional(),
  bio: z.string().max(160, "Bio must be less than 160 characters"),
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
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      image: user.image || "",
      cover: user.cover || "",
    },
  });

  const utils = api.useUtils();
  const image = form.watch("image");
  const cover = form.watch("cover");

  const { mutate: updateProfile, isPending } = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfileByUsername.invalidate();
      onOpenChange(false);
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
      name: data.name || null,
      bio: data.bio || null,
      image: data.image || null,
      cover: data.cover || null
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
                        src={cover || '/defaults/banner.jpeg'}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} maxLength={50} />
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
                disabled={isPending || isUploading || isUploadingCover || !form.formState.isDirty}
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