'use client';

import { useSession } from "@/app/session-provider";
import { Compose } from "@/components/compose";
import { Feed } from "@/components/feed";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function HomeView() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<string>('for-you');

  const { data: joinedCommunitiesData } = api.community.joined.useQuery(undefined, {
    enabled: !!user,
  });

  const joinedCommunities = joinedCommunitiesData ?? [];

  useEffect(() => {
    if (activeTab.startsWith('community-')) {
      const communityId = Number(activeTab.replace('community-', ''));
      const communityExists = joinedCommunities.some((community) => community.id === communityId);

      if (!communityExists) {
        setActiveTab('for-you');
      }
    }
  }, [activeTab, joinedCommunities]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderFeed = () => {
    if (activeTab === 'for-you') {
      return <Feed />;
    }

    if (activeTab === 'following') {
      return <Feed type="following" />;
    }

    if (activeTab === 'interests') {
      return <Feed type="interests" />;
    }

    if (activeTab.startsWith('community-')) {
      const communityId = Number(activeTab.replace('community-', ''));
      if (!Number.isNaN(communityId)) {
        return <Feed type="community" communityId={communityId} />;
      }
    }

    return <Feed />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sticky top-0 z-[25] h-auto w-full bg-background/80 backdrop-blur">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start gap-1 overflow-x-auto px-1 sm:gap-2 sm:px-2">
            <TabsTrigger value="for-you" className="shrink-0 px-3 sm:px-4">
              For You
            </TabsTrigger>
            {user && (
              <TabsTrigger value="following" className="shrink-0 px-3 sm:px-4">
                Following
              </TabsTrigger>
            )}
            <TabsTrigger value="interests" className="shrink-0 px-3 sm:px-4">
              Interests
            </TabsTrigger>
            {joinedCommunities.map((community) => (
              <TabsTrigger
                key={community.id}
                value={`community-${community.id}`}
                className="shrink-0 px-3 sm:px-4"
              >
                {community.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Compose />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {renderFeed()}
      </motion.div>
    </motion.div>
  );
}
