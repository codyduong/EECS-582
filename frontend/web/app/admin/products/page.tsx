"use client";

/*
 * Admin Products Management Page
 *
 * This page provides an interface for administrators to add, edit,
 * and manage products in the system. Features include:
 * - Individual product addition with form validation
 * - Real-time SKU uniqueness validation
 * - Bulk product upload functionality
 * - List of existing products with management options
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import { useState } from "react";
import { Tabs, Title, Container, Paper, Text, Alert } from "@mantine/core";
import {
  IconInfoCircle,
  IconPlus,
  IconUpload,
  IconList,
} from "@tabler/icons-react";
import ProtectedPage from "@/components/ProtectedPage";
import { PermissionValidator } from "@/lib/permissions";
import ProductForm from "@/components/admin/ProductForm";
import BulkProductUpload from "@/components/admin/BulkProductUpload";
import ProductList from "@/components/admin/ProductList";

// Create permission validator requiring admin product management permissions
const productAdminValidator = PermissionValidator.new()
  .with("create:product")
  .and("update:product");

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<string | null>("add");

  return (
    <ProtectedPage validator={productAdminValidator}>
      <Container size="xl" py="xl">
        <Title order={1} mb="md">
          Product Management
        </Title>

        <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="lg">
          <Text>
            Manage your product catalog by adding new products individually or
            in bulk.
          </Text>
        </Alert>

        <Paper shadow="sm" p="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="add" leftSection={<IconPlus size={16} />}>
                Add Product
              </Tabs.Tab>
              <Tabs.Tab value="bulk" leftSection={<IconUpload size={16} />}>
                Bulk Upload
              </Tabs.Tab>
              <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                Product List
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="add" pt="md">
              <ProductForm />
            </Tabs.Panel>

            <Tabs.Panel value="bulk" pt="md">
              <BulkProductUpload />
            </Tabs.Panel>

            <Tabs.Panel value="list" pt="md">
              <ProductList />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Container>
    </ProtectedPage>
  );
}
