/**
 * Temporary mock file for previewing. TODO delete and replace with network calls
 *
 * Author: @codyduong
 * Revisions:
 * - 2025 Feb 26 - @codyduong - temporary file for mocking data for week2
 */

import { Effect } from "effect";

export type DashboardData = {
  moneySaved: number;
  productsScanned: number;
  groceriesBought: number;
  savingsRate: number;
  monthlyBudget: number;
  monthlySpent: number;
  recentActivity: number;
  favoriteStores: number;
  topCategories: string[];
};

// Mock API call using Effect
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
