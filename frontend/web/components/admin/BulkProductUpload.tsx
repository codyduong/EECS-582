"use client";

/*
 * Bulk Product Upload Component
 *
 * This component provides functionality to upload multiple products at once by:
 * - Supporting CSV/Excel file upload
 * - Validating the uploaded data format
 * - Showing a preview of products to be added
 * - Reporting on upload progress and results
 *
 * Authors: @ehnuJ
 * Date Created: 2025-03-05
 */

import { useState, useRef } from "react";
import {
  Box,
  Button,
  Group,
  Text,
  Card,
  FileInput,
  Alert,
  Progress,
  Table,
  ScrollArea,
  Badge,
} from "@mantine/core";
import {
  IconFileSpreadsheet,
  IconDownload,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

// Mock product data for preview
interface BulkProduct {
  name: string;
  sku: string;
  price: number;
  weightPrice: string;
  store: string;
  status: "valid" | "invalid" | "duplicate";
  error?: string;
}

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<BulkProduct[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    duplicates: 0,
  });

  const templateUrl = useRef("sample-product-template.csv");

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setUploadComplete(false);

    if (selectedFile) {
      // In a real app, we would parse the CSV/Excel file here
      // For now, we'll simulate with mock data
      setTimeout(() => {
        const mockData: BulkProduct[] = [
          {
            name: "Organic Bananas",
            sku: "FRUT1001",
            price: 0.49,
            weightPrice: "$0.79/lb",
            store: "Walmart",
            status: "valid",
          },
          {
            name: "Red Delicious Apples",
            sku: "FRUT1002",
            price: 0.89,
            weightPrice: "$1.99/lb",
            store: "Walmart",
            status: "valid",
          },
          {
            name: "2% Milk - 1 Gallon",
            sku: "MILK1001",
            price: 3.49,
            weightPrice: "",
            store: "Target",
            status: "valid",
          },
          {
            name: "White Bread",
            sku: "BKRY1001",
            price: 2.29,
            weightPrice: "",
            store: "Dillons",
            status: "valid",
          },
          {
            name: "Honeycrisp Apple",
            sku: "SKU12345",
            price: 1.25,
            weightPrice: "$2.49/lb",
            store: "Dillons",
            status: "duplicate",
            error: "SKU already exists in the system",
          },
          {
            name: "",
            sku: "INVLD001",
            price: -1.99,
            weightPrice: "",
            store: "Walmart",
            status: "invalid",
            error: "Missing product name and price cannot be negative",
          },
        ];

        setPreviewData(mockData);
      }, 1000);
    } else {
      setPreviewData([]);
    }
  };

  const downloadTemplate = () => {
    // Create an anchor element and trigger download of the template
    const link = document.createElement("a");
    link.href = templateUrl.current;
    link.download = "product-upload-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notifications.show({
      title: "Template Downloaded",
      message: "Product upload template has been downloaded.",
      color: "blue",
      icon: <IconFileSpreadsheet size={16} />,
    });
  };

  const handleUpload = () => {
    if (!file || previewData.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);

          // Calculate stats based on preview data
          const total = previewData.length;
          const duplicates = previewData.filter(
            (p) => p.status === "duplicate",
          ).length;
          const invalid = previewData.filter(
            (p) => p.status === "invalid",
          ).length;
          const successful = total - duplicates - invalid;

          setUploadStats({
            total,
            successful,
            duplicates,
            failed: invalid,
          });

          notifications.show({
            title: "Upload Complete",
            message: `Successfully added ${successful} out of ${total} products`,
            color: successful === total ? "green" : "yellow",
            icon:
              successful === total ? (
                <IconCheck size={16} />
              ) : (
                <IconAlertTriangle size={16} />
              ),
          });

          return 100;
        }
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  };

  return (
    <Box>
      <Card withBorder shadow="sm" padding="lg" radius="md" mb="lg">
        <Text fw={500} size="lg" mb="md">
          Bulk Product Upload
        </Text>

        <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
          Upload multiple products at once using a CSV or Excel file. Make sure
          your file follows the required format.
        </Alert>

        <Group mb="lg">
          <Button
            leftSection={<IconDownload size={16} />}
            variant="outline"
            onClick={downloadTemplate}
          >
            Download Template
          </Button>

          <Text size="sm" c="dimmed">
            Use our template file to ensure proper formatting of your product
            data.
          </Text>
        </Group>

        <FileInput
          label="Upload Product File"
          placeholder="Select CSV or Excel file"
          accept=".csv,.xlsx,.xls"
          leftSection={<IconFileSpreadsheet size={16} />}
          value={file}
          onChange={handleFileChange}
          clearable
          mb="md"
        />

        {uploading && (
          <Box mb="md">
            <Text size="sm" mb="xs">
              Uploading products...
            </Text>
            <Progress value={uploadProgress} size="sm" striped animated />
          </Box>
        )}

        {uploadComplete && (
          <Alert
            color={uploadStats.failed > 0 ? "yellow" : "green"}
            title="Upload Results"
            mb="md"
            icon={
              uploadStats.failed > 0 ? (
                <IconAlertTriangle size={16} />
              ) : (
                <IconCheck size={16} />
              )
            }
          >
            <Text>Total products: {uploadStats.total}</Text>
            <Text>Successfully added: {uploadStats.successful}</Text>
            <Text>Duplicates found: {uploadStats.duplicates}</Text>
            <Text>Failed: {uploadStats.failed}</Text>
          </Alert>
        )}

        <Group justify="flex-end" mt="lg">
          <Button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || uploading}
            loading={uploading}
            color="green"
          >
            Upload Products
          </Button>
        </Group>
      </Card>

      {previewData.length > 0 && (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Text fw={500} size="lg" mb="md">
            Data Preview
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Preview of products to be added. Review for any errors before
            uploading.
          </Text>

          <ScrollArea h={300} offsetScrollbars type="auto">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Weight Price</Table.Th>
                  <Table.Th>Store</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {previewData.map((product, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      {product.status === "valid" ? (
                        <Badge
                          color="green"
                          leftSection={<IconCheck size={12} />}
                        >
                          Valid
                        </Badge>
                      ) : product.status === "duplicate" ? (
                        <Badge color="yellow" title={product.error}>
                          Duplicate
                        </Badge>
                      ) : (
                        <Badge
                          color="red"
                          title={product.error}
                          leftSection={<IconX size={12} />}
                        >
                          Invalid
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>{product.name}</Table.Td>
                    <Table.Td>{product.sku}</Table.Td>
                    <Table.Td>${product.price.toFixed(2)}</Table.Td>
                    <Table.Td>{product.weightPrice || "-"}</Table.Td>
                    <Table.Td>{product.store}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </Box>
  );
}
