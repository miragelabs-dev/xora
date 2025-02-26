'use client';

import { ProfileProvider } from "@/contexts/profile-context";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

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
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
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
