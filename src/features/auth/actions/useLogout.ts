"use client";

import { useTransition } from "react";
import { logout } from "./logout";

export function useLogout() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return {
    logout: handleLogout,
    isPending,
  };
}

