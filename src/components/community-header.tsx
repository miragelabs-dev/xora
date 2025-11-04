'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDefaultBanner } from "@/hooks/use-default-banner";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import Image from "next/image";
import { toast } from "sonner";

type Community = RouterOutputs["community"]["getById"];

interface CommunityHeaderProps {
  community: Community;
}

export function CommunityHeader({ community }: CommunityHeaderProps) {
  const utils = api.useUtils();
  const defaultBanner = useDefaultBanner();

  const { mutate: requestToJoin, isPending: isRequesting } = api.community.requestToJoin.useMutation({
    onSuccess: () => {
      toast.success("Join request sent");
      utils.community.getById.invalidate({ communityId: community.id });
      utils.community.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: cancelJoinRequest, isPending: isCancelling } = api.community.cancelJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Join request cancelled");
      utils.community.getById.invalidate({ communityId: community.id });
      utils.community.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const memberCount = Number(community.memberCount ?? 0);
  const isPending = community.hasPendingRequest;
  const isMember = community.isMember;
  const isAdmin = community.isAdmin;

  const handleJoin = () => {
    requestToJoin({ communityId: community.id });
  };

  const handleCancel = () => {
    cancelJoinRequest({ communityId: community.id });
  };

  const renderActionButton = () => {
    if (isAdmin) {
      return (
        null
      );
    }

    if (isMember) {
      return (
        <Badge variant="secondary">
          Joined
        </Badge>
      );
    }

    if (isPending) {
      return (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          Cancel request
        </Button>
      );
    }

    return (
      <Button
        className="rounded-full"
        onClick={handleJoin}
        disabled={isRequesting}
      >
        Join community
      </Button>
    );
  };

  return (
    <div className="relative">
      <div className="relative h-32 w-full overflow-hidden border-b sm:h-48">
        <Image
          src={community.cover || defaultBanner}
          alt={`${community.title} cover`}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="space-y-4 px-4 pb-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{community.title}</h1>
            <p className="text-sm text-muted-foreground">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </p>
          </div>
          {renderActionButton()}
        </div>

        {community.description && (
          <p className="text-sm text-muted-foreground">
            {community.description}
          </p>
        )}
      </div>
    </div>
  );
}
