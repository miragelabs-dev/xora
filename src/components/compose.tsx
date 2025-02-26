'use client';

import { useSession } from "@/app/session-provider";
import { api } from "@/utils/api";
import { ComposeForm } from "./compose-form";

export function Compose({ onSuccess }: { onSuccess?: () => void }) {
  const utils = api.useUtils();
  const { user } = useSession();

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      onSuccess?.();
    },
  });

  return (
    <div className="p-3 sm:p-4 border-b">
      <ComposeForm
        user={user}
        onSubmit={({ content, image }) => createPost({ content, image })}
        isSubmitting={isPending}
      />
    </div>
  );
} 