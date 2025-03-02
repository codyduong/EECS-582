/*
 *  Page at "/products"
 *
 *  Authors: @haydenmroy10, @Tyler51235
 *  Date Created: 2025-02-28
 *  Revision History:
 *  - 2025-02-28 - @haydenmroy10, @Tyler51235 - initial creation of products page
 *  - 2025-02-28 - @codyduong - use @tabler instead of ludite icons
 *  - 2025-03-01 - @codyduong - extract out mock data
 */

import { Container, TextInput, Title, Group } from "@mantine/core";
import { ProductCard } from "@/components/ProductCard";
import { IconSearch } from "@tabler/icons-react";
import { products } from "../productsmock";

export default function ProductsPage() {
  return (
    // Container component to center content and add horizontal padding
    <Container size="xl" py="xl">
      {/* Page title with bottom margin and center alignment */}
      <Title order={1} mb="lg">
        Grocery Products
      </Title>

      {/* Group component to center the search input */}
      <Group mb="xl">
        {/* Search input with placeholder text and icon */}
        <TextInput
          placeholder="Search products..."
          leftSection={<IconSearch size={14} />}
          className="w-full max-w-lg"
        />
      </Group>

      {/* Grid layout instead of flex for more precise control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {/* Map through the products array to create a card for each product */}
        {products.map((product) => (
          // Each card is in its own grid cell with plenty of spacing
          <div key={product.id} className="flex justify-center">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Container>
  );
}
