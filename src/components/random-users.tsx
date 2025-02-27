'use client';

import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { motion } from "framer-motion";

export function RandomUsers() {
  const { data: users } = api.user.getRandomUsers.useQuery({
    limit: 5
  });

  if (!users?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="flex -space-x-3"
    >
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
          className="ring-2 ring-background rounded-full"
        >
          <UserAvatar
            src={user.image}
            fallback={user.username[0]}
            className="h-10 w-10 border-2 border-background"
          />
        </motion.div>
      ))}
    </motion.div>
  );
} 