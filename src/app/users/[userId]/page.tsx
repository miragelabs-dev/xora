'use client';

import { Feed } from "@/components/feed";
import { ProfileHeader } from "@/components/profile-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserProfilePage({
  params
}: {
  params: { userId: string }
}) {
  const router = useRouter();
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
          <p className="text-sm text-muted-foreground">{profile.postsCount} posts</p>
        </div>
      </div>

      <ProfileHeader
        username={profile.username}
        name={profile.name}
        avatarSrc={profile.avatarUrl}
        coverSrc={profile.coverUrl}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        isCurrentUser={profile.isCurrentUser}
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