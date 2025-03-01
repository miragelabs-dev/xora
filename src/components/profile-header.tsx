'use client';

import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { cn } from "@/lib/utils";
import type { ProfileResponse } from "@/server/api/routers/user";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: ProfileResponse;
  className?: string;
}

export function ProfileHeader({
  profile,
  className
}: ProfileHeaderProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();

  const { mutate: follow, isPending: isFollowPending } = api.user.follow.useMutation({
    onSuccess: () => {
      utils.user.getProfileByUsername.invalidate({ username: profile.username });
    },
  });

  const { mutate: unfollow, isPending: isUnfollowPending } = api.user.unfollow.useMutation({
    onSuccess: () => {
      utils.user.getProfileByUsername.invalidate({ username: profile.username });
    },
  });

  const { mutate: sendMessage } = api.message.sendMessage.useMutation({
    onSuccess: () => {
      router.push('/messages');
    },
  });

  const handleMessageClick = () => {
    router.push(`/messages/${profile.id}`);
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="relative h-32 border-b w-full overflow-hidden sm:h-48">
          <Image
            src={profile.cover || '/defaults/banner.jpeg'}
            alt={`${profile.username}'s cover`}
            className="object-cover"
            fill
            priority
          />
        </div>

        <div className="space-y-3 px-4 -mt-12">
          <div className="flex justify-between items-end">
            <UserAvatar
              src={profile.image}
              className="h-[100px] w-[100px] text-3xl border-4 border-background"
              fallback={profile.username[0]}
            />

            {profile.isCurrentUser ? (
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={profile.isFollowing ? "dark" : "light"}
                  onClick={() => {
                    if (profile.isFollowing) {
                      unfollow({ userId: profile.id });
                    } else {
                      follow({ userId: profile.id });
                    }
                  }}
                  disabled={isFollowPending || isUnfollowPending}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleMessageClick}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{`@${profile.username}`}</h1>
              {profile.isCryptoBot ? (
                <div className="animate-in zoom-in duration-300 flex items-center">
                  <div className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 transition-colors rounded-full pl-2 pr-2.5 py-0.5">
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary text-xs font-semibold tracking-wide">
                      CRYPTO BOT
                    </span>
                    <VerifiedBadge className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ) : profile.isVerified && (
                <div className="animate-in zoom-in duration-300">
                  <VerifiedBadge />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>

          <div className="flex gap-2 text-sm items-center text-muted-foreground">
            <CalendarIcon className="size-4" />
            Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            {!profile.isCryptoBot && <Link
              href={`/${profile.username}/following`}
              className="hover:underline"
            >
              <strong className="text-foreground">{profile.followingCount}</strong> Following
            </Link>}
            <Link
              href={`/${profile.username}/followers`}
              className="hover:underline"
            >
              <strong className="text-foreground">{profile.followersCount}</strong> Followers
            </Link>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        user={profile}
      />
    </>
  );
} 