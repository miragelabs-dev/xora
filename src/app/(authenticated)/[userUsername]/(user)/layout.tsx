'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileProvider } from "@/contexts/profile-context";
import { api } from "@/utils/api";
import { notFound } from "next/navigation";

function ProfileSkeleton() {
  return (
    <div>
      <div className="h-32 sm:h-48 bg-muted animate-pulse" />
      <div className="px-4">
        <div className="flex justify-between items-end -mt-12">
          <div className="h-[100px] w-[100px] rounded-full border-4 border-background bg-muted" />
          <div className="h-9 w-28 rounded-full bg-muted" />
        </div>

        <div className="space-y-3 mt-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-4 w-full max-w-[300px]" />

          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-4 border-y">
        <div className="flex">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-[300px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserProfileLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { userUsername: string }
}) {
  const username = decodeURIComponent(params.userUsername);
  const { data: profile, isLoading } = api.user.getProfileByUsername.useQuery({
    username
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return notFound();
  }

  return (
    <ProfileProvider value={{ profile }}>
      {children}
    </ProfileProvider>
  );
}
