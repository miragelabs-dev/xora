'use client';

import { Loading } from "@/components/ui/loading";
import { User } from "@/lib/db/schema";
import { Session } from "@/types";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

const initialState = {
  user: {} as User
}

export const SessionContext = createContext<Session>(
  initialState
);

export function SessionProvider({ children }: {
  children: React.ReactNode
}) {
  const router = useRouter();

  const { data: user, isLoading, isSuccess } = api.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading && !isSuccess) {
      // TODO: redirect to login page
      router.push('/?redirected=true');
    }
  }, [isLoading, isSuccess, router]);

  if (isLoading) {
    return <Loading message="Loading session..." />;
  }

  if (!isSuccess) {
    return <Loading message="Redirecting to login..." />;
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