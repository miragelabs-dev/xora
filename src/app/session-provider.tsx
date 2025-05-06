'use client';

import { Loading } from "@/components/ui/loading";
import { Session } from "@/types";
import { api } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

const initialState = {
  user: undefined
}

export const SessionContext = createContext<Session>(
  initialState
);

const PRIVATE_ROUTES = ['/home', '/messages', '/notifications', '/profile', '/settings'];

export function SessionProvider({ children }: {
  children: React.ReactNode
}) {
  const { data: user, isLoading } = api.auth.me.useQuery();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && PRIVATE_ROUTES.includes(pathname)) {
      // TODO: redirect to login page
      router.push('/?redirected=true');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <Loading message="Entering the crypto universe..." />;
  }

  // if (!isSuccess) {
  //   return <Loading message="Redirecting to login..." />;
  // }

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