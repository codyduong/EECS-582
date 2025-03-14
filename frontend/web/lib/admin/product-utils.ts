/*
 * Product Utilities for Admin
 *
 * Provides helper functions for product management including:
 * - Validation functions
 * - Data transformation
 * - SKU generation
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import { Effect } from "effect";

// Define interfaces for better type safety
export interface ProductData {
  id?: string;
  name: string;
  sku: string;
  price: number;
  weightPrice?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  stores: StorePrice[];
}

export interface StorePrice {
  store: string;
  price?: number;
  weightPrice?: string;
}

/**
 * Validates a product SKU against existing SKUs
 *
 * @param sku The SKU to validate
 * @returns Effect that resolves to true if the SKU is unique
 */
export const validateSku = (sku: string): Effect.Effect<boolean, Error> => {
  return Effect.gen(function* (_) {
    yield* _(Effect.sleep(800)); // Simulate API call delay

    // In a real app, this would call an API endpoint
    const existingSkus = ["SKU12345", "SKU67890", "PROD12345"];
    return !existingSkus.includes(sku);
  });
};

/**
 * Generates a unique SKU based on product name and category
 *
 * @param name Product name
 * @param category Optional category
 * @returns A generated SKU string
 */
export const generateSku = (name: string, category?: string): string => {
  // Create a base for the SKU
  const prefix = category ? category.substring(0, 4).toUpperCase() : "PROD";

  // Create a slug from the name
  const nameSlug = name
    .replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric
    .substring(0, 6) // Take first 6 chars
    .toUpperCase();

  // Add a random number for uniqueness
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${prefix}-${nameSlug}-${randomNum}`;
};

/**
 * Validates product data before submission
 *
 * @param product The product data to validate
 * @returns An array of validation errors, empty if valid
 */
export const validateProduct = (product: ProductData): string[] => {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters");
  }

  if (!product.sku || product.sku.trim().length < 4) {
    errors.push("SKU must be at least 4 characters");
  }

  if (product.price < 0) {
    errors.push("Price cannot be negative");
  }

  return errors;
};

/**
 * Formats price for display
 *
 * @param price The price value
 * @param format The format string (defaults to USD)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, format = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: format,
  }).format(price);
};

// Dummy function to simulate product creation
export const createProduct = (
  product: ProductData,
): Effect.Effect<string, Error> => {
  return Effect.gen(function* (_) {
    yield* _(Effect.sleep(1500)); // Simulate API call delay

    // In a real app, this would be an API call
    // For now, just return a success message
    return `Product ${product.name} created successfully with ID: PROD-${Date.now()}`;
  });
};
