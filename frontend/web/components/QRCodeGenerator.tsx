"use client";
/*
 * Author: @Tyler51235
 * This component generates QR codes for price reports with price comparisons and specific stores
 *
 * Date Created: 3/11/25
 * Revison history:
 * - @Tyler51235: Created QR generator
 *
 *
 */
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Button,
  Card,
  Text,
  Group,
  Select,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconDownload, IconShare, IconCopy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface QRCodeGeneratorProps {
  productId: string;
  productName: string;
  baseUrl?: string;
}

export function QRCodeGenerator({
  productId,
  productName,
  baseUrl = "localhost:3000",
}: QRCodeGeneratorProps) {
  const [qrType, setQrType] = useState<string>("product");
  const [storeFilter, setStoreFilter] = useState<string | null>(null);

  // Generate the URL based on the QR type and filters
  const generateQrUrl = () => {
    let url = `${baseUrl}/products/${productId}`;

    if (qrType === "price-comparison") {
      url += "/price-comparison";
    } else if (qrType === "store-specific" && storeFilter) {
      url += `/store/${storeFilter}`;
    }

    return url;
  };

  const qrUrl = generateQrUrl();

  // Download QR code as PNG
  const downloadQrCode = () => {
    const canvas = document.getElementById(
      "qr-code-canvas",
    ) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      notifications.show({
        title: "QR Code Downloaded",
        message: "The QR code has been downloaded successfully",
        color: "green",
      });
    }
  };

  // Copy QR code URL to clipboard
  const copyQrUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    notifications.show({
      title: "URL Copied",
      message: "The QR code URL has been copied to clipboard",
      color: "blue",
    });
  };

  // Share QR code (if Web Share API is available)
  const shareQrCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} Price Report`,
          text: `Check out the price report for ${productName}`,
          url: qrUrl,
        });
        notifications.show({
          title: "Shared Successfully",
          message: "The QR code has been shared",
          color: "green",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyQrUrl();
    }
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="max-w-md mx-auto"
    >
      <Text fw={500} size="lg" className="mb-4">
        Price Report QR Code
      </Text>

      <div className="mb-4">
        <Select
          label="QR Code Type"
          placeholder="Select QR code type"
          value={qrType}
          onChange={(value) => setQrType(value || "product")}
          data={[
            { value: "product", label: "Product Details" },
            { value: "price-comparison", label: "Price Comparison" },
            { value: "store-specific", label: "Store-Specific Pricing" },
          ]}
          className="mb-3"
        />

        {qrType === "store-specific" && (
          <Select
            label="Select Store"
            placeholder="Choose a store"
            value={storeFilter}
            onChange={setStoreFilter}
            data={[
              { value: "walmart", label: "Walmart" },
              { value: "target", label: "Target" },
              { value: "dillons", label: "Dillons" },
            ]}
            className="mb-3"
          />
        )}
      </div>

      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrUrl}
            size={200}
            level="H" // High error correction
            includeMargin={true}
            imageSettings={{
              src: "/logo-small.png",
              excavate: true,
              height: 24,
              width: 24,
            }}
          />
          <canvas id="qr-code-canvas" style={{ display: "none" }} />
        </div>
      </div>

      <Text size="sm" c="dimmed" className="mb-3 text-center">
        Scan this QR code to view the price report for {productName}
      </Text>

      <Text size="xs" c="dimmed" className="mb-4 text-center break-all">
        {qrUrl}
      </Text>

      <Group position="center" spacing="md">
        <Tooltip label="Download QR Code">
          <ActionIcon variant="light" color="blue" onClick={downloadQrCode}>
            <IconDownload size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Copy Link">
          <ActionIcon variant="light" color="blue" onClick={copyQrUrl}>
            <IconCopy size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Share">
          <ActionIcon variant="light" color="blue" onClick={shareQrCode}>
            <IconShare size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Button
        fullWidth
        variant="light"
        color="blue"
        className="mt-4"
        onClick={downloadQrCode}
      >
        Download QR Code
      </Button>
    </Card>
  );
}
