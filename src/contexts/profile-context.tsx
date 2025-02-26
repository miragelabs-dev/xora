'use client';

import { User } from "@/lib/db/schema/user";
import { createContext, useContext } from "react";

type ProfileType = User & {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isCurrentUser: boolean;
  isFollowing: boolean;
};

type ProfileContextType = {
  profile: ProfileType;
} | null;

const ProfileContext = createContext<ProfileContextType>(null);

export const ProfileProvider = ProfileContext.Provider;

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 