'use client';

import { CommunityHeader } from "@/components/community-header";
import { CommunityJoinRequests } from "@/components/community-join-requests";
import { CommunityMembersList } from "@/components/community-members-list";
import { Feed, FeedSkeleton } from "@/components/feed";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface CommunityViewProps {
  communityId: number;
}

export function CommunityView({ communityId }: CommunityViewProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'requests'>('posts');
  const { data: community, isLoading } = api.community.getById.useQuery({ communityId });

  if (isLoading) {
    return <CommunityViewSkeleton />;
  }

  if (!community) {
    return notFound();
  }

  const isMember = community.isMember || community.isAdmin;
  const isAdmin = community.isAdmin;
  const pendingRequestCount = Number(community.pendingRequestCount ?? 0);

  return (
    <div>
      <CommunityHeader community={community} />

      {isMember ? (
        <>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="mt-4"
          >
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                Members
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="requests" className="flex-1">
                  Join Requests
                  {pendingRequestCount > 0 && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 text-xs text-primary">
                      {pendingRequestCount}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
          <div>
            {activeTab === 'posts' && (
              <Feed type="community" communityId={communityId} />
            )}
            {activeTab === 'members' && (
              <CommunityMembersList communityId={communityId} />
            )}
            {activeTab === 'requests' && isAdmin && (
              <CommunityJoinRequests communityId={communityId} />
            )}
          </div>
        </>
      ) : (
        <Card className="mx-4 mt-4 border-dashed">
          <div className="p-6 text-center text-sm text-muted-foreground">
            {community.hasPendingRequest
              ? "Your join request is pending approval."
              : "Join this community to see its posts and members."}
          </div>
        </Card>
      )}
    </div>
  );
}

function CommunityViewSkeleton() {
  return (
    <div>
      <div className="h-32 w-full animate-pulse bg-muted sm:h-48" />
      <div className="space-y-4 px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-3/4 max-w-md" />
      </div>
      <div className="mt-4 px-4">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="mt-4">
        <FeedSkeleton />
      </div>
    </div>
  );
}
