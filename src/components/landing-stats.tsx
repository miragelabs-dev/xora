'use client';

import { api } from "@/utils/api";
import { motion } from "framer-motion";

export function LandingStats() {
  const { data: stats } = api.user.getLandingStats.useQuery();

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="grid grid-cols-3 gap-4 w-full"
    >
      {[
        { label: 'Active Users', value: stats.usersCount },
        { label: 'Posts', value: stats.postsCount },
        { label: 'Interactions', value: stats.interactionsCount }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
          className="flex flex-col items-center p-3 rounded-xl bg-primary/5 border border-primary/10"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {stat.value}+
          </span>
          <span className="text-xs text-muted-foreground">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
} 