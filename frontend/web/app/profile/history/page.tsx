"use client";

/*
 *  Page at "/profile/settings"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-26
 *  Revision History:
 *  - 2025-02-26 - @codyduong - create profile pages
 */

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Paper,
  Title,
  Text,
  Card,
  Group,
  Badge,
  TextInput,
  ActionIcon,
  Skeleton,
  Image,
  Loader,
  SegmentedControl,
} from "@mantine/core";
import {
  IconSearch,
  IconX,
  IconShoppingCart,
  IconScan,
  IconArrowUp,
} from "@tabler/icons-react";
import { Effect } from "effect";
import { useSearchParams } from "next/navigation";
import { useIntersection, useDebouncedCallback } from "@mantine/hooks";

// Mock transaction types
type TransactionType = "scan" | "purchase";
type FilterType = "all" | "scan" | "purchase";

interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  title: string;
  description: string;
  amount?: number;
  imageUrl?: string;
  store?: string;
}

// Mock API call using Effect
const fetchTransactions = (
  cursor: number,
  search: string,
  filter: FilterType,
) =>
  Effect.gen(function* (_) {
    yield* _(Effect.sleep(1500)); // Simulate network delay

    // Mock data for three pages
    const allTransactions: Transaction[] = [
      // Page 1
      {
        id: "tx1",
        type: "purchase",
        date: "2023-11-15",
        title: "Weekly Grocery Shopping",
        description:
          "Purchased various items including fruits, vegetables, and dairy products",
        amount: 78.45,
        store: "Whole Foods",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx2",
        type: "scan",
        date: "2023-11-14",
        title: "Organic Milk",
        description: "Scanned for price comparison",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx3",
        type: "purchase",
        date: "2023-11-12",
        title: "Fresh Produce",
        description: "Purchased organic vegetables",
        amount: 32.18,
        store: "Farmer's Market",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx4",
        type: "scan",
        date: "2023-11-10",
        title: "Cereal Brands",
        description: "Compared prices for different cereal brands",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      // Page 2
      {
        id: "tx5",
        type: "purchase",
        date: "2023-11-08",
        title: "Snacks and Beverages",
        description: "Purchased snacks for the week",
        amount: 25.99,
        store: "Trader Joe's",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx6",
        type: "scan",
        date: "2023-11-07",
        title: "Protein Bars",
        description: "Compared nutritional information",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx7",
        type: "purchase",
        date: "2023-11-05",
        title: "Household Items",
        description: "Purchased cleaning supplies and toiletries",
        amount: 45.67,
        store: "Target",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx8",
        type: "scan",
        date: "2023-11-03",
        title: "Laundry Detergent",
        description: "Compared prices for different brands",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      // Page 3
      {
        id: "tx9",
        type: "purchase",
        date: "2023-11-01",
        title: "Bakery Items",
        description: "Purchased bread and pastries",
        amount: 18.25,
        store: "Local Bakery",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx10",
        type: "scan",
        date: "2023-10-30",
        title: "Yogurt Brands",
        description: "Compared prices and nutritional info",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx11",
        type: "purchase",
        date: "2023-10-28",
        title: "Frozen Foods",
        description: "Purchased frozen vegetables and meals",
        amount: 34.99,
        store: "Safeway",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "tx12",
        type: "scan",
        date: "2023-10-26",
        title: "Pasta Sauce",
        description: "Compared ingredients and prices",
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
    ];

    // Filter by search term if provided
    const searchFilteredTransactions = search
      ? allTransactions.filter(
          (tx) =>
            tx.title.toLowerCase().includes(search.toLowerCase()) ||
            tx.description.toLowerCase().includes(search.toLowerCase()),
        )
      : allTransactions;

    // Filter by type if a specific filter is selected
    const typeFilteredTransactions =
      filter === "all"
        ? searchFilteredTransactions
        : searchFilteredTransactions.filter((tx) => tx.type === filter);

    // Paginate: 4 items per page
    const pageSize = 4;
    const startIndex = cursor * pageSize;
    const endIndex = startIndex + pageSize;
    const hasMore = endIndex < typeFilteredTransactions.length;
    const transactions = typeFilteredTransactions.slice(startIndex, endIndex);

    return {
      transactions,
      nextCursor: hasMore ? cursor + 1 : null,
      total: typeFilteredTransactions.length,
    };
  });

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [debouncedFilter, setDebouncedFilter] = useState<FilterType>("all");
  const searchParams = useSearchParams();

  const _lastItemRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5,
  });

  // Initialize from URL params
  useEffect(() => {
    const cursorParam = searchParams.get("cursor");
    const searchParam = searchParams.get("search");
    const filterParam = searchParams.get("filter") as FilterType | null;

    if (cursorParam) {
      setCursor(Number.parseInt(cursorParam));
    }

    if (searchParam) {
      setSearchValue(searchParam);
      setDebouncedSearch(searchParam);
    }

    if (filterParam) {
      setFilter(filterParam);
      setDebouncedFilter(filterParam);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setCursor(0); // Reset cursor when search changes
      setTransactions([]); // Clear existing transactions
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const debouncedFilterChange = useDebouncedCallback((value: FilterType) => {
    setDebouncedFilter(value);
    setCursor(0);
    setTransactions([]);
  }, 300);

  // Fetch transactions
  const fetchData = useCallback(async () => {
    try {
      if (initialLoading) setLoading(true);
      if (!initialLoading) setLoadingMore(true);

      const result = await Effect.runPromise(
        fetchTransactions(cursor, debouncedSearch, debouncedFilter),
      );

      setTransactions((prev) =>
        cursor === 0 ? result.transactions : [...prev, ...result.transactions],
      );
      setHasMore(result.nextCursor !== null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, [cursor, debouncedSearch, debouncedFilter, initialLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Intersection observer for infinite scrolling
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loadingMore && !loading) {
      setCursor((prev) => prev + 1);
    }
  }, [entry, hasMore, loadingMore, loading]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Paper p="md" radius="md" className="min-h-[80vh] max-w-2xl mx-auto">
      <Title order={2} className="mb-6">
        Transaction History
      </Title>

      <TextInput
        placeholder="Search transactions..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchValue && (
            <ActionIcon onClick={() => setSearchValue("")} variant="subtle">
              <IconX size={16} />
            </ActionIcon>
          )
        }
        className="mb-6"
      />

      <Group my="md">
        <SegmentedControl
          value={filter}
          onChange={(value) => {
            setFilter(value as FilterType);
            debouncedFilterChange(value as FilterType);
          }}
          data={[
            { label: "All", value: "all" },
            { label: "Scans", value: "scan" },
            { label: "Purchases", value: "purchase" },
          ]}
        />
      </Group>

      {loading && transactions.length === 0 ? (
        // Initial loading state
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} withBorder shadow="sm" radius="md" className="mb-4">
            <Skeleton height={24} width="60%" className="mb-2" />
            <Skeleton height={16} width="40%" className="mb-4" />
            <Group>
              <Skeleton height={16} width={80} radius="xl" />
              <Skeleton height={16} width={100} />
            </Group>
          </Card>
        ))
      ) : transactions.length === 0 ? (
        // No results
        <Text c="dimmed" ta="center" className="py-8">
          No transactions found.
        </Text>
      ) : (
        // Transaction list
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const isLastItem = index === transactions.length - 1;
            return (
              <div
                key={transaction.id}
                ref={isLastItem ? ref : null}
                className="transition-all duration-300 hover:translate-x-1"
              >
                <Card withBorder shadow="sm" radius="md">
                  <Group className="mb-2">
                    <div>
                      <Text fw={500}>{transaction.title}</Text>
                      <Text size="sm" c="dimmed">
                        {formatDate(transaction.date)}
                      </Text>
                    </div>
                    <Badge
                      color={transaction.type === "purchase" ? "green" : "blue"}
                      leftSection={
                        transaction.type === "purchase" ? (
                          <IconShoppingCart size={14} />
                        ) : (
                          <IconScan size={14} />
                        )
                      }
                    >
                      {transaction.type === "purchase" ? "Purchase" : "Scan"}
                    </Badge>
                  </Group>

                  <Group>
                    {transaction.imageUrl && (
                      <Image
                        src={transaction.imageUrl || "/placeholder.svg"}
                        width={60}
                        height={60}
                        radius="md"
                        alt={transaction.title}
                      />
                    )}
                    <div className="flex-1">
                      <Text size="sm">{transaction.description}</Text>
                      {transaction.amount && (
                        <Text size="sm" fw={500} className="mt-1">
                          ${transaction.amount.toFixed(2)}
                        </Text>
                      )}
                      {transaction.store && (
                        <Text size="xs" c="dimmed">
                          {transaction.store}
                        </Text>
                      )}
                    </div>
                  </Group>
                </Card>
              </div>
            );
          })}

          {loadingMore && (
            <div className="py-4 flex justify-center">
              <Loader size="sm" />
            </div>
          )}

          {!hasMore && transactions.length > 0 && (
            <Text c="dimmed" ta="center" size="sm" className="py-4">
              End of transaction history
            </Text>
          )}
        </div>
      )}

      {transactions.length > 8 && (
        <ActionIcon
          variant="filled"
          radius="xl"
          size="lg"
          className="fixed bottom-6 right-6 shadow-lg"
          onClick={scrollToTop}
        >
          <IconArrowUp size={18} />
        </ActionIcon>
      )}
    </Paper>
  );
}
