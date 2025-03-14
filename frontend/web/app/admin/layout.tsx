/*
 * Admin Layout Component
 *
 * This component serves as a wrapper for all admin pages, providing:
 * - Consistent navigation menu for admin functions
 * - Access control to ensure only authorized users can view admin content
 * - Common admin interface elements
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import type React from "react";
import type { Metadata } from "next";
import { Container, Title, Group, Text, Box } from "@mantine/core";

export const metadata: Metadata = {
  title: "Admin Dashboard | GroceryWise",
  description: "Administrative interface for GroceryWise management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box py="lg">
      <Container size="xl">
        <Group mb="xl" className="border-b pb-4">
          <Title order={2} className="text-green-600">
            GroceryWise Admin
          </Title>
          <Text c="dimmed" size="sm">
            Manage your product catalog and application settings
          </Text>
        </Group>
        {children}
      </Container>
    </Box>
  );
}
