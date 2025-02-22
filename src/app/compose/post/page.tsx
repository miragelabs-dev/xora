'use client';

import { Compose } from "@/components/compose";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComposePage() {
  const router = useRouter();

  return (
    <div>
      <div className="sticky top-0 z-[25] flex h-[53px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">New Post</h1>
      </div>
      <Compose onSuccess={() => router.push('/home')} />
    </div>
  );
} 