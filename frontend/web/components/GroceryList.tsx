"use client";

/*
 *  GroceryList Component
 *
 *  This component manages a user's grocery list, allowing them to add, remove,
 *  and edit items. It also calculates the total cost based on store prices.
 *
 *  Features:
 *  - Add new items from product database
 *  - Remove items from the list
 *  - Adjust quantities
 *  - Select preferred store for each item
 *  - Dynamic total cost calculation
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-03-7
 *  Revision History:
 *  - 2025-03-07 - @haydenmroy10 - initial creation of grocery list component
 *  - 2025-03-10 - @haydenmroy10 - Finish comments
 */

import { useState, useEffect } from "react";
import {
  Select,
  Button,
  ActionIcon,
  Group,
  Paper,
  Text,
  Divider,
  Badge,
  NumberInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { products } from "../app/productsmock";
import { notifications } from "@mantine/notifications";

// Define the grocery list item type
interface GroceryItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  store: string;
  price: number;
  unitPrice: string;
}

export function GroceryList() {
  // State for the grocery list items
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  // State for the new item being added
  // todo -@codyduong
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newItem, setNewItem] = useState("");
  // State for the selected product
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  // State for the selected store
  const [selectedStore, setSelectedStore] = useState<string>("Walmart");
  // State for the quantity
  const [quantity, setQuantity] = useState<number>(1);
  // State for the total cost
  const [totalCost, setTotalCost] = useState<number>(0);

  // Get unique store names from the product data
  const storeOptions = [
    { value: "Walmart", label: "Walmart" },
    { value: "Target", label: "Target" },
    { value: "Dillons", label: "Dillons" },
  ];

  // Product options for the select input
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  // Calculate the total cost whenever the grocery items change
  useEffect(() => {
    const total = groceryItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setTotalCost(total);
  }, [groceryItems]);

  // Handle adding a new item to the grocery list
  const handleAddItem = () => {
    if (!selectedProduct) {
      notifications.show({
        title: "Error",
        message: "Please select a product",
        color: "red",
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Get the price based on the selected store
    let price = product.price;
    let unitPrice = product.weightPrice;

    if (
      selectedStore !== product.at &&
      product.otherPrices &&
      // @ts-expect-error: todo remove this compiler skip when we undo mocks
      product.otherPrices[selectedStore]
    ) {
      // @ts-expect-error: todo remove this compiler skip when we undo mocks
      price = product.otherPrices[selectedStore].price || price;
      // @ts-expect-error: todo remove this compiler skip when we undo mocks
      unitPrice = product.otherPrices[selectedStore].weightPrice || unitPrice;
    }

    const newGroceryItem: GroceryItem = {
      id: `${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity,
      store: selectedStore,
      price,
      unitPrice,
    };

    setGroceryItems([...groceryItems, newGroceryItem]);
    setNewItem("");
    setSelectedProduct(null);
    setQuantity(1);

    notifications.show({
      title: "Item Added",
      message: `${product.name} has been added to your grocery list`,
      color: "green",
    });
  };

  // Handle removing an item from the grocery list
  const handleRemoveItem = (id: string) => {
    setGroceryItems(groceryItems.filter((item) => item.id !== id));
  };

  // Handle updating the quantity of an item
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setGroceryItems(
      groceryItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Handle changing the store for an item
  const handleChangeStore = (id: string, newStore: string) => {
    setGroceryItems(
      groceryItems.map((item) => {
        if (item.id !== id) return item;

        // Find the product to get updated pricing
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;

        let newPrice = product.price;
        let newUnitPrice = product.weightPrice;

        if (
          newStore !== product.at &&
          product.otherPrices &&
          // @ts-expect-error: todo remove this compiler skip when we undo mocks
          product.otherPrices[newStore]
        ) {
          // @ts-expect-error: todo remove this compiler skip when we undo mocks
          newPrice = product.otherPrices[newStore].price || newPrice;
          newUnitPrice =
            // @ts-expect-error: todo remove this compiler skip when we undo mocks
            product.otherPrices[newStore].weightPrice || newUnitPrice;
        }

        return {
          ...item,
          store: newStore,
          price: newPrice,
          unitPrice: newUnitPrice,
        };
      }),
    );
  };

  // Handle sharing the grocery list
  // todo -@codyduong
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleShareList = () => {
    // This would typically involve an API call to share the list
    // For now, we'll just show a notification
    notifications.show({
      title: "List Shared",
      message: "Your grocery list has been shared successfully",
      color: "green",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add new item form */}
      <Paper shadow="xs" p="md" withBorder>
        <Group align="flex-end" mb="md">
          <Select
            label="Product"
            placeholder="Select a product"
            data={productOptions}
            value={selectedProduct}
            onChange={setSelectedProduct}
            searchable
            clearable
            className="flex-grow"
          />
          <Select
            label="Store"
            data={storeOptions}
            value={selectedStore}
            onChange={(value) => setSelectedStore(value || "Walmart")}
            className="w-32"
          />
          <NumberInput
            label="Quantity"
            value={quantity}
            onChange={(value) => setQuantity(Number(value) || 1)}
            min={1}
            className="w-24"
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddItem}
            className="bg-green-600 hover:bg-green-700"
          >
            Add
          </Button>
        </Group>
      </Paper>

      {/* Grocery list items */}
      <Paper shadow="xs" p="md" withBorder className="space-y-4">
        {groceryItems.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Your grocery list is empty. Add some items to get started!
          </Text>
        ) : (
          <>
            {groceryItems.map((item) => (
              <div key={item.id}>
                <Group className="flex items-center">
                  <Group className="flex-grow">
                    <NumberInput
                      value={item.quantity}
                      onChange={(value) =>
                        handleUpdateQuantity(item.id, Number(value) || 1)
                      }
                      min={1}
                      className="w-16"
                    />
                    <div className="flex-grow">
                      <Text>{item.name}</Text>
                      <Group>
                        <Badge color="blue">{item.unitPrice}</Badge>
                        <Text size="sm" c="dimmed">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  <Group>
                    <Select
                      data={storeOptions}
                      value={item.store}
                      onChange={(value) =>
                        handleChangeStore(item.id, value || "Walmart")
                      }
                      className="w-32"
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Divider my="sm" />
              </div>
            ))}
          </>
        )}
      </Paper>

      {/* Total cost */}
      {groceryItems.length > 0 && (
        <Paper shadow="xs" p="md" withBorder>
          <Group>
            <Text fw={500}>Estimated Total Cost:</Text>
            <Text fw={700} size="xl" c="blue">
              ${totalCost.toFixed(2)}
            </Text>
          </Group>
        </Paper>
      )}
    </div>
  );
}
