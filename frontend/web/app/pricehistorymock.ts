/*
 * Mock price history data for products
 *
 * This file contains mock price history data for different products.
 * It's used by the price comparison report page to display historical price trends.
 *
 * Author: @Tyler51235
 * Date Created: 2025-03-12
 * Revision
 *  - 2025-03-12 @Tyler51235 Create mock price report table for a few 
 */

// Define the type for price history entries
export interface PriceHistoryEntry {
  date: string;
  walmart: number;
  target: number;
  dillons: number;
}

// Mock price history data for specific products
export const priceHistories: Record<string, PriceHistoryEntry[]> = {
  // Honeycrisp Apple (ID: 100)
  "100": [
    { date: "Mar 1", walmart: 1.49, target: 1.65, dillons: 1.29 },
    { date: "Mar 5", walmart: 1.47, target: 1.62, dillons: 1.27 },
    { date: "Mar 9", walmart: 1.47, target: 1.59, dillons: 1.25 },
  ],
  
  // Banana (ID: 1)
  "1": [
    { date: "Mar 1", walmart: 0.29, target: 0.32, dillons: 0.33 },
    { date: "Mar 5", walmart: 0.28, target: 0.30, dillons: 0.32 },
    { date: "Mar 9", walmart: 0.27, target: 0.29, dillons: 0.30 },
  ],
  
  // Green Grapes (ID: 200)
  "200": [
    { date: "Mar 1", walmart: 0.35, target: 0.40, dillons: 0.38 },
    { date: "Mar 5", walmart: 0.34, target: 0.38, dillons: 0.37 },
    { date: "Mar 9", walmart: 0.33, target: 0.36, dillons: 0.35 },
  ],
  
  // Mango (ID: 300)
  "300": [
    { date: "Mar 1", walmart: 2.10, target: 2.25, dillons: 2.05 },
    { date: "Mar 5", walmart: 2.05, target: 2.15, dillons: 2.02 },
    { date: "Mar 9", walmart: 2.00, target: 2.10, dillons: 2.00 },
  ]
}
// Default price history for products without specific data
export const defaultPriceHistory: PriceHistoryEntry[] = [
  { date: "Mar 1", walmart: 4.99, target: 5.25, dillons: 4.89 },
  { date: "Mar 5", walmart: 4.89, target: 5.15, dillons: 4.79 },
  { date: "Mar 9", walmart: 4.79, target: 4.99, dillons: 4.69 },
];

// Function to get price history for a specific product
export function getPriceHistory(productId: string): PriceHistoryEntry[] {
  return priceHistories[productId] || defaultPriceHistory;
}