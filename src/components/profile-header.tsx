import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { ProfileResponse } from "@/server/api/routers/user";
import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
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

  const { mutate: follow, isPending: isFollowPending } = api.user.follow.useMutation({
    onSuccess: () => {
      utils.user.getProfileByUsername.invalidate();
    },
  });

  const { mutate: unfollow, isPending: isUnfollowPending } = api.user.unfollow.useMutation({
    onSuccess: () => {
      utils.user.getProfileByUsername.invalidate();
    },
  });

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
              className="h-[100px] w-[100px] text-3xl"
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
              <Button
                variant={profile.isFollowing ? "outline" : "default"}
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
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold">{`@${profile.username}`}</h1>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href={`/${profile.username}/following`}
              className="hover:underline"
            >
              <strong className="text-foreground">{profile.followingCount}</strong> Following
            </Link>
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