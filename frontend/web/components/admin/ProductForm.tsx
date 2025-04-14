"use client";

/*
 * Product Form Component
 *
 * This component provides a form for adding new products with:
 * - Field validation
 * - Real-time GTIN uniqueness checking
 * - Image upload capability
 * - Price entry for multiple stores
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 * Revision History:
 * - 2025-03-10 - @ehnuJ - added onSuccess callback
 * - 2025-04-13 - @codyduong - improve gql linkage
 */

import { ChangeEventHandler, useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Text,
  Card,
  // Switch,
  FileInput,
  Textarea,
  // Accordion,
  LoadingOverlay,
  Alert,
  Select,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconUpload,
  IconX,
  IconAlertCircle,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { graphql } from "@/graphql";
import { UnitSymbol } from "@/graphql/graphql";

const QUERY_PRODUCT = graphql(`
  query ProductForm_Product($gtin: String!) {
    get_product(gtin: $gtin) {
      gtin
    }
  }
`);

const QUERY_UNIT = graphql(`
  query ProductForm_Units {
    get_units {
      id
      symbol
    }
  }
`);

const MUTATION_PRODUCT = graphql(`
  mutation ProductForm_PostProduct(
    $measures: [NewProductToMeasurePartial_Input]!
    $productname: String!
    $gtin: mutationInput_post_products_input_items_allOf_0_gtin!
  ) {
    post_products(
      input: { gtin: $gtin, productname: $productname, measures: $measures }
    )
  }
`);

interface ProductFormValues {
  name: string;
  gtin: string;
  description: string;
  image: File | null;
  isActive: boolean;
  measures: {
    amount: number;
    unit: UnitSymbol;
    isPrimary: boolean;
  }[];
}

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const { data: unitsData } = useQuery(QUERY_UNIT, {});
  const [productMutation, { loading: _productUploading }] =
    useMutation(MUTATION_PRODUCT);
  const [getGtin, { data: searchedData, loading: _gettingGtin }] =
    useLazyQuery(QUERY_PRODUCT);
  const gtinUnique = !searchedData?.get_product;

  const units =
    unitsData?.get_units?.filter((i): i is NonNullable<typeof i> => !!i) ?? [];

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: "",
      gtin: "",
      description: "",
      image: null,
      isActive: true,
      measures: [
        {
          amount: undefined!,
          unit: undefined!,
          isPrimary: true,
        },
      ],
    },
    validate: {
      name: (value) =>
        value.trim().length < 2
          ? "Product name must be at least 2 characters"
          : null,
      gtin: (value) =>
        value.trim().length < 4 ? "GTIN must be at least 8 characters" : null,
      // defaultPrice: (value) => (value < 0 ? "Price cannot be negative" : null),
    },
  });

  const onChangeGtin: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newGtin = event.currentTarget.value.trim();
    if (newGtin.length >= 8) {
      getGtin({ variables: { gtin: newGtin } });
    }
    form.setFieldValue("gtin", newGtin);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true);

    try {
      const result = await productMutation({
        variables: {
          productname: values.name,
          gtin: values.gtin,
          measures: values.measures.map((measure) => ({
            amount: measure.amount,
            is_converted: false,
            is_primary_measure: measure.isPrimary,
            raw_amount: null,
            unit: measure.unit,
          })),
        },
      });

      if (!result.data?.post_products) {
        throw false;
      }

      notifications.show({
        title: "Product added",
        message: `${values.name} has been successfully added to the catalog`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      form.reset();

      onSuccess?.();
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

  const addMeasure = () => {
    if (form.values.measures.length < 4) {
      form.insertListItem("measures", {
        amount: undefined,
        unit: undefined!,
        isPrimary: false,
      });
    }
  };

  const removeMeasure = (index: number) => {
    if (form.values.measures.length > 1) {
      const wasPrimary = form.values.measures[index].isPrimary;
      const newMeasures = [...form.values.measures];
      newMeasures.splice(index, 1);

      // If removing the primary measure, make the first remaining one primary
      if (wasPrimary && newMeasures.length > 0) {
        newMeasures[0].isPrimary = true;
      }

      form.setFieldValue("measures", newMeasures);
    }
  };

  const setPrimaryMeasure = (index: number, isPrimary: boolean) => {
    if (isPrimary) {
      // Update all measures to set only the selected one as primary
      const updatedMeasures = form.values.measures.map((m, i) => ({
        ...m,
        isPrimary: i === index,
      }));
      form.setFieldValue("measures", updatedMeasures);
    } else {
      // If trying to uncheck the only primary, prevent it
      const hasAnotherPrimary = form.values.measures.some(
        (m, i) => m.isPrimary && i !== index,
      );
      if (!hasAnotherPrimary) {
        // Don't allow unchecking if this is the only primary
        return;
      }
      form.setFieldValue(`measures.${index}.isPrimary`, false);
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

          <TextInput
            required
            label="Global Trade Identification Number (GTIN)"
            placeholder="Enter unique GTIN"
            onChange={onChangeGtin}
            rightSection={
              gtinUnique === true ? (
                <IconCheck size={18} className="text-green-500" />
              ) : gtinUnique === false ? (
                <IconX size={18} className="text-red-500" />
              ) : null
            }
            mb="md"
          />

          <Textarea
            label="Product Description"
            placeholder="Enter detailed product description"
            minRows={3}
            {...form.getInputProps("description")}
            mb="md"
          />

          <Box mb="md">
            <Text fw={500} mb="sm">
              Product Measures
            </Text>

            {form.values.measures.map((measure, index) => (
              <Group key={index} mb="xs" align="flex-end">
                <NumberInput
                  label="Amount"
                  placeholder="Enter amount"
                  required
                  min={0.01}
                  step={0.01}
                  {...form.getInputProps(`measures.${index}.amount`)}
                />

                <Select
                  label="Unit"
                  placeholder="Select unit"
                  required
                  data={units.map((unit) => ({
                    value: unit.symbol,
                    label: unit.symbol,
                  }))}
                  {...form.getInputProps(`measures.${index}.unit`)}
                />

                <Box className="mb-2">
                  <Checkbox
                    label="Primary Measure"
                    checked={measure.isPrimary}
                    onChange={(event) =>
                      setPrimaryMeasure(index, event.currentTarget.checked)
                    }
                  />
                </Box>

                {form.values.measures.length > 1 && (
                  <Button
                    color="red"
                    variant="subtle"
                    onClick={() => removeMeasure(index)}
                    title="Remove measure"
                  >
                    <IconTrash size={16} />
                  </Button>
                )}
              </Group>
            ))}

            {form.values.measures.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                mt="xs"
                leftSection={<IconPlus size={16} />}
                onClick={addMeasure}
              >
                Add Another Measure
              </Button>
            )}
          </Box>

          <FileInput
            label="Product Image"
            placeholder="Upload product image"
            accept="image/png,image/jpeg,image/webp"
            leftSection={<IconUpload size={16} />}
            {...form.getInputProps("image")}
            mb="md"
            disabled
          />

          {/* <Switch
            label="Product is active and available"
            {...form.getInputProps("isActive", { type: "checkbox" })}
          /> */}
        </Card>

        {/* <Card withBorder shadow="sm" padding="lg" radius="md" mb="lg">
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
        </Card> */}

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading || gtinUnique === false}
            color="green"
          >
            Add Product
          </Button>
        </Group>
      </form>

      {gtinUnique === false && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mt="md">
          The GTIN you entered already exists in the system. Please use a unique
          GTIN.
        </Alert>
      )}
    </Box>
  );
}
