"use client";

/*
 *  Page at "/products"
 *
 *  Authors: @haydenmroy10, @Tyler51235
 *  Date Created: 2025-02-28
 *  Revision History:
 *  - 2025-02-28 - @haydenmroy10, @Tyler51235 - initial creation of products page
 *  - 2025-02-28 - @codyduong - use @tabler instead of ludite icons
 *  - 2025-03-01 - @codyduong - extract out mock data
 *  - 2025-03-10 - @ehnuJ - add admin product management functionality
 *  - 2025-03-28 - @codyduong - add gql
 */

import { KeyboardEventHandler, useCallback, useEffect, useState } from "react";
import {
  Container,
  TextInput,
  Title,
  Group,
  Button,
  Modal,
  Tabs,
  Paper,
  Tooltip,
  ComboboxItem,
  Select,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { ProductCard } from "@/components/ProductCard";
import {
  IconSearch,
  IconPlus,
  // IconUpload,
  // IconList,
  IconAdjustmentsHorizontal,
  IconMathEqualLower,
  IconMapPin,
} from "@tabler/icons-react";
import { useUser } from "@/contexts/UserContext";
import ProductForm from "@/components/admin/ProductForm";
import BulkProductUpload from "@/components/admin/BulkProductUpload";
import ProductList from "@/components/admin/ProductList";
import { graphql } from "@/graphql";
import { useQuery } from "@apollo/client";

const PRODUCTSPAGE_QUERY = graphql(`
  query ProductsPage_Primary(
    $search: String
    $company_id: Int
    $maximum_price: Float
    $hide_unpriced: Boolean
  ) {
    get_companies {
      id
      name
    }
    get_products(
      search: $search
      company_id: $company_id
      maximum_price: $maximum_price
      hide_unpriced: $hide_unpriced
    ) {
      edges {
        node {
          gtin
          productname
          images {
            image_url
          }
          price_reports {
            edges {
              node {
                id
                reported_at
                price
                company {
                  name
                }
                # marketplace {
                #   id
                #   physical_marketplace {
                #     ... on PhysicalMarketplace {
                #       id
                #       adr_address
                #     }
                #   }
                #   online_marketplace {
                #     ... on OnlineMarketplace {
                #       id
                #     }
                #   }
                # }
              }
            }
          }
        }
      }
    }
  }
`);

export default function ProductsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("add");
  const [showUnpriced, setShowUnpriced] = useState(true);
  const [maxPrice, setMaxPrice] = useState(-1);
  const [selectedCompany, setSelectedCompany] = useState(-1);
  const { user } = useUser();
  const { data, refetch } = useQuery(PRODUCTSPAGE_QUERY, {});

  const products =
    data?.get_products?.edges?.filter((p) => !!p).map(({ node }) => node) ?? [];

  const companies = data?.get_companies?.filter((p) => !!p) ?? [];
  const companiesData = companies.map(
    (company): ComboboxItem => ({
      value: `${company.id}`,
      label: company.name,
    }),
  );

  // Check if user has admin permissions
  const hasAdminAccess =
    user &&
    user.permissions &&
    (user.permissions.includes("create:product") ||
      user.permissions.includes("update:product") ||
      user.permissions.includes("create:all") ||
      user.permissions.includes("update:all"));

  // Filter products based on search
  // const filteredProducts = products.filter((product) =>
  //   product.name.toLowerCase().includes(searchValue.toLowerCase()),
  // );

  const refetchProducts = useCallback(() => {
    refetch({
      search: searchValue || null,
      company_id: selectedCompany !== -1 ? selectedCompany : null,
      hide_unpriced: maxPrice === -1 ? !showUnpriced : null,
      maximum_price: maxPrice !== -1 ? maxPrice : null,
    });
  }, [maxPrice, refetch, searchValue, selectedCompany, showUnpriced]);

  const handleEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      refetchProducts();
    }
  };

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts, maxPrice, selectedCompany, showUnpriced]);

  return (
    // Container component to center content and add horizontal padding
    <Container size="xl" py="xl">
      {/* Page title with bottom margin and center alignment */}
      <Group justify="space-between" mb="lg">
        <Title order={1}>Grocery Products</Title>

        {hasAdminAccess && (
          <Tooltip label="Manage Products">
            <Button
              leftSection={<IconAdjustmentsHorizontal size={16} />}
              onClick={() => setAdminModalOpen(true)}
              color="green"
            >
              Manage Products
            </Button>
          </Tooltip>
        )}
      </Group>
      {/* Group component to center the search input */}
      <Paper p={8} mt={8}>
        <Group mb="xl" className="flex flex-row w-full items-end">
          {/* Search input with placeholder text and icon */}
          <TextInput
            placeholder="Search products..."
            leftSection={<IconSearch size={14} />}
            className="w-full max-w-md"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onBlur={refetchProducts}
            onKeyDown={handleEnter}
          />
          <Select
            label="Filter by Company"
            leftSection={<IconMapPin size={14} />}
            className="w-50"
            value={selectedCompany !== -1 ? `${selectedCompany}` : null}
            data={companiesData}
            clearable
            onChange={(v) => {
              if (v === "" || v === null) {
                setSelectedCompany(-1);
                return;
              }
              const coerced = Number(v);
              if (!Number.isNaN(coerced)) {
                setSelectedCompany(coerced);
              } else {
                setSelectedCompany(-1);
              }
            }}
          />
          {/* <NumberInput
            label="Minimum Price"
            leftSection={<IconMathEqualGreater size={14} />}
            className="w-40"
            decimalScale={2}
            fixedDecimalScale
            disabled
          /> */}
          <NumberInput
            label="Maximum Price"
            leftSection={<IconMathEqualLower size={14} />}
            className="w-40"
            decimalScale={2}
            fixedDecimalScale
            onChange={(e) => {
              if (e === 0 || e === "") {
                setMaxPrice(-1);
                return;
              }

              const coerced = Number(e);
              if (!Number.isNaN(coerced)) {
                setMaxPrice(coerced);
              } else {
                setMaxPrice(-1);
              }
            }}
            onBlur={refetchProducts}
            onKeyDown={handleEnter}
          />
          <Checkbox
            label="Show unpriced items"
            className="mb-2"
            checked={maxPrice !== -1 ? false : showUnpriced}
            disabled={maxPrice !== -1}
            onChange={(e) => {
              setShowUnpriced(e.currentTarget.checked);
            }}
          />
        </Group>
      </Paper>

      {/* Grid layout instead of flex for more precise control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {/* Map through the products array to create a card for each product */}
        {products.length > 0 ? (
          products.map((product) => (
            // Each card is in its own grid cell with plenty of spacing
            <div key={product.gtin} className="flex justify-center">
              <ProductCard product={product} inMain />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            No products found matching your search.
          </div>
        )}
      </div>
      {/* Admin Modal for Product Management */}
      <Modal
        opened={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        title="Product Management"
        size="xl"
        centered
      >
        <Paper shadow="sm" p="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="add" leftSection={<IconPlus size={16} />}>
                Add Product
              </Tabs.Tab>
              {/* <Tabs.Tab value="bulk" leftSection={<IconUpload size={16} />}>
                Bulk Upload
              </Tabs.Tab>
              <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                Product List
              </Tabs.Tab> */}
            </Tabs.List>

            <Tabs.Panel value="add" pt="md">
              <ProductForm onSuccess={() => setAdminModalOpen(false)} />
            </Tabs.Panel>

            <Tabs.Panel value="bulk" pt="md">
              <BulkProductUpload />
            </Tabs.Panel>

            <Tabs.Panel value="list" pt="md">
              <ProductList />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Modal>
    </Container>
  );
}
