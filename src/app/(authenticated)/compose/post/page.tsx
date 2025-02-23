'use client';

import { Compose } from "@/components/compose";
import { PageHeader } from "@/components/page-header";
import { useRouter } from "next/navigation";

export default function ComposePage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader title="New Post" />
      <Compose onSuccess={() => router.push('/home')} />
    </div>
  );
} 