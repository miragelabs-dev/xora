'use client';

import { Feed } from "@/components/feed";
import { PageHeader } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";

export default function UserProfilePage({
  params
}: {
  params: { userUsername: string }
}) {
  const username = decodeURIComponent(params.userUsername);

  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  const { data: profile, isLoading } = api.user.getProfileByUsername.useQuery({
    username
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return notFound();
  }

  return (
    <div>
      <PageHeader
        title={profile.name || `@${profile.username}`}
        subtitle={`${profile.postsCount} posts`}
      />

      <ProfileHeader
        userId={profile.id}
        username={profile.username}
        name={profile.name}
        bio={profile.bio}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        isCurrentUser={profile.isCurrentUser}
        isFollowing={profile.isFollowing}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'posts' | 'replies')}
        className="mt-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">
            Replies
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'posts' ? (
        <Feed type="user" userId={profile.id} />
      ) : (
        <Feed type="replies" userId={profile.id} />
      )}
    </div>
  );
} 