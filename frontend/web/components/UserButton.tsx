/*

*/
import { ActionIcon } from "@mantine/core"
import { IconUser } from "@tabler/icons-react"
import Link from "next/link"

export function UserButton() {
  return (
    <Link href="/profile">
      <ActionIcon size="lg" variant="subtle" aria-label="Go to profile">
        <IconUser size="1.5rem" />
      </ActionIcon>
    </Link>
  )
}
