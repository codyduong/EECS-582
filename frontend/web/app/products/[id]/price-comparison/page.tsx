"use client";

/*
 * Price Comparison Report Page
 *
 * This page displays a detailed price comparison report for a specific product.
 * It is designed to be accessed via QR code scanning from the product detail page.
 *
 * Features:
 * - Displays prices across different stores
 * - Shows price history and trends
 * - Provides visual comparison with charts
 * - Highlights the best deal
 *
 * Author: @Tyler51235
 * Date Created: 2025-03-12
 */

import { useParams } from "next/navigation";
import { useState } from "react";
import { products } from "@/app/productsmock";
import { getPriceHistory } from "@/app/pricehistorymock";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Divider,
  Table,
  RingProgress,
  Center,
  Stack,
  Paper,
  Button,
} from "@mantine/core";
import { IconArrowBack, IconShoppingCart, IconShare } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notifications } from "@mantine/notifications";

export default function PriceComparisonReport() {
  const params = useParams();
  const id = params.id as string;
  
  // Find the current product
  const product = products.find((p) => p.id === id);
  
  // Get product-specific price history data
  const [priceHistory] = useState(() => getPriceHistory(id));
  
  // Calculate savings compared to highest price
  const calculateSavings = () => {
    if (!product || !product.otherPrices) return { amount: 0, percentage: 0, bestStore: "" };
    
    let highestPrice = 0;
    let lowestPrice = Infinity;
    let bestStore = "";
    
    Object.entries(product.otherPrices).forEach(([store, details]) => {
      if (details.price) {
        if (details.price > highestPrice) {
          highestPrice = details.price;
        }
        if (details.price < lowestPrice) {
          lowestPrice = details.price;
          bestStore = store;
        }
      }
    });
    
    const savingsAmount = highestPrice - lowestPrice;
    const savingsPercentage = (savingsAmount / highestPrice) * 100;
    
    return {
      amount: savingsAmount,
      percentage: savingsPercentage,
      bestStore,
    };
  };
  
  const savings = calculateSavings();
  
  // Share price report
  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Price Comparison for ${product?.name}`,
          text: `Check out the best prices for ${product?.name}`,
          url: window.location.href,
        });
        notifications.show({
          title: "Shared Successfully",
          message: "The price report has been shared",
          color: "green",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      notifications.show({
        title: "Link Copied",
        message: "The price report link has been copied to clipboard",
        color: "blue",
      });
    }
  };
  
  if (!product) {
    return (
      <Container size="md" py="xl">
        <Text>Product not found</Text>
        <Link href="/products">
          <Button leftSection={<IconArrowBack size={14} />} mt="md">
            Back to Products
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container size="md" py="xl">
        {/* Header with back button */}
        <Group mb="md">
          <Link href={`/products/${id}`}>
            <Button variant="subtle" leftSection={<IconArrowBack size={16} />}>
              Back to Product
            </Button>
          </Link>
          <Button variant="subtle" leftSection={<IconShare size={16} />} onClick={shareReport}>
            Share Report
          </Button>
        </Group>

        {/* Title section */}
        <Title order={1} mb="sm">
          Price Comparison Report
        </Title>
        <Text size="lg" mb="xl" c="dimmed">
          {product.name}
        </Text>

        {/* Savings highlight card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Potential Savings</Text>
            <Badge color="green" variant="light">
              Best Deal
            </Badge>
          </Group>
          
          <Group>
            <RingProgress
              size={120}
              thickness={12}
              roundCaps
              sections={[{ value: savings.percentage, color: 'green' }]}
              label={
                <Center>
                  <Text fw={700} ta="center" size="xl">
                    {savings.percentage.toFixed(0)}%
                  </Text>
                </Center>
              }
            />
            
            <Stack gap="xs">
              <Text>
                Save up to <Text span fw={700} c="green">${savings.amount.toFixed(2)}</Text> by shopping at{" "}
                <Text span fw={700}>{savings.bestStore}</Text>
              </Text>
              <Text size="sm" c="dimmed">
                Compared to the highest price available
              </Text>
            </Stack>
          </Group>
        </Card>

        {/* Current prices comparison */}
        <Title order={2} mb="md">
          Current Prices
        </Title>
        <Paper shadow="xs" p="md" withBorder mb="xl">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Store</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Savings</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {product.otherPrices && Object.entries(product.otherPrices).map(([store, details]) => {
                if (!details.price) return null;
                
                const isBestPrice = store === savings.bestStore;
                const savingsAmount = product.otherPrices ? 
                  Math.max(...Object.values(product.otherPrices)
                    .map(d => d.price || 0)) - details.price : 0;
                
                return (
                  <Table.Tr key={store}>
                    <Table.Td>
                      <Group gap="xs">
                        {store}
                        {isBestPrice && (
                          <Badge color="green" size="xs">
                            Best
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={isBestPrice ? 700 : 400} c={isBestPrice ? "green" : "inherit"}>
                        ${details.price.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>{details.weightPrice || "N/A"}</Table.Td>
                    <Table.Td>
                      {savingsAmount > 0 ? (
                        <Text c="green">${savingsAmount.toFixed(2)}</Text>
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Price history section */}
        <Title order={2} mb="md">
          Recent Price History
        </Title>
        <Paper shadow="xs" p="md" withBorder mb="xl">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Walmart</Table.Th>
                <Table.Th>Target</Table.Th>
                <Table.Th>Dillons</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {priceHistory.map((entry, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{entry.date}</Table.Td>
                  <Table.Td>${entry.walmart.toFixed(2)}</Table.Td>
                  <Table.Td>${entry.target.toFixed(2)}</Table.Td>
                  <Table.Td>${entry.dillons.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Price trends and insights */}
        <Title order={2} mb="md">
          Price Insights
        </Title>
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Text fw={500} mb="md">
            Price Trend Analysis
          </Text>
          <Text mb="md">
            {product.name} prices have {priceHistory[0].dillons > priceHistory[priceHistory.length - 1].dillons ? "decreased" : "increased"} by {Math.abs((priceHistory[0].dillons - priceHistory[priceHistory.length - 1].dillons) / priceHistory[0].dillons * 100).toFixed(1)}% at Dillons over the past week.
          </Text>
          <Text mb="md">
            {savings.bestStore} consistently offers the best price for this product.
          </Text>
          <Divider my="md" />
          <Text fw={500} mb="md">
            Shopping Recommendations
          </Text>
          <Text>
            For the best deal on {product.name}, we recommend purchasing at {savings.bestStore} for ${
              savings.bestStore && product.otherPrices && 
              Object.entries(product.otherPrices).find(([store]) => store === savings.bestStore)?.[1]?.price?.toFixed(2) || "N/A"
            }.
          </Text>
        </Card>

        {/* Action buttons */}
        <Group justify="center" mt="xl">
          <Button leftSection={<IconShoppingCart size={16} />} color="blue">
            Add to Shopping List
          </Button>
          <Button variant="outline" leftSection={<IconShare size={16} />} onClick={shareReport}>
            Share This Report
          </Button>
        </Group>
      </Container>
    </motion.div>
  );
}