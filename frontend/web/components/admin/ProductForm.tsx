"use client";

/*
 * Product Form Component
 *
 * This component provides a form for adding new products with:
 * - Field validation
 * - Real-time SKU uniqueness checking
 * - Image upload capability
 * - Price entry for multiple stores
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import { useEffect, useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Text,
  Card,
  Switch,
  FileInput,
  Textarea,
  Accordion,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconUpload,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Effect } from "effect";

// Simulate checking SKU uniqueness with a delay
const checkSkuUniqueness = (sku: string) =>
  Effect.gen(function* (_) {
    yield* _(Effect.sleep(800));
    // Mock implementation - in a real app, this would call an API
    const existingSkus = ["SKU12345", "SKU67890", "PROD12345"];
    return !existingSkus.includes(sku);
  });

interface PriceByStore {
  store: string;
  price: number | undefined;
  weightPrice: string;
}

interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  defaultPrice: number;
  weightPrice: string;
  image: File | null;
  pricesByStore: PriceByStore[];
  isActive: boolean;
}

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [skuCheckLoading, setSkuCheckLoading] = useState(false);
  const [skuUnique, setSkuUnique] = useState<boolean | null>(null);

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: "",
      sku: "",
      description: "",
      defaultPrice: 0,
      weightPrice: "",
      image: null,
      pricesByStore: [
        { store: "Walmart", price: undefined, weightPrice: "" },
        { store: "Target", price: undefined, weightPrice: "" },
        { store: "Dillons", price: undefined, weightPrice: "" },
      ],
      isActive: true,
    },
    validate: {
      name: (value) =>
        value.trim().length < 2
          ? "Product name must be at least 2 characters"
          : null,
      sku: (value) =>
        value.trim().length < 4 ? "SKU must be at least 4 characters" : null,
      defaultPrice: (value) => (value < 0 ? "Price cannot be negative" : null),
    },
  });

  // SKU uniqueness validation effect
  useEffect(() => {
    const sku = form.values.sku.trim();
    if (sku.length >= 4) {
      const timeoutId = setTimeout(() => {
        setSkuCheckLoading(true);
        Effect.runPromise(checkSkuUniqueness(sku))
          .then((isUnique) => {
            setSkuUnique(isUnique);
            if (!isUnique) {
              form.setFieldError("sku", "This SKU already exists");
            } else {
              form.setFieldError("sku", null);
            }
          })
          .finally(() => {
            setSkuCheckLoading(false);
          });
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSkuUnique(null);
    }
  }, [form.values.sku, form]);

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true);

    try {
      // This would be an API call in a real application
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful product creation
      console.log("Product created:", values);

      notifications.show({
        title: "Product added",
        message: `${values.name} has been successfully added to the catalog`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      form.reset();
      setSkuUnique(null);
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (_error) {
      notifications.show({
        title: "Error",
        message: "Failed to add product. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder shadow="sm" padding="lg" radius="md" mb="lg">
          <Text fw={500} size="lg" mb="md">
            Basic Information
          </Text>

          <TextInput
            required
            label="Product Name"
            placeholder="Enter product name"
            {...form.getInputProps("name")}
            mb="md"
          />

          <Group grow mb="md">
            <TextInput
              required
              label="SKU (Stock Keeping Unit)"
              placeholder="Enter unique SKU"
              {...form.getInputProps("sku")}
              rightSection={
                skuCheckLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-400 border-t-transparent"></div>
                ) : skuUnique === true ? (
                  <IconCheck size={18} className="text-green-500" />
                ) : skuUnique === false ? (
                  <IconX size={18} className="text-red-500" />
                ) : null
              }
            />

            <NumberInput
              required
              label="Default Price ($)"
              placeholder="0.00"
              min={0}
              step={0.01}
              decimalScale={2}
              fixedDecimalScale
              {...form.getInputProps("defaultPrice")}
            />
          </Group>

          <TextInput
            label="Weight Price (e.g., $2.99/lb)"
            placeholder="Enter weight-based pricing"
            {...form.getInputProps("weightPrice")}
            mb="md"
          />

          <Textarea
            label="Product Description"
            placeholder="Enter detailed product description"
            minRows={3}
            {...form.getInputProps("description")}
            mb="md"
          />

          <FileInput
            label="Product Image"
            placeholder="Upload product image"
            accept="image/png,image/jpeg,image/webp"
            leftSection={<IconUpload size={16} />}
            {...form.getInputProps("image")}
            mb="md"
          />

          <Switch
            label="Product is active and available"
            {...form.getInputProps("isActive", { type: "checkbox" })}
          />
        </Card>

        <Card withBorder shadow="sm" padding="lg" radius="md" mb="lg">
          <Text fw={500} size="lg" mb="md">
            Store-Specific Pricing
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Set different prices for the same product at different stores. Leave
            blank to use the default price.
          </Text>

          <Accordion>
            {form.values.pricesByStore.map((_, index) => (
              <Accordion.Item key={index} value={`store-${index}`}>
                <Accordion.Control>
                  <Group justify="space-between">
                    <Text>{form.values.pricesByStore[index].store}</Text>
                    {form.values.pricesByStore[index].price && (
                      <Text fw={500}>
                        ${form.values.pricesByStore[index].price?.toFixed(2)}
                      </Text>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Group grow mb="md">
                    <NumberInput
                      label="Price ($)"
                      placeholder="Store-specific price"
                      min={0}
                      step={0.01}
                      decimalScale={2}
                      fixedDecimalScale
                      {...form.getInputProps(`pricesByStore.${index}.price`)}
                    />

                    <TextInput
                      label="Weight Price"
                      placeholder="e.g., $2.99/lb"
                      {...form.getInputProps(
                        `pricesByStore.${index}.weightPrice`,
                      )}
                    />
                  </Group>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading || skuUnique === false}
            color="green"
          >
            Add Product
          </Button>
        </Group>
      </form>

      {skuUnique === false && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mt="md">
          The SKU you entered already exists in the system. Please use a unique
          SKU.
        </Alert>
      )}
    </Box>
  );
}
