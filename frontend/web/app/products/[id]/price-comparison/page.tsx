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
  Overlay,
} from "@mantine/core";
import {
  IconArrowBack,
  IconShoppingCart,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@apollo/client";
import { graphql } from "@/graphql";

const PRODUCT_QUERY = graphql(`
  query PriceComparison_GetProduct($gtin: String!) {
    get_product(gtin: $gtin) {
      gtin
      productname
      images {
        image_url
      }
      description
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
`);

interface PriceComparisonProps {
  embedded?: boolean;
}

export default function PriceComparisonReport(
  props: PriceComparisonProps,
): React.JSX.Element {
  const { embedded = false } = props;

  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery(PRODUCT_QUERY, { variables: { gtin: id } });

  const product = data?.get_product;
  const price_reports = product?.price_reports.edges
    .filter((i) => !!i)
    .map(({ node }) => node);

  const oldProduct = products[0];

  // Get product-specific price history data
  const [priceHistory] = useState(() => getPriceHistory(id));

  // Calculate savings compared to highest price
  const calculateSavings = () => {
    // return { amount: 0, percentage: 0, bestStore: "" };

    if (!oldProduct || !oldProduct.otherPrices)
      return { amount: 0, percentage: 0, bestStore: "" };

    let highestPrice = 0;
    let lowestPrice = Infinity;
    let bestStore = "";

    Object.entries(oldProduct.otherPrices).forEach(([store, details]) => {
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
    const fixedUrl = embedded
      ? `${window.location.href}/price-comparison`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Price Comparison for ${product?.productname}`,
          text: `Check out the best prices for ${product?.productname}`,
          url: fixedUrl,
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
      navigator.clipboard.writeText(fixedUrl);
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
        {!embedded && (
          <Group mb="md">
            <Link href={`/products/${id}`}>
              <Button
                variant="subtle"
                leftSection={<IconArrowBack size={16} />}
              >
                Back to Product
              </Button>
            </Link>
            <Button
              variant="subtle"
              leftSection={<IconShare size={16} />}
              onClick={shareReport}
            >
              Share Report
            </Button>
          </Group>
        )}

        {/* Title section */}
        <Title order={1} mb="sm">
          Price Comparison Report
        </Title>
        <Text size="lg" mb="xl" c="dimmed">
          {product.productname}
        </Text>

        {/* Savings highlight card */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          mb="xl"
          className="relative"
        >
          <Paper
            shadow="xs"
            p="xl"
            withBorder
            className="opacity-100 absolute z-10 right-[50%] translate-x-[50%] top-[50%] translate-y-[-50%]"
          >
            <Text fw={600} fz="h4">
              Under Construction
            </Text>
          </Paper>
          <Overlay
            zIndex={5}
            color="#eee"
            opacity={0.9}
            blur={15}
            className="flex align-middle justify-center"
          />

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
              sections={[{ value: savings.percentage, color: "green" }]}
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
                Save up to{" "}
                <Text span fw={700} c="green">
                  ${savings.amount.toFixed(2)}
                </Text>{" "}
                by shopping at{" "}
                <Text span fw={700}>
                  {savings.bestStore}
                </Text>
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
        <Paper shadow="xs" p="m" withBorder mb="xl" className="relative">
          <Paper
            shadow="xs"
            p="xl"
            withBorder
            className="opacity-100 absolute z-10 right-[50%] translate-x-[50%] top-[50%] translate-y-[-50%]"
          >
            <Text fw={600} fz="h4">
              Under Construction
            </Text>
          </Paper>
          <Overlay
            zIndex={5}
            color="#eee"
            opacity={0.9}
            blur={15}
            className="flex align-middle justify-center"
          />

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
              {oldProduct.otherPrices &&
                Object.entries(oldProduct.otherPrices).map(
                  ([store, details]) => {
                    if (!details.price) return null;

                    const isBestPrice = store === savings.bestStore;
                    const savingsAmount = oldProduct.otherPrices
                      ? Math.max(
                          ...Object.values(oldProduct.otherPrices).map(
                            (d) => d.price || 0,
                          ),
                        ) - details.price
                      : 0;

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
                          <Text
                            fw={isBestPrice ? 700 : 400}
                            c={isBestPrice ? "green" : "inherit"}
                          >
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
                  },
                )}
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
                <Table.Th>Company</Table.Th>
                {/* <Table.Th>Location</Table.Th> */}
                <Table.Th>Price</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {price_reports?.map((report) => (
                <Table.Tr key={report.id}>
                  <Table.Td>
                    {new Date(report.reported_at).toLocaleString("en-US")}
                  </Table.Td>
                  <Table.Td>{report.company.name}</Table.Td>
                  <Table.Td>${report.price.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Price trends and insights */}
        <Title order={2} mb="md">
          Price Insights
        </Title>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          mb="xl"
          className="relative"
        >
          <Paper
            shadow="xs"
            p="xl"
            withBorder
            className="opacity-100 absolute z-10 right-[50%] translate-x-[50%] top-[50%] translate-y-[-50%]"
          >
            <Text fw={600} fz="h4">
              Under Construction
            </Text>
          </Paper>
          <Overlay
            zIndex={5}
            color="#eee"
            opacity={0.9}
            blur={15}
            className="flex align-middle justify-center"
          />

          <Text fw={500} mb="md">
            Price Trend Analysis
          </Text>
          <Text mb="md">
            {product.productname} prices have{" "}
            {priceHistory[0].dillons >
            priceHistory[priceHistory.length - 1].dillons
              ? "decreased"
              : "increased"}{" "}
            by{" "}
            {Math.abs(
              ((priceHistory[0].dillons -
                priceHistory[priceHistory.length - 1].dillons) /
                priceHistory[0].dillons) *
                100,
            ).toFixed(1)}
            % at Dillons over the past week.
          </Text>
          <Text mb="md">
            {savings.bestStore} consistently offers the best price for this
            product.
          </Text>
          <Divider my="md" />
          <Text fw={500} mb="md">
            Shopping Recommendations
          </Text>
          <Text>
            For the best deal on {oldProduct.name}, we recommend purchasing at{" "}
            {savings.bestStore} for $
            {(savings.bestStore &&
              oldProduct.otherPrices &&
              Object.entries(oldProduct.otherPrices)
                .find(([store]) => store === savings.bestStore)?.[1]
                ?.price?.toFixed(2)) ||
              "N/A"}
            .
          </Text>
        </Card>

        {/* Action buttons */}
        <Group justify="center" mt="xl">
          <Button leftSection={<IconShoppingCart size={16} />} color="blue">
            Add to Shopping List
          </Button>
          <Button
            variant="outline"
            leftSection={<IconShare size={16} />}
            onClick={shareReport}
          >
            Share This Report
          </Button>
        </Group>
      </Container>
    </motion.div>
  );
}
