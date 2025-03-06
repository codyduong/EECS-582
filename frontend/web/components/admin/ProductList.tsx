"use client";

/*
 * Product List Component
 *
 * This component displays a list of existing products with:
 * - Searching and filtering capabilities
 * - Basic product information
 * - Quick actions for product management
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import { useState, useEffect } from "react";
import {
  Box,
  TextInput,
  Table,
  Group,
  Text,
  ActionIcon,
  Menu,
  Badge,
  Image,
  Select,
  Pagination,
  ScrollArea,
  Skeleton,
} from "@mantine/core";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconDots,
  IconEye,
  IconArchive,
  IconFilter,
} from "@tabler/icons-react";
import { products } from "@/app/productsmock";

interface ExtendedProduct {
  id: string;
  name: string;
  price: number;
  weightPrice: string;
  image: string;
  status: "active" | "inactive" | "archived";
  sku: string;
  at: string;
}

export default function ProductList() {
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [productList, setProductList] = useState<ExtendedProduct[]>([]);
  // eslint-disable-next-line prettier/prettier
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([],);
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [storeFilter, setStoreFilter] = useState<string | null>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Simulate API call to load products
    setTimeout(() => {
      // Transform the mock data to include additional fields needed for the admin view
      const extendedProducts: ExtendedProduct[] = products.map((product) => ({
        ...product,
        status:
          Math.random() > 0.8
            ? Math.random() > 0.5
              ? "inactive"
              : "archived"
            : "active",
        sku: `SKU-${product.id}-${Math.floor(Math.random() * 1000)}`,
      }));

      setProductList(extendedProducts);
      setFilteredProducts(extendedProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter products based on search, status and store filters
    const filtered = productList.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      const matchesStore = storeFilter === "all" || product.at === storeFilter;

      return matchesSearch && matchesStatus && matchesStore;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchValue, statusFilter, storeFilter, productList]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get unique stores for filter
  const stores = Array.from(new Set(productList.map((p) => p.at)));

  return (
    <Box>
      <Group mb="md">
        <TextInput
          placeholder="Search products"
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-grow"
        />

        <Select
          leftSection={<IconFilter size={16} />}
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "archived", label: "Archived" },
          ]}
          w={180}
        />

        <Select
          leftSection={<IconFilter size={16} />}
          placeholder="Store"
          value={storeFilter}
          onChange={setStoreFilter}
          data={[
            { value: "all", label: "All Stores" },
            ...stores.map((store) => ({ value: store, label: store })),
          ]}
          w={180}
        />
      </Group>

      <ScrollArea h={500} offsetScrollbars type="auto">
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Image</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Store</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Skeleton height={40} width={40} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width="80%" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={80} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={60} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={80} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={70} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={100} />
                  </Table.Td>
                </Table.Tr>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      width={40}
                      height={40}
                      radius="sm"
                      alt={product.name}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {product.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{product.sku}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">${product.price.toFixed(2)}</Text>
                    <Text size="xs" c="dimmed">
                      {product.weightPrice}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{product.at}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        product.status === "active"
                          ? "green"
                          : product.status === "inactive"
                            ? "yellow"
                            : "gray"
                      }
                    >
                      {product.status.charAt(0).toUpperCase() +
                        product.status.slice(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Menu position="bottom-end" withArrow offset={4}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />}>
                          View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Edit Product
                        </Menu.Item>
                        {product.status === "active" && (
                          <Menu.Item
                            leftSection={<IconArchive size={14} />}
                            color="yellow"
                          >
                            Deactivate
                          </Menu.Item>
                        )}
                        {product.status !== "active" && (
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            color="green"
                          >
                            Activate
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text c="dimmed" my="md">
                    No products found matching your filters
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {filteredProducts.length > 0 && (
        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            withEdges
          />
          <Text size="sm" c="dimmed">
            Showing{" "}
            {Math.min(
              filteredProducts.length,
              itemsPerPage * currentPage - itemsPerPage + 1,
            )}
            {Math.min(itemsPerPage * currentPage, filteredProducts.length)}
            of {filteredProducts.length} products
          </Text>
        </Group>
      )}
    </Box>
  );
}
