'use client';

import { Compose } from "@/components/compose";
import { useRouter } from "next/navigation";

export function ComposePostView() {
  const router = useRouter();

  return (
    <Compose onSuccess={() => router.push('/home')} />
  );
} 