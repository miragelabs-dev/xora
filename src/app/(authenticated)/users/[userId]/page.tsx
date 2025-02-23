'use client';

import { Feed } from "@/components/feed";
import { PageHeader } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function UserProfilePage({
  params
}: {
  params: { userId: string }
}) {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
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
        subtitle={`${profile.postsCount} posts`}
      />

      <ProfileHeader
        userId={profile.id}
        username={profile.username}
        name={profile.name}
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
        <Feed type="user" userId={parseInt(params.userId)} />
      ) : (
        <Feed type="replies" userId={parseInt(params.userId)} />
      )}
    </div>
  );
} 