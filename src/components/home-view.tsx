'use client';

import { Compose } from "@/components/compose";
import { Feed } from "@/components/feed";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";

export function HomeView() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'interests'>('for-you');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sticky top-0 z-[25] h-auto w-full bg-background/80 backdrop-blur">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'for-you' | 'following' | 'interests')}>
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex-1">
              Interests
            </TabsTrigger>
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
        {activeTab === 'for-you' ? (
          <Feed />
        ) : activeTab === 'following' ? (
          <Feed type="following" />
        ) : (
          <Feed type="interests" />
        )}
      </motion.div>
    </motion.div>
  );
} 