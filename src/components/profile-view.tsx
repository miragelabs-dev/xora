'use client';

import { CryptoPriceTag } from "@/components/crypto-price-tag";
import { Feed } from "@/components/feed";
import { ProfileHeader } from "@/components/profile-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCollectionsView } from "@/components/user-collections-view";
import { api } from "@/utils/api";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";

export function ProfileView({
  username
}: {
  username: string;
}) {
  api.user.updateTransactionCount.useQuery({ userUsername: username });
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'nft-collections'>('posts');

  const { data: profile, isLoading } = api.user.getProfileByUsername.useQuery({
    username
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return notFound();
  }

  return (
    <div>
      <ProfileHeader profile={profile} />

      {profile.isCryptoBot && (
        <div className="mt-4 px-4">
          <CryptoPriceTag symbol={profile.address} />
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'posts' | 'replies' | 'nft-collections')}
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
              <TabsTrigger value="nft-collections" className="flex-1">
                NFT Collections
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>

      {activeTab === 'posts' ? (
        <Feed type="user" userId={profile.id} />
      ) : activeTab === 'replies' ? (
        <Feed type="replies" userId={profile.id} />
      ) : activeTab === 'nft-collections' ? (
        <UserCollectionsView userId={profile.id} />
      ) : (
        <Feed type="interests" userId={profile.id} />
      )}
    </div>
  );
}


function ProfileSkeleton() {
  return (
    <div>
      <div className="h-32 sm:h-48 bg-muted animate-pulse" />
      <div className="px-4">
        <div className="flex justify-between items-end -mt-12">
          <div className="h-[100px] w-[100px] rounded-full border-4 border-background bg-muted" />
          <div className="h-9 w-28 rounded-full bg-muted" />
        </div>

        <div className="space-y-3 mt-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-4 w-full max-w-[300px]" />

          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-4 border-y">
        <div className="flex">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-[300px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
