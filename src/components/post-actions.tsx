'use client';

import { Button } from "@/components/ui/button";
import { PostView } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import Link from "next/link";
import React, { JSX, useState } from "react";
import { MintNFTModal } from "./mint-nft-modal";
import { ShareButton } from "./share-button";

interface PostStats {
  repliesCount: number;
  repostsCount: number;
  likesCount: number;
  savesCount: number;
}

interface PostInteractions {
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  isOwner: boolean;
}

interface PostActionsProps {
  postId: number;
  nft: PostView['nft'];
  stats: PostStats;
  interactions: PostInteractions;
  authorUsername: string;
  className?: string;
}

export function PostActions({ postId, nft, stats, interactions, authorUsername, className }: PostActionsProps) {
  const utils = api.useUtils();

  const [optimisticInteractions, setOptimisticInteractions] = useState(interactions);
  const [optimisticStats, setOptimisticStats] = useState({
    likesCount: Number(stats.likesCount),
    repostsCount: Number(stats.repostsCount),
    savesCount: Number(stats.savesCount),
  });
  const [loadingStates, setLoadingStates] = useState({
    isLikeLoading: false,
    isRepostLoading: false,
    isSaveLoading: false,
  });
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  const invalidateQueries = () => {
    utils.post.feed.invalidate();
    utils.post.getById.invalidate({ postId });
    utils.post.bookmarks.invalidate();
    utils.post.getReplies.invalidate();
  };

  const { mutate: like } = api.post.like.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isLikeLoading: true }));
      updateOptimisticState('like', true);
    },
    onError: () => updateOptimisticState('like', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isLikeLoading: false })),
  });

  const { mutate: unlike } = api.post.unlike.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isLikeLoading: true }));
      updateOptimisticState('unlike', true);
    },
    onError: () => updateOptimisticState('unlike', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isLikeLoading: false })),
  });

  const { mutate: repost } = api.post.repost.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isRepostLoading: true }));
      updateOptimisticState('repost', true);
    },
    onError: () => updateOptimisticState('repost', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isRepostLoading: false })),
  });

  const { mutate: unrepost } = api.post.unrepost.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isRepostLoading: true }));
      updateOptimisticState('unrepost', true);
    },
    onError: () => updateOptimisticState('unrepost', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isRepostLoading: false })),
  });

  const { mutate: save } = api.post.save.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isSaveLoading: true }));
      updateOptimisticState('save', true);
    },
    onError: () => updateOptimisticState('save', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isSaveLoading: false })),
  });

  const { mutate: unsave } = api.post.unsave.useMutation({
    onMutate: () => {
      setLoadingStates(prev => ({ ...prev, isSaveLoading: true }));
      updateOptimisticState('unsave', true);
    },
    onError: () => updateOptimisticState('unsave', false),
    onSuccess: invalidateQueries,
    onSettled: () => setLoadingStates(prev => ({ ...prev, isSaveLoading: false })),
  });

  const updateOptimisticState = (action: 'like' | 'unlike' | 'repost' | 'unrepost' | 'save' | 'unsave', isSuccess: boolean) => {
    const updates: Record<string, { stat: keyof typeof optimisticStats, interaction: keyof typeof optimisticInteractions }> = {
      like: { stat: 'likesCount', interaction: 'isLiked' },
      unlike: { stat: 'likesCount', interaction: 'isLiked' },
      repost: { stat: 'repostsCount', interaction: 'isReposted' },
      unrepost: { stat: 'repostsCount', interaction: 'isReposted' },
      save: { stat: 'savesCount', interaction: 'isSaved' },
      unsave: { stat: 'savesCount', interaction: 'isSaved' },
    };

    const { stat, interaction } = updates[action];
    const increment = action.startsWith('un') ? -1 : 1;
    const value = !action.startsWith('un');

    setOptimisticStats(prev => ({
      ...prev,
      [stat]: Number(prev[stat]) + (isSuccess ? increment : -increment),
    }));

    setOptimisticInteractions(prev => ({
      ...prev,
      [interaction]: isSuccess ? value : !value,
    }));
  };

  const renderActionButton = (
    icon: JSX.Element,
    count: number,
    isActive: boolean,
    isLoading: boolean,
    onClick: (e: React.MouseEvent) => void,
    activeColor: string
  ) => (
    <Button
      variant="ghost"
      size="icon"
      className="gap-2 py-0 hover:bg-transparent"
      onClick={onClick}
      disabled={isLoading}
    >
      {React.cloneElement(icon, {
        className: cn("h-5 w-5", isActive && activeColor)
      })}
      <span className="text-sm">{count}</span>
    </Button>
  );

  return (
    <>
      <div
        className={cn("mt-2 flex justify-between gap-4 items-center text-muted-foreground", className)}
        data-no-navigate
      >
        <div className="flex-1 flex justify-between flex-2">
          <Link href={`/${authorUsername}/status/${postId}`} className="gap-2">
            {renderActionButton(
              <MessageCircle />,
              stats.repliesCount,
              false,
              false,
              (e) => e.stopPropagation(),
              ""
            )}
          </Link>

          {renderActionButton(
            <Repeat2 />,
            optimisticStats.repostsCount,
            optimisticInteractions.isReposted,
            loadingStates.isRepostLoading,
            (e) => {
              e.preventDefault();
              if (!loadingStates.isRepostLoading) {
                void (optimisticInteractions.isReposted ? unrepost({ postId }) : repost({ postId }));
              }
            },
            "text-green-500"
          )}

          {renderActionButton(
            <Heart />,
            optimisticStats.likesCount,
            optimisticInteractions.isLiked,
            loadingStates.isLikeLoading,
            (e) => {
              e.preventDefault();
              if (!loadingStates.isLikeLoading) {
                void (optimisticInteractions.isLiked ? unlike({ postId }) : like({ postId }));
              }
            },
            "text-red-500"
          )}

          {renderActionButton(
            <Bookmark />,
            optimisticStats.savesCount,
            optimisticInteractions.isSaved,
            loadingStates.isSaveLoading,
            (e) => {
              e.preventDefault();
              if (!loadingStates.isSaveLoading) {
                void (optimisticInteractions.isSaved ? unsave({ postId }) : save({ postId }));
              }
            },
            "text-blue-500"
          )}
        </div>

        <>
          {nft ? (
            <Link href={`/nft-collections/${nft?.collectionId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="relative overflow-hidden bg-secondary/50 border-primary/50 hover:border-primary/70"
              >
                <span className="absolute inset-0 bg-gradient-shimmer animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="hidden sm:block">NFT Minted</span>
                </span>
              </Button>
            </Link>
          ) : interactions.isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMintModalOpen(true)}
              data-no-navigate
              className="bg-primary/10 hover:bg-primary/20 text-primary-foreground border border-primary/30 hover:border-primary/50 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="hidden sm:block">Mint NFT</span>
              </span>
            </Button>
          )}
        </>
        <ShareButton
          url={`${window.location.origin}/${authorUsername}/status/${postId}`}
          successMessage="Post URL copied to clipboard"
          className="gap-2 py-0 hover:bg-transparent"
        />
      </div>

      <MintNFTModal
        postId={postId}
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        onSuccess={() => {
          utils.post.feed.invalidate();
          utils.post.getById.invalidate({ postId });
        }}
      />
    </>
  );
} 