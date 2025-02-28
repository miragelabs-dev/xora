'use client';

import { logout } from "@chopinframework/react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();

    router.push('/');
  };

  return handleLogout;
} 