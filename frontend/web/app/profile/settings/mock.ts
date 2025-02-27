/**
 * Temporary mock file for previewing. TODO delete and replace with network calls
 *
 * Author: @codyduong
 * Revisions:
 * - 2025 Feb 26 - @codyduong - temporary file for mocking data for week2
 */

import { Effect } from "effect";

export interface UserSettings {
  name: string;
  email: string;
  phone: string;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  currency: string;
}

export const fetchUserSettings = Effect.gen(function* (_) {
  yield* _(Effect.sleep(800));
  return {
    name: "John Doe",
    // email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    notificationsEnabled: true,
    darkModeEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    language: "en",
    currency: "usd",
  };
});

export const fetchDashboardData = Effect.gen(function* (_) {
  yield* _(Effect.sleep(800));
  return {
    moneySaved: 245.89,
    productsScanned: 37,
    groceriesBought: 18,
    savingsRate: 68,
    monthlyBudget: 500,
    monthlySpent: 320,
    recentActivity: 12,
    favoriteStores: 3,
    topCategories: ["Produce", "Dairy", "Snacks"],
  };
});

export const saveUserSettings = Effect.gen(function* (_) {
  const { settings: __ } = yield* _(Effect.succeed({ settings: {} }));
  yield* _(Effect.sleep(1500)); // Simulate network delay

  // Simulate success
  return { success: true, message: "Settings saved successfully" };
});
