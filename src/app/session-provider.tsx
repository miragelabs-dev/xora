'use client';

import { Session } from "@/types";
import { createContext, useContext } from "react";

const initialState = {
  id: 0,
  address: '' as string,
  username: '' as string,
}

export const SessionContext = createContext<Session | null>(
  initialState
);

export function SessionProvider({ session, children }: {
  session: Session | null,
  children: React.ReactNode
}) {
  return <SessionContext.Provider value={session}>
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