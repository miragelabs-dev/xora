'use client';

import { Session } from "@/types";
import { createContext, useContext } from "react";

const initialState = {
  address: undefined,
}

export const SessionContext = createContext<Session | null>(
  initialState
);

export function SessionProvider({ address, children }: {
  address: string | null,
  children: React.ReactNode
}) {
  return <SessionContext.Provider value={{
    address,
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