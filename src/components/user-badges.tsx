'use client';

import { api } from "@/utils/api";
import { format } from "date-fns";
import { Award, Sparkles } from "lucide-react";

interface UserBadgesProps {
  username: string;
}

export function UserBadges({ username }: UserBadgesProps) {
  const { data: userBadges, isLoading } = api.badge.getUserBadgesByUsername.useQuery({
    username
  });

  const getBadgeStyle = (requirementType: string) => {
    switch (requirementType) {
      case 'streak':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 border-orange-400';
      case 'likes':
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border-pink-400';
      case 'posts':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 border-blue-400';
      case 'points':
        return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25 border-purple-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/25 border-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Badges</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!userBadges || userBadges.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Badges</h3>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl" />
            <Award className="h-12 w-12 mx-auto relative text-muted-foreground/60" />
          </div>
          <p className="text-sm">No badges earned yet</p>
          <p className="text-xs mt-1">Complete activities to earn your first badge!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {userBadges.map((userBadge) => (
        <div
          key={userBadge.id}
          className="group relative"
          title={`${userBadge.badge.description} - Earned on ${format(new Date(userBadge.earnedAt), 'MMM d, yyyy')}`}
        >
          <div className={`
              relative flex items-center gap-2 px-4 py-2 rounded-full border-2 
              ${getBadgeStyle(userBadge.badge.requirementType)}
              hover:scale-105 transition-all duration-300 cursor-pointer
              before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 
              hover:before:opacity-100 before:transition-opacity before:duration-300
            `}>
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-sm scale-150" />
              <span className="relative text-lg font-medium">
                {userBadge.badge.icon}
              </span>
            </div>

            <span className="text-sm font-semibold tracking-wide">
              {userBadge.badge.name}
            </span>

            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
              <div className="font-medium">{userBadge.badge.description}</div>
              <div className="text-gray-300 mt-1">
                Earned {format(new Date(userBadge.earnedAt), 'MMM d, yyyy')}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="border-4 border-transparent border-t-black/90" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}