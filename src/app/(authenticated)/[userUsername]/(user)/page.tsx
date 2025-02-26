'use client';

import { Feed } from "@/components/feed";
import { PageHeader } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/contexts/profile-context";
import { useState } from "react";

export default function UserProfilePage() {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');

  return (
    <div>
      <PageHeader
        title={`@${profile.username}`}
        subtitle={`${profile.postsCount} posts`}
      />

      <ProfileHeader
        profile={profile}
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