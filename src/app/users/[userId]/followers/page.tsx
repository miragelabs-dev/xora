'use client';

import { Button } from "@/components/ui/button";
import { UserList } from "@/components/user-list";
import { api } from "@/utils/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FollowersPage({
  params
}: {
  params: { userId: string }
}) {
  const router = useRouter();
  const { data: profile, isLoading } = api.user.getProfile.useQuery({
    userId: parseInt(params.userId)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-[25] flex h-[53px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{profile.name || `@${profile.username}`}</h1>
          <p className="text-sm text-muted-foreground">Followers</p>
        </div>
      </div>

      <UserList type="followers" userId={profile.id} />
    </div>
  );
} 