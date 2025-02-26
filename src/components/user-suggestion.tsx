'use client';

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import Link from "next/link";

interface UserSuggestionProps {
  user: {
    id: number;
    username: string;
    name: string | null;
    image: string | null;
  };
}

export function UserSuggestion({ user }: UserSuggestionProps) {
  const utils = api.useUtils();

  const { mutate: follow, isPending } = api.user.follow.useMutation({
    onSuccess: () => {
      utils.user.getRandomSuggestions.invalidate();
    },
  });

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/${user.username}`}
        className="flex flex-1 items-center gap-2 min-w-0"
      >
        <UserAvatar
          src={user.image}
          className="h-10 w-10"
          fallback={user.username[0]}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-sm truncate">
            {user.name || `@${user.username}`}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </Link>
      <Button
        variant="outline"
        className="ml-4"
        onClick={() => follow({ userId: user.id })}
        disabled={isPending}
      >
        Follow
      </Button>
    </div>
  );
} 