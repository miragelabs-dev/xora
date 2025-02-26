'use client';

import { PageHeader } from "@/components/page-header";
import { UserList } from "@/components/user-list";
import { useProfile } from "@/contexts/profile-context";

export default function FollowingPage() {
  const { profile } = useProfile();

  return (
    <div>
      <PageHeader
        title={`@${profile.username}`}
        subtitle="Following"
      />
      <UserList type="following" userId={profile.id} />
    </div>
  );
} 