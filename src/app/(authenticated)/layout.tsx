// 'use client';

import { Navbar } from "@/components/navbar";
import { RightSidebar } from "@/components/right-sidebar";
import { cn } from "@/lib/utils";
import { SessionProvider } from "../session-provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className={cn(
        "mx-auto flex min-h-[100svh] max-w-[1350px] flex-col flex-nowrap items-stretch justify-center pb-14 sm:flex-row sm:pb-0",
      )}>
        <Navbar />
        <main className="flex flex-grow">
          <div className="relative w-full border-x border-border sm:w-[610px]">
            {children}
          </div>
          <RightSidebar />
        </main>
      </div>
    </SessionProvider>
  );
}

