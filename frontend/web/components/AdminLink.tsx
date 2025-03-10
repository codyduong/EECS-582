"use client";
/*
 * Admin Link Component
 *
 * This component renders a navigation button to the admin section that is only
 * visible to users with administrative permissions. Features include:
 * - Permission-based visibility
 * - Integration with the site header
 * - Visual styling consistent with other navigation elements
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 * Revision History:
 * - 2025-03-10 - @ehnuJ - updated to use client component pattern
 */
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
