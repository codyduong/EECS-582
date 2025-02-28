"use client";

/*
 *  Page at "/profile"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @codyduong - create profile page skeleton
 *  - 2025-02-26 - @codyduong - fill out profile page with three tabs
 */

import "@mantine/core/styles.css";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Paper, Title, Text, RingProgress, Group } from "@mantine/core";
import {
  IconCash,
  IconShoppingCart,
  IconScan,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { Effect } from "effect";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { DashboardData, fetchDashboardData } from "./mock";
import { DashboardWidget } from "@/components/profile/DashboardWidget";

// Widget definitions
const widgetDefinitions = [
  {
    id: "moneySaved",
    title: "Money Saved",
    component: MoneySavedWidget,
  },
  {
    id: "productsScanned",
    title: "Products Scanned",
    component: ProductsScannedWidget,
  },
  {
    id: "groceriesBought",
    title: "Groceries Bought",
    component: GroceriesBoughtWidget,
  },
  {
    id: "budgetProgress",
    title: "Budget Progress",
    component: BudgetProgressWidget,
  },
  {
    id: "recentActivity",
    title: "Recent Activity",
    component: RecentActivityWidget,
  },
  {
    id: "favoriteStores",
    title: "Favorite Stores",
    component: FavoriteStoresWidget,
  },
  {
    id: "topCategories",
    title: "Top Categories",
    component: TopCategoriesWidget,
  },
];

export default function ProfilePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(
    widgetDefinitions.map((w) => w.id),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    // Fetch dashboard data
    Effect.runPromise(fetchDashboardData)
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        const newOrder = [...items];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id as string);

        return newOrder;
      });
    }
  }, []);

  // Memoize sortedWidgets to prevent unnecessary re-renders
  const sortedWidgets = useMemo(
    () =>
      widgetOrder
        .map((id) => widgetDefinitions.find((w) => w.id === id))
        .filter(Boolean) as typeof widgetDefinitions,
    [widgetOrder],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Title order={2} className="mb-4">
          Loading your dashboard...
        </Title>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Paper p="md" radius="md" className="min-h-[80vh]">
      <Title order={2} className="mb-6">
        Dashboard Overview
      </Title>
      <Text c="dimmed" className="mb-6">
        Welcome to your personal dashboard. Here you can track your savings,
        shopping habits, and more. Drag and drop widgets to customize your view.
      </Text>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWidgets.map((widget) => (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
              >
                <widget.component data={dashboardData} />
              </DashboardWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Paper>
  );
}

// Widget components remain unchanged
function MoneySavedWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col items-center">
      <IconCash size={48} className="text-green-500 mb-2" />
      <Text size="xl" fw={700} className="text-green-500">
        ${data.moneySaved.toFixed(2)}
      </Text>
      <Text size="sm" c="dimmed">
        Total Money Saved
      </Text>
      <Group className="mt-2">
        <Text size="xs" className="flex items-center text-green-500">
          <IconArrowUpRight size={16} className="mr-1" />
          +12% from last month
        </Text>
      </Group>
    </div>
  );
}

function ProductsScannedWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col items-center">
      <IconScan size={48} className="text-blue-500 mb-2" />
      <Text size="xl" fw={700} className="text-blue-500">
        {data.productsScanned}
      </Text>
      <Text size="sm" c="dimmed">
        Products Scanned
      </Text>
      <Group className="mt-2">
        <Text size="xs" className="flex items-center text-blue-500">
          <IconArrowUpRight size={16} className="mr-1" />
          +5 this week
        </Text>
      </Group>
    </div>
  );
}

function GroceriesBoughtWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col items-center">
      <IconShoppingCart size={48} className="text-purple-500 mb-2" />
      <Text size="xl" fw={700} className="text-purple-500">
        {data.groceriesBought}
      </Text>
      <Text size="sm" c="dimmed">
        Groceries Bought
      </Text>
      <Group className="mt-2">
        <Text size="xs" className="flex items-center text-red-500">
          <IconArrowDownRight size={16} className="mr-1" />
          -2 from last week
        </Text>
      </Group>
    </div>
  );
}

function BudgetProgressWidget({ data }: { data: DashboardData | null }) {
  // const { colorScheme } = useMantineColorScheme();
  // const isDark = colorScheme === "dark";
  if (!data) return null;
  const percentage = Math.round((data.monthlySpent / data.monthlyBudget) * 100);

  return (
    <div className="flex flex-col items-center">
      <RingProgress
        size={120}
        thickness={12}
        roundCaps
        sections={[
          { value: percentage, color: percentage > 90 ? "red" : "blue" },
        ]}
        label={
          <Text ta="center" size="lg" fw={700}>
            {percentage}%
          </Text>
        }
      />
      <Text size="sm" c="dimmed" className="mt-2">
        Monthly Budget
      </Text>
      <Text size="xs" className="mt-1">
        ${data.monthlySpent} of ${data.monthlyBudget}
      </Text>
    </div>
  );
}

function RecentActivityWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col">
      <Text size="lg" fw={500} className="mb-2">
        {data.recentActivity} Recent Activities
      </Text>
      <Text size="sm" c="dimmed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Text>
      <Text size="xs" className="mt-2 text-blue-500 cursor-pointer">
        View all activities
      </Text>
    </div>
  );
}

function FavoriteStoresWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col">
      <Text size="lg" fw={500} className="mb-2">
        {data.favoriteStores} Favorite Stores
      </Text>
      <Text size="sm" c="dimmed">
        Your most frequently visited stores. Tap to see detailed savings at each
        location.
      </Text>
      <Text size="xs" className="mt-2 text-blue-500 cursor-pointer">
        Manage stores
      </Text>
    </div>
  );
}

function TopCategoriesWidget({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  return (
    <div className="flex flex-col">
      <Text size="lg" fw={500} className="mb-2">
        Top Categories
      </Text>
      <div className="flex flex-wrap gap-2 mt-2">
        {data.topCategories.map((category: string) => (
          <div
            key={category}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs"
          >
            {category}
          </div>
        ))}
      </div>
      <Text size="xs" className="mt-4 text-blue-500 cursor-pointer">
        View all categories
      </Text>
    </div>
  );
}
