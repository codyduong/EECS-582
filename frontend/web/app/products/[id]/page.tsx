"use client";

/*
 *  Page at "/products"
 *
 *  Authors:  @codyduong, @Tyler51235
 *  Date Created: 2025-03-01
 *  Revision History:
 *  - 2025-03-01 - @codyduong - make page data
 *  - 2025-03-02 - @codyduong - implement page description
 *  - 2025-03-11 - @Tyler51235 - add QR code generator tab
 *  - 2025-03-14 - @hvwendt - add price reporting functionality
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import {
  Container,
  Title,
  Group,
  Text,
  Accordion,
  Tabs,
  Button,
  Modal,
  NumberInput,
  Select,
  Notification,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconQrcode,
  IconInfoCircle,
  IconReportMoney,
  IconMapPin,
  IconCoin,
  IconCheck,
  IconX,
  IconArrowBack,
} from "@tabler/icons-react";
import { ProductCard } from "@/components/ProductCard";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import Image from "next/image";
import { useParams } from "next/navigation";
import { products } from "@/app/productsmock";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import PriceComparisonReport from "./price-comparison/page";

const ProductQuery = graphql(`
  query Product($gtin: String!) {
    get_product(gtin: $gtin) {
      gtin
      productname
      images {
        image_url
      }
    }
  }
`);

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery(ProductQuery, {
    variables: {
      gtin: id,
    },
  });

  const product = data?.get_product;

  // TODO: @codyduong remove
  const oldProduct = products[0];

  // Get related products (excluding current product)
  const relatedProducts = products.filter((p) => p.id !== id);

  const [page, setPage] = useState(0);
  // todo don't make this constant
  const [productsPerPage, _setProductsPerPage] = useState(4);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  // Price reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedPrice, setReportedPrice] = useState("");
  const [reportedLocation, setReportedLocation] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Function to handle price report submission
  const handlePriceReport = async () => {
    try {
      // Validate inputs
      if (!reportedPrice || !reportedLocation) {
        setNotification({
          show: true,
          message: "Please fill in all fields",
          type: "error",
        });
        return;
      }

      // Send data to API endpoint
      const response = await fetch("/api/report-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          price: reportedPrice,
          location: reportedLocation,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to report price");
      }

      // Show success notification
      setNotification({
        show: true,
        message: "Price reported successfully!",
        type: "success",
      });

      // Reset form and close modal
      setReportedPrice("");
      setReportedLocation("");
      setReportModalOpen(false);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error reporting price:", error);
      setNotification({
        show: true,
        message: "Failed to report price. Please try again.",
        type: "error",
      });
    }
  };

  const totalPages = Math.ceil(relatedProducts.length / 4);

  const handleNext = () => {
    setDirection(1);
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setDirection(-1);
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // const visibleProducts = relatedProducts.slice(
  //   page * productsPerPage,
  //   (page + 1) * productsPerPage,
  // );

  if (!product) {
    return (
      <Container size="md" py="xl">
        <Text>Product not found</Text>
        <Link href="/products">
          <Button leftSection={<IconArrowBack size={14} />} mt="md">
            Back to Products
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Container size="xl" py="xl">
        {/* Notification for success/error messages */}
        {notification.show && (
          <div className="mb-4">
            <Notification
              icon={
                notification.type === "success" ? (
                  <IconCheck size={18} />
                ) : (
                  <IconX size={18} />
                )
              }
              color={notification.type === "success" ? "teal" : "red"}
              title={notification.type === "success" ? "Success" : "Error"}
              onClose={() =>
                setNotification({ show: false, message: "", type: "" })
              }
            >
              {notification.message}
            </Notification>
          </div>
        )}
        <Group mb="xl" className="flex items-center justify-between">
          <Title order={1}>{product.productname}</Title>
          <Button
            leftSection={<IconReportMoney size={18} />}
            onClick={() => setReportModalOpen(true)}
            variant="light"
          >
            Report Price
          </Button>
        </Group>
        {/*creates a new tabs one to view products, the other to scan QR code*/}
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-8">
          <Tabs.List>
            <Tabs.Tab
              value="details"
              leftSection={<IconInfoCircle size="0.8rem" />}
            >
              Product Details
            </Tabs.Tab>
            <Tabs.Tab
              value="price-comparison"
              leftSection={<IconQrcode size="0.8rem" />}
            >
              Price Comparison
            </Tabs.Tab>
            <Tabs.Tab value="qrcode" leftSection={<IconQrcode size="0.8rem" />}>
              QR Code
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {activeTab === "details" && (
          /* Main product section - 3 column layout on large screens */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left column - Product image */}
            <div className="flex justify-center items-start">
              <motion.div
                // TODO reenable other animations, see: 246ebace-15c1-4afe-af3e-c37fc3c9267e
                // layoutId={`product-image-${id}`}
                layout="preserve-aspect"
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1 }}
                // transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.1,
                }}
                className="w-full max-w-md"
              >
                <Image
                  src={product.images[0]?.image_url || "/placeholder.svg"}
                  alt={product.productname}
                  width={400}
                  height={400}
                  className="w-full aspect-square object-contain rounded-md"
                />
              </motion.div>
            </div>

            {/* Middle column - Product details */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.1,
                }}
              >
                <Accordion defaultValue="description">
                  <Accordion.Item value="description">
                    <Accordion.Control>Product Description</Accordion.Control>
                    <Accordion.Panel>
                      <Text>
                        {product.productname} is a fresh produce item available
                        at various grocery stores.
                        {/* TODO: @codyduong use description This product is priced{" "}
                        {product.admonition
                          ? `by ${product.admonition.toLowerCase()}`
                          : "individually"}
                        . Compare prices across different stores to find the
                        best deal. */}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item value="nutrition">
                    <Accordion.Control>Nutrition Information</Accordion.Control>
                    <Accordion.Panel>
                      <Text>
                        Nutrition information for {product.productname} varies
                        by size and weight. Please check the product packaging
                        for specific nutritional details. Generally, fresh
                        produce is a healthy choice rich in vitamins and
                        minerals.
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </motion.div>
            </div>

            {/* Right column - Pricing information */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.1,
                }}
                className="border rounded-md p-4"
              >
                <Title order={3} mb="md">
                  Price Comparison
                </Title>

                <div className="space-y-4">
                  {oldProduct.otherPrices &&
                    Object.entries(oldProduct.otherPrices).map(
                      ([store, details]) => (
                        <div
                          key={store}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <Text size="lg" fw={600}>
                            {store}
                          </Text>
                          <div className="text-right">
                            {details.price ? (
                              <Text size="lg" c="blue" fw={700}>
                                ${details.price.toFixed(2)}
                              </Text>
                            ) : (
                              <Text c="dimmed">Price unavailable</Text>
                            )}
                            {details.weightPrice && (
                              <Text size="sm" c="dimmed">
                                {details.weightPrice}
                              </Text>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                </div>

                <div className="pt-4">
                  <Text fw={500} mb="xs">
                    Current Best Price:
                  </Text>
                  <Group className="flex-row flex-nowrap justify-between">
                    <Text size="xl" fw={700} c="blue">
                      ${oldProduct.price.toFixed(2)}
                    </Text>
                    <Text c="dimmed">{oldProduct.weightPrice}</Text>
                  </Group>
                  {oldProduct.priceAdmonition && (
                    <Text size="sm" c="dimmed" mt="xs">
                      {oldProduct.priceAdmonition}
                    </Text>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === "price-comparison" && <PriceComparisonReport embedded />}

        {activeTab === "qrcode" && (
          /* QR Code tab content */
          <div className="mb-12">
            <QRCodeGenerator
              productId={product.gtin}
              productName={product.productname}
              baseUrl="localhost:3000"
            />
          </div>
        )}

        {/* Related products section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.2,
          }}
          className="mt-12"
        >
          <Title order={2} mb="lg">
            Related Products
          </Title>

          <div className="relative">
            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              disabled={page === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md disabled:opacity-50"
              aria-label="Previous products"
            >
              <IconChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              disabled={(page + 1) * productsPerPage >= relatedProducts.length}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md disabled:opacity-50"
              aria-label="Next products"
            >
              <IconChevronRight size={24} />
            </button>

            {/* Products carousel */}
            {/* <div className="overflow-hidden mx-12 px-4 relative">
              <AnimatePresence initial={false} custom="direction">
                <motion.div
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-row flex-nowrap gap-4 py-2"
                >
                  {visibleProducts.map((product) => (
                    <motion.div
                      className="flex-grow flex-shrink basis-0 max-w-[calc(25%-1rem)]"
                      key={product.id}
                      custom={direction}
                      variants={{
                        enter: (direction: number) => ({
                          x: direction > 0 ? "100%" : "-100%",
                          opacity: 0,
                        }),
                        center: { x: 0, opacity: 1 },
                        exit: (direction: number) => ({
                          x: direction > 0 ? "100%" : "-100%",
                          opacity: 0,
                        }),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        bounce: 0,
                      }}
                    >
                      <ProductCard product={product} isInCarousel={true} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div> */}

            {/* Pagination indicators */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`w-2 h-2 rounded-full ${page === idx ? "bg-blue-500" : "bg-gray-300"}`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Price Reporting Modal */}
      <Modal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={`Report Price for ${product.productname}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Text size="sm" mb={4}>
              Price
            </Text>
            <NumberInput
              value={reportedPrice}
              // @ts-expect-error: todo fix -codyduong
              onChange={(val) => setReportedPrice(val)}
              placeholder="Enter price"
              leftSection={<IconCoin size={16} />}
              decimalScale={2}
              min={0}
              required
            />
          </div>

          <div>
            <Text size="sm" mb={4}>
              Store
            </Text>
            <Select
              value={reportedLocation}
              onChange={(val) => val && setReportedLocation(val)}
              placeholder="Select store location"
              leftSection={<IconMapPin size={16} />}
              data={[
                { value: "walmart", label: "Walmart" },
                { value: "target", label: "Target" },
                { value: "dillons", label: "Dillons" },
                { value: "other", label: "Other Location" },
              ]}
              required
            />
          </div>

          <Group mt="md">
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePriceReport}>Submit</Button>
          </Group>
        </div>
      </Modal>
    </motion.div>
  );
}
