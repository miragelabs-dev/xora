'use client';

import { api } from "@/utils/api";
import { Loader2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CommunityListView() {
  const { data, isLoading } = api.community.list.useQuery();

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
        <Users className="h-8 w-8" />
        <p>No communities yet</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {data.map((community) => {
        const memberCount = Number(community.memberCount ?? 0);

        return (
          <Link
            key={community.id}
            href={`/communities/${community.id}`}
            className="group relative block overflow-hidden rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border"
          >
            <div className="relative aspect-[5/2] overflow-hidden">
              {community.cover ? (
                <Image
                  src={community.cover}
                  alt={`${community.title} cover`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-muted/80">
                  <Users className="h-10 w-10" />
                </div>
              )}

              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-95"
              />

              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4 text-white">
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{community.title}</h3>
                  <p className="mt-1 text-sm text-white/80 line-clamp-2">
                    {community.description || "No description provided"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Users className="h-4 w-4" />
                  <span>
                    {memberCount} {memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
