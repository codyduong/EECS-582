"use client";

/*
 *  Page at "/profile"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @codyduong - create register page
 */

import "@mantine/core/styles.css";
import ProtectedPage from "@/components/ProtectedPage";
import { PermissionValidator } from "@/lib/permissions";

export default function ProfilePage() {
  return (
    <ProtectedPage validator={new PermissionValidator().with("read:all")}>
      <div>yippee you are logged in</div>
    </ProtectedPage>
  );
}
