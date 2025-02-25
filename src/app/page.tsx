"use client";

import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { useAddress } from "@chopinframework/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const { login, isLoading, address } = useAddress();
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (address) {
      router.push(`/home`);
    }
  }, [address, router]);

  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      await login();
    } finally {
      setIsLoginLoading(false);
    }
  };

  if (isLoading) {
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
            Loading your experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative hidden w-1/2 flex-col bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 lg:flex"
      >
        <div className="relative flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95 backdrop-blur-sm opacity-90"
          />
          <div className="z-10 flex flex-col items-center space-y-8 px-12 text-center text-primary-foreground">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Logo
                className="size-20 p-2 rounded-full bg-background/20 shadow-xl ring-2 ring-primary-foreground/20"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-5xl font-bold leading-tight tracking-tight drop-shadow-lg"
            >
              Share Your<br />
              <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
                Story With Us
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-xl font-medium text-primary-foreground/80"
            >
              What&apos;s happening? Join us and find out!
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex w-full flex-col items-center justify-center bg-gradient-to-br from-background to-background/95 px-4 lg:w-1/2 lg:px-12"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:hidden"
            >
              <Logo
                className="size-10 p-2 rounded-full bg-background/90 shadow-md"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold leading-tight tracking-tight text-foreground"
            >
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Join Us Today
              </span>
              <br />
              <span className="text-foreground">
                We&apos;re Waiting For You
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-lg font-medium text-muted-foreground"
            >
              Connect and share with millions!
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleLogin}
              size="lg"
              disabled={isLoginLoading}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 font-semibold shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary disabled:opacity-70"
            >
              {isLoginLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Sign In Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

