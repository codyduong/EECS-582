"use client";

import { useUser } from "@/contexts/UserContext";
import { Button } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import Link from "next/link";

export default function AdminLink() {
  const { user } = useUser();

  // Check if user has admin permissions
  const hasAdminAccess = user?.permissions.some(
    (perm) => perm === "create:product" || perm === "update:product",
  );

  if (!hasAdminAccess) return null;

  return (
    <Link href="/admin/products">
      <Button
        variant="outline"
        className="items-center gap-2 border-purple-600 text-purple-600 hover:bg-purple-50"
        leftSection={<IconSettings className="w-4 h-4" />}
      >
        Admin
      </Button>
    </Link>
  );
}
