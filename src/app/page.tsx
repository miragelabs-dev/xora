"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 lg:flex">
        <div className="relative flex h-full items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95 backdrop-blur-sm opacity-90" />
          <div className="z-10 flex flex-col items-center space-y-8 px-12 text-center text-primary-foreground">
            <div>
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full bg-background/10 p-2 shadow-xl ring-2 ring-primary-foreground/20"
              />
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight drop-shadow-lg">
              Explore the World<br />
              <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
                Anytime, Anywhere
              </span>
            </h1>
            <p className="text-xl font-medium text-primary-foreground/80">
              Follow trends, stay connected with the world!
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-br from-background to-background/95 px-4 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="lg:hidden">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full bg-background/90 p-2 shadow-md"
              />
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Start Your Story
              </span>
              <br />
              Join the Community
            </h2>
            <p className="text-lg font-medium text-muted-foreground">
              Take your place among millions and discover the world!
            </p>
          </div>

          <div>
            <Button
              asChild
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 font-semibold shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary"
            >
              <Link href="/api/auth/login">
                Sign In Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

