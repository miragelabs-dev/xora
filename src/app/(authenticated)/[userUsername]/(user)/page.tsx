'use client';

import { CryptoPriceTag } from "@/components/crypto-price-tag";
import { Feed } from "@/components/feed";
import { PageHeader } from "@/components/page-header";
import { ProfileHeader } from "@/components/profile-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/contexts/profile-context";
import { useState } from "react";

export default function UserProfilePage() {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'interests'>('posts');

  return (
    <div>
      <PageHeader
        title={`@${profile.username}`}
        subtitle={`${profile.postsCount} posts`}
      />

      <ProfileHeader
        profile={profile}
      />

      {profile.isCryptoBot && (
        <div className="mt-4 px-4">
          <CryptoPriceTag symbol={profile.address} />
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'posts' | 'replies' | 'interests')}
        className="mt-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">
            Posts
          </TabsTrigger>
          {!profile.isCryptoBot && (
            <>
              <TabsTrigger value="replies" className="flex-1">
                Replies
              </TabsTrigger>
              <TabsTrigger value="interests" className="flex-1">
                Interests
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>

      {activeTab === 'posts' ? (
        <Feed type="user" userId={profile.id} />
      ) : activeTab === 'replies' ? (
        <Feed type="replies" userId={profile.id} />
      ) : (
        <Feed type="interests" userId={profile.id} />
      )}
    </div>
  );
} 