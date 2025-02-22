import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";

interface ProfileHeaderProps {
  username: string;
  name?: string;
  avatarSrc?: string;
  coverSrc?: string;
  followersCount?: number;
  followingCount?: number;
  isCurrentUser?: boolean;
  isFollowing?: boolean;
  userId: number;
  className?: string;
}

export function ProfileHeader({
  username,
  name,
  avatarSrc,
  coverSrc = "",
  followersCount = 0,
  followingCount = 0,
  isCurrentUser = false,
  isFollowing = false,
  userId,
  className
}: ProfileHeaderProps) {
  const utils = api.useUtils();

  const { mutate: follow, isPending: isFollowPending } = api.user.follow.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
    },
  });

  const { mutate: unfollow, isPending: isUnfollowPending } = api.user.unfollow.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
    },
  });

  return (
    <div className={cn("relative space-y-3", className)}>
      <div className="relative h-32 w-full overflow-hidden sm:h-48">
        <Image
          src={coverSrc}
          alt={`${username}'s cover`}
          className="object-cover"
          fill
          priority
        />
      </div>

      <div className="space-y-3 px-4">
        <div className="flex justify-between">
          <UserAvatar
            className="size-24 text-3xl"
            src={avatarSrc}
            fallback={username[0]}
          />

          {isCurrentUser ? (
            <Button variant="outline">Edit Profile</Button>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={() => {
                if (isFollowing) {
                  unfollow({ userId });
                } else {
                  follow({ userId });
                }
              }}
              disabled={isFollowPending || isUnfollowPending}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold">{name || `@${username}`}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link
            href={`/users/${userId}/following`}
            className="hover:underline"
          >
            <strong className="text-foreground">{followingCount}</strong> Following
          </Link>
          <Link
            href={`/users/${userId}/followers`}
            className="hover:underline"
          >
            <strong className="text-foreground">{followersCount}</strong> Followers
          </Link>
        </div>
      </div>
    </div>
  );
} 