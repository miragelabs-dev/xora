import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfileHeaderProps {
  username: string;
  name?: string;
  avatarSrc?: string;
  coverSrc?: string;
  followersCount?: number;
  followingCount?: number;
  isCurrentUser?: boolean;
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
  className
}: ProfileHeaderProps) {
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
            <Button>Follow</Button>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold">{name || `@${username}`}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{followingCount}</strong> Following
          </span>
          <span>
            <strong className="text-foreground">{followersCount}</strong> Followers
          </span>
        </div>
      </div>
    </div>
  );
} 