"use client";

/*
 *  Page at "/grocery-list"
 *
 *  This page allows users to create, manage, and share grocery lists.
 *  Features:
 *  - Add/remove items from the grocery list
 *  - Link items to store prices
 *  - Dynamic total cost calculation
 *  - Share grocery lists with others
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-03-10
 *  Revision History:
 *  - 2025-03-10 - @haydenmroy10 - initial creation of grocery list page
 */

import { Container, Title, Button, Group } from "@mantine/core";
import { IconShare } from "@tabler/icons-react";
import ProtectedPage from "@/components/ProtectedPage";
import { GroceryList } from "@/components/GroceryList";
import { PermissionValidator } from "@/lib/permissions";

//Creates function to build GroceryListPage
export default function GroceryListPage() {
  return (
    <ProtectedPage
      validator={
        // use an empty permission validator to require a user to be logged in, but doesn't need
        // any special permissions
        new PermissionValidator()
      }
    >
      <Container size="xl" py="xl">
        <div className="flex justify-between items-center mb-6">
          <Title order={1}>My Grocery List</Title>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconShare size={16} />}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Share List
            </Button>
          </Group>
        </div>

        <GroceryList />
      </Container>
    </ProtectedPage>
  );
}
