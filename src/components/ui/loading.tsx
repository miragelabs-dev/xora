"use client";

import { Logo } from "@/components/icons/logo";
import { motion } from "framer-motion";

export function Loading({ message = "Loading your experience..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Logo className="size-16 p-3 rounded-full bg-primary/10 shadow-xl ring-2 ring-primary/20" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-muted-foreground"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
} 