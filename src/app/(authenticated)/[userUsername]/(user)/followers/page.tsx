'use client';

import { PageHeader } from "@/components/page-header";
import { UserList } from "@/components/user-list";
import { useProfile } from "@/contexts/profile-context";

export default function FollowersPage() {
  const { profile } = useProfile();

  return (
    <div>
      <PageHeader
        title={`@${profile.username}`}
        subtitle="Followers"
      />
      <UserList type="followers" userId={profile.id} />
    </div>
  );
} 