"use client";

import ProtectedPage from "@/components/ProtectedPage";
/*
 *  Client only layout page for profile
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-27
 *  Revision History:
 *  - 2025-02-27 - @codyduong - create profile page skeleton
 */

import { PermissionValidator } from "@/lib/permissions";
import { Container, Tabs, rem } from "@mantine/core";
import { IconUser, IconHistory, IconSettings } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const tabs = [
  { value: "overview", label: "Overview", icon: IconUser, path: "/profile" },
  {
    value: "history",
    label: "History",
    icon: IconHistory,
    path: "/profile/history",
  },
  {
    value: "settings",
    label: "Settings",
    icon: IconSettings,
    path: "/profile/settings",
  },
];

export default function ProfileLayoutInner({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Set active tab based on current path
    const currentTab = tabs.find((tab) => tab.path === pathname);
    if (currentTab) {
      setActiveTab(currentTab.value);
    }
  }, [pathname]);

  const handleTabChange = (value: string | null) => {
    if (!value) return;

    // Determine direction for animation
    const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const newIndex = tabs.findIndex((tab) => tab.value === value);
    setDirection(newIndex > currentIndex ? 1 : -1);

    // Navigate to the corresponding route
    const tabPath = tabs.find((tab) => tab.value === value)?.path;
    if (tabPath) {
      router.push(tabPath);
    }
  };

  return (
    <ProtectedPage validator={new PermissionValidator()}>
      <Container size="xl" py="md" className="flex-grow">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="outline"
          classNames={{
            root: "mb-6",
            list: "border-b border-gray-200 dark:border-gray-700 mb-4",
            tab: "font-medium transition-colors",
          }}
        >
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={
                  <tab.icon style={{ width: rem(16), height: rem(16) }} />
                }
                className="data-[active=true]:border-primary data-[active=true]:text-primary"
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={pathname}
            custom={direction}
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Container>
    </ProtectedPage>
  );
}
