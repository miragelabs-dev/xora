'use client';

import { Loading } from "@/components/ui/loading";
import { User } from "@/lib/db/schema";
import { Session } from "@/types";
import { api } from "@/utils/api";
import { createContext, useContext } from "react";

const initialState = {
  user: {} as User
}

export const SessionContext = createContext<Session>(
  initialState
);

export function SessionProvider({ children }: {
  children: React.ReactNode
}) {
  const { data: user, isLoading, isSuccess } = api.auth.me.useQuery();

  if (isLoading) {
    return <Loading message="Loading session..." />;
  }

  if (!isSuccess) {
    throw new Error('Session not found');
  }

  return <SessionContext.Provider value={{
    user,
  }}>
    {children}
  </SessionContext.Provider>
}

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
} 