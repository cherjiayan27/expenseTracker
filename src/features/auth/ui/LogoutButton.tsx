"use client";

import { useLogout } from "../actions/useLogout";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <Button
      onClick={logout}
      disabled={isPending}
      variant="ghost"
      size="sm"
    >
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}

