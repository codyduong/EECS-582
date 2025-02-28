"use client";

/*
 *  Page at "/product_page"
 *
 *  Authors: @Tyler51235
 *  Date Created: 2025-02-26
 *  Revision History:
 *  - 2025-02-05 - @codyduong - initial creation of website
 *  - 2025-02-26 - @Tyler51235 - specific product page
 */

import {
  Card,
  Image,
  Text,
  Group,
  Container,
  Grid,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";

// Sample product data being displayed
const products = [
  {
    id: 1,
    name: "Organic Bananas",
    price: 3.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Whole Milk",
    price: 4.49,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Whole Grain Bread",
    price: 3.29,
    image: "/placeholder.svg?height=400&width=400",
  },
];

export default function ProductsPage() {
  const router = useRouter();

  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  return (
    <Container size="xl" className="py-8">
      <Title order={1} className="mb-8 text-center text-green-600">
        Available Products
      </Title>

      <Grid>
        {products.map((product) => (
          <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <Card.Section>
                <Image
                  src={product.image || "/placeholder.svg"}
                  height={260}
                  alt={product.name}
                  className="object-cover"
                />
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} size="lg">
                  {product.name}
                </Text>
                <Text fw={500} size="lg" className="text-green-600">
                  ${product.price.toFixed(2)}
                </Text>
              </Group>

              {/* <Text size="sm" c="dimmed">
                {product.category}
              </Text> */}
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
