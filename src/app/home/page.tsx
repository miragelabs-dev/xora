'use client';

import { Compose } from "@/components/compose";
import { Feed } from "@/components/feed";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');

  return (
    <div>
      <div className="sticky top-0 z-[25] h-auto w-full bg-background/80 backdrop-blur">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'for-you' | 'following')}>
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Compose />

      {activeTab === 'for-you' ? (
        <Feed />
      ) : (
        <Feed type="following" />
      )}
    </div>
  );
}
