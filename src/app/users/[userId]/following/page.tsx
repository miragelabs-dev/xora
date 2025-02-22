'use client';

import { PageHeader } from "@/components/page-header";
import { UserList } from "@/components/user-list";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

export default function FollowingPage({
  params
}: {
  params: { userId: string }
}) {
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
      <PageHeader
        title={profile.name || `@${profile.username}`}
        subtitle="Following"
      />
      <UserList type="following" userId={profile.id} />
    </div>
  );
} 