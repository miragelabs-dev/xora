'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "./user-avatar";

interface CommunityJoinRequestsProps {
  communityId: number;
}

export function CommunityJoinRequests({ communityId }: CommunityJoinRequestsProps) {
  const utils = api.useUtils();
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);

  const { data, isLoading } = api.community.getJoinRequests.useQuery({ communityId });

  const approveMutation = api.community.approveJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Join request approved");
      utils.community.getJoinRequests.invalidate({ communityId });
      utils.community.getMembers.invalidate({ communityId });
      utils.community.getById.invalidate({ communityId });
      utils.community.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setProcessingUserId(null);
    },
  });

  const rejectMutation = api.community.rejectJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Join request rejected");
      utils.community.getJoinRequests.invalidate({ communityId });
      utils.community.getById.invalidate({ communityId });
      utils.community.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setProcessingUserId(null);
    },
  });

  const handleApprove = (userId: number) => {
    setProcessingUserId(userId);
    approveMutation.mutate({ communityId, userId });
  };

  const handleReject = (userId: number) => {
    setProcessingUserId(userId);
    rejectMutation.mutate({ communityId, userId });
  };

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
        <UserPlus className="h-8 w-8" />
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <Card className="divide-y">
      {data.map((request) => {
        const isProcessing = processingUserId === request.userId && (approveMutation.isPending || rejectMutation.isPending);

        return (
          <div key={request.id} className="flex items-center gap-3 p-4">
            <UserAvatar
              src={request.image}
              fallback={request.username[0]}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <Link href={`/${request.username}`} className="font-semibold hover:underline block truncate">
                @{request.username}
              </Link>
              <p className="text-xs text-muted-foreground">
                Requested at {format(new Date(request.requestedAt), "PPpp")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReject(request.userId)}
                disabled={isProcessing}
              >
                {isProcessing && rejectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(request.userId)}
                disabled={isProcessing}
              >
                {isProcessing && approveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Approve
              </Button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
