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
 */

import { useState } from "react";
import { Container, Title, Group, Text, Accordion, Tabs } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconQrcode, IconInfoCircle } from "@tabler/icons-react";
import { ProductCard } from "@/components/ProductCard";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import Image from "next/image";
import { useParams } from "next/navigation";
import { products } from "@/app/productsmock";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Find the current product
  const product = products.find((p) => p.id === id);

  // Get related products (excluding current product)
  const relatedProducts = products.filter((p) => p.id !== id);

  const [page, setPage] = useState(0);
  // todo don't make this constant
  const [productsPerPage, _setProductsPerPage] = useState(4);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  // broken
  // useEffect(() => {
  //   // Determine how many products to show based on screen size
  //   const handleResize = () => {
  //     const width = window.innerWidth;
  //     let count = 1;

  //     if (width >= 1280) count = 4;
  //     else if (width >= 1024) count = 3;
  //     else if (width >= 768) count = 2;

  //     const startIdx = currentIndex;
  //     const endIdx = Math.min(startIdx + count, relatedProducts.length);
  //     setVisibleProducts(relatedProducts.slice(startIdx, endIdx));
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [currentIndex, relatedProducts]);

  const totalPages = Math.ceil(relatedProducts.length / 4);

  const handleNext = () => {
    setDirection(1);
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setDirection(-1);
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleProducts = relatedProducts.slice(
    page * productsPerPage,
    (page + 1) * productsPerPage,
  );

  if (!product) {
    return <Container size="xl">Product not found</Container>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Container size="xl" py="xl">
        <Group mb="xl" className="flex items-center">
          <Title order={1}>{product.name}</Title>
        </Group>
        {/*creates a new tabs one to view products, the other to scan QR code*/}
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-8">
          <Tabs.List>
            <Tabs.Tab value="details" icon={<IconInfoCircle size="0.8rem" />}>
              Product Details
            </Tabs.Tab>
            <Tabs.Tab value="qrcode" icon={<IconQrcode size="0.8rem" />}>
              Price Comparison
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {activeTab === "details" ? (
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
                src={product.image || "/placeholder.svg"}
                alt={product.name}
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
                      {product.name} is a fresh produce item available at
                      various grocery stores. This product is priced{" "}
                      {product.admonition
                        ? `by ${product.admonition.toLowerCase()}`
                        : "individually"}
                      . Compare prices across different stores to find the best
                      deal.
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="nutrition">
                  <Accordion.Control>Nutrition Information</Accordion.Control>
                  <Accordion.Panel>
                    <Text>
                      Nutrition information for {product.name} varies by size
                      and weight. Please check the product packaging for
                      specific nutritional details. Generally, fresh produce is
                      a healthy choice rich in vitamins and minerals.
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
                {product.otherPrices &&
                  Object.entries(product.otherPrices).map(
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
                    ${product.price.toFixed(2)}
                  </Text>
                  <Text c="dimmed">{product.weightPrice}</Text>
                </Group>
                {product.priceAdmonition && (
                  <Text size="sm" c="dimmed" mt="xs">
                    {product.priceAdmonition}
                  </Text>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        ) : (
          /* QR Code tab content */
          <div className="mb-12">
            <QRCodeGenerator productId={product.id} productName={product.name} baseUrl="localhost:3000" />
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
            <div className="overflow-hidden mx-12 px-4 relative">
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
            </div>

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
    </motion.div>
  );
}
