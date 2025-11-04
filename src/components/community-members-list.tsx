'use client';

import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";

interface CommunityMembersListProps {
  communityId: number;
}

export function CommunityMembersList({ communityId }: CommunityMembersListProps) {
  const { data, isLoading } = api.community.getMembers.useQuery({ communityId });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
        <Shield className="h-8 w-8" />
        <p>No members yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {data.map((member) => (
        <div key={member.id}
          className="flex items-center gap-3 border-b border-border p-4 hover:bg-muted/50">
          <UserAvatar
            src={member.image}
            fallback={member.username[0]}
            className="h-10 w-10"
          />
          <div className="flex-1 min-w-0">
            <Link href={`/${member.username}`} className="font-semibold hover:underline block truncate">
              @{member.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              Joined {format(new Date(member.joinedAt), "PPP")}
            </p>
          </div>
          {member.role === "admin" && (
            <Badge variant="secondary">
              Admin
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
