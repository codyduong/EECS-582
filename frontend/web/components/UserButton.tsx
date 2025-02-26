/*
 *  UserButton Component
 *
 *  This component renders a clickable user icon that navigates to the user's profile page.
 *  It utilizes Mantine's ActionIcon for styling and @tabler/icons-react for the user icon.
 *
 *  Features:
 *  - Clickable icon that links to the /profile route
 *  - Accessible label for screen readers
 *  - Consistent styling with the rest of the application using Mantine components
 *
 *  Authors: @ehnuJ
 *  Date Created: 2025-02-26
 *  Revision History:
 *
 */
import { ActionIcon } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import Link from "next/link";

export function UserButton() {
  return (
    <Link href="/profile">
      <ActionIcon size="lg" variant="subtle" aria-label="Go to profile">
        <IconUser size="1.5rem" />
      </ActionIcon>
    </Link>
  );
}
