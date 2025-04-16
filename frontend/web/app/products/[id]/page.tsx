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
  Skeleton,
  LoadingOverlay,
  ComboboxItem,
  SelectProps,
  Box,
  NavLink,
  Anchor,
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
  IconShoppingCart,
} from "@tabler/icons-react";
import { ProductCard } from "@/components/ProductCard";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import Image from "next/image";
import { useParams } from "next/navigation";
import { products } from "@/app/productsmock";
import Link from "next/link";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { graphql } from "@/graphql";
import PriceComparisonReport from "./price-comparison/page";
import Markdown from "markdown-to-jsx";
import { notifications } from "@mantine/notifications";
import { useUser } from "@/contexts/UserContext";
import { PermissionValidator } from "@/lib/permissions";

const PRODUCTS_PAGE_QUERIES = graphql(`
  query ProductsPage_Queries($gtin: String!) {
    get_product(gtin: $gtin) {
      gtin
      productname
      images {
        image_url
      }
      description
      price_reports {
        edges {
          node {
            id
            reported_at
            price
            company {
              name
            }
            # marketplace {
            #   id
            #   physical_marketplace {
            #     ... on PhysicalMarketplace {
            #       id
            #       adr_address
            #     }
            #   }
            #   online_marketplace {
            #     ... on OnlineMarketplace {
            #       id
            #     }
            #   }
            # }
          }
        }
      }
    }
    get_companies {
      id
      name
    }
  }
`);

const PRODUCTS_PAGE_MARKETPLACES = graphql(`
  query ProductsPage_Marketplaces($company_id: Int!) {
    get_marketplaces(company_id: $company_id) {
      id
      physical_marketplace {
        ... on PhysicalMarketplace {
          id
          adr_address
          open_location_code
          place_id
        }
      }
      online_marketplace {
        ... on OnlineMarketplace {
          id
        }
      }
    }
  }
`);

const PRICE_REPORT = graphql(`
  mutation ProductsPage_PriceReport(
    $currency: mutationInput_post_price_report_input_items_allOf_0_currency!
    $gtin: mutationInput_post_price_report_input_items_allOf_0_gtin!
    $marketplace_id: Int!
    $price: Float!
  ) {
    post_price_report(
      input: {
        currency: $currency
        gtin: $gtin
        price: $price
        marketplace_id: $marketplace_id
      }
    )
  }
`);

const SHOPPING_LIST = graphql(`
  query ProductsPage_ShoppingLists {
    get_shopping_lists {
      lists {
        list {
          id
          name
        }
        users {
          shopping_list_id
        }
      }
    }
  }
`);

// const CREATE_SHOPPING_LIST = graphql(``);

// const PATCH_SHOPPING_LIST = graphql(`
//   # 5 is count
//   mutation MyMutation(
//     $id: Int!
//     $amount: Float!
//     $gtin: String!
//     $user_ids: [Int]!
//     $unit_id: Int = 5
//   ) {
//     patch_shopping_list(
//       id: $id
//       input: { items: { amount: $amount, gtin: $gtin, unit_id: }, user_ids: $user_ids }
//     ) {
//       items {
//         gtin
//       }
//       list {
//         id
//       }
//     }
//   }
// `);

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();

  const canReportPrice = user?.permissions
    ? PermissionValidator.new()
        .or("create:all", "create:price_report")
        .validate(user.permissions)
    : false;

  const { data, loading } = useQuery(PRODUCTS_PAGE_QUERIES, {
    variables: {
      gtin: id,
    },
  });
  const { data: shoppingListData } = useQuery(SHOPPING_LIST, { skip: !user });

  const [
    getMarketplaces,
    { data: marketplaceData, loading: marketplaceLoading },
  ] = useLazyQuery(PRODUCTS_PAGE_MARKETPLACES);

  const [priceReport, {}] = useMutation(PRICE_REPORT, {
    refetchQueries: ["ProductsPage_Queries"],
  });

  const product = data?.get_product;
  const prices =
    product?.price_reports.edges?.filter((i) => !!i).map(({ node }) => node) ??
    [];
  const companies =
    data?.get_companies
      ?.filter((i) => !!i)
      .map((i): ComboboxItem => ({ value: `${i.id}`, label: i.name })) ?? [];
  const marketplaces = marketplaceData?.get_marketplaces
    ?.filter((i) => !!i)
    .map(
      (i): ComboboxItem => ({
        value: `${i.id}`,
        // @ts-expect-error: yada void container
        // eslint-disable-next-line prettier/prettier
        label: i.physical_marketplace?.adr_address ?? i.online_marketplace?.uri ?? null,
      }),
    )
    .filter((i) => i.value !== null);

  const shoppingLists =
    shoppingListData?.get_shopping_lists?.lists.filter((i) => !!i) ?? [];
  const shoppingListValues = [
    ...shoppingLists.map(
      (list): ComboboxItem => ({
        label: list.list.name ?? `Shopping List ${list.list.id}`,
        value: `${list.list.id}`,
      }),
    ),
    {
      label: "New Shopping List",
      value: `${-1}`,
    },
  ];

  // Get related products (excluding current product)
  const relatedProducts = products.filter((p) => p.id !== id);

  const [page, setPage] = useState(0);
  // todo don't make this constant
  const [productsPerPage, _setProductsPerPage] = useState(4);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  // Price reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedPrice, setReportedPrice] = useState<number>();
  const [reportedCompanyId, setReportedCompanyId] = useState<
    `${number}` | null
  >(null);
  const [reportedMarketplaceId, setReportedMarketplaceId] = useState<
    `${number}` | null
  >(null);
  const [selectedShoppingList, setSelectedShoppingList] = useState<
    `${number}` | null
  >(null);

  const handleChangeCompany: SelectProps["onChange"] = (value) => {
    if (reportedCompanyId !== value) {
      setReportedMarketplaceId(null);
    }

    setReportedCompanyId(value as `${number}`);
    if (value) {
      getMarketplaces({
        variables: {
          company_id: Number(value),
        },
      });
    }
  };

  // Function to handle price report submission
  const handlePriceReport = async () => {
    try {
      // Validate inputs
      if (!reportedPrice || !reportedCompanyId || !reportedMarketplaceId) {
        notifications.show({
          title: "Product added",
          message: `Please fill in all fields`,
          color: "red",
          icon: <IconCheck size={16} />,
        });
        return;
      }

      const marketplace_id = Number(reportedMarketplaceId);

      if (Number.isNaN(marketplace_id)) {
        throw false;
      }

      const result = await priceReport({
        variables: {
          currency: "USD",
          gtin: id,
          price: reportedPrice,
          marketplace_id,
        },
      });

      if (result.errors) {
        throw new Error("Failed to report price");
      }

      // Show success notification
      notifications.show({
        title: "Product added",
        message: `Price of ${reportedPrice} reported at ${marketplaces?.find((m) => m.value === `${marketplace_id}`)?.label}`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      // Reset form and close modal
      setReportedPrice(undefined);
      setReportedCompanyId(null);
      setReportedMarketplaceId(null);
      setReportModalOpen(false);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to add product. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
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

  if (!product && !loading) {
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
        {/* {notification.show && (
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
        )} */}
        <Group mb="xl" className="flex items-center justify-between">
          {product && <Title order={1}>{product.productname}</Title>}
          {loading && <Skeleton height={"44.2px"} width={"80%"} />}
          {/* only authenticated users allowed to report prices */}
          {canReportPrice && (
            <Button
              leftSection={<IconReportMoney size={18} />}
              onClick={() => setReportModalOpen(true)}
              variant="light"
            >
              Report Price
            </Button>
          )}
        </Group>
        {/*creates a new tabs one to view products, the other to scan QR code*/}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          className="mb-8 relative"
        >
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            // hack to make invisible spinner
            loaderProps={{ color: "rgba(0,0,0,0)" }}
          />
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
                {product && (
                  <Image
                    src={product.images[0]?.image_url || "/placeholder.svg"}
                    alt={product.productname}
                    width={400}
                    height={400}
                    className="w-full aspect-square object-contain rounded-md"
                  />
                )}
                {loading && <Skeleton width={400} height={400} />}
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
                  {product && (
                    <>
                      <Accordion.Item value="description">
                        <Accordion.Control>
                          Product Description
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Markdown>
                            {product?.description ??
                              `There is no product description available for ${product?.productname}`}
                          </Markdown>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item value="nutrition">
                        <Accordion.Control>
                          Nutrition Information
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Text>
                            View{" "}
                            <Anchor
                              href={`https://world.openfoodfacts.org/product/${id}/`}
                              rel="noopener noreferrer"
                            >
                              OpenFoodFacts
                            </Anchor>
                          </Text>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </>
                  )}
                  {loading && (
                    <>
                      <Accordion.Item value="description">
                        <Accordion.Control>
                          <Skeleton width="10em" height="16px" />
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Skeleton
                            width="100%"
                            height="75px"
                            className="mb-2"
                          />
                          <Skeleton
                            width="100%"
                            height="75px"
                            className="mb-2"
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item value="nutrition">
                        <Accordion.Control>
                          <Skeleton width="10em" height="16px" />
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Skeleton
                            width="100%"
                            height="75px"
                            className="mb-2"
                          />
                          <Skeleton
                            width="100%"
                            height="75px"
                            className="mb-2"
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </>
                  )}
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
                  Price Reports (last 30 days)
                </Title>

                <div className="space-y-4">
                  {prices.slice(0, 3).map((report) => (
                    <div key={report.id} className="border-b pb-2">
                      <div className="flex justify-between items-center ">
                        <Text size="lg" fw={600}>
                          {report.company.name}
                        </Text>
                        <div className="text-right">
                          {report.price ? (
                            <Text size="lg" c="blue" fw={700}>
                              ${report.price.toFixed(2)}
                            </Text>
                          ) : (
                            <Text c="dimmed">Price unavailable</Text>
                          )}
                        </div>
                      </div>
                      <Text size="md">
                        {new Date(report.reported_at).toLocaleString("en-US")}
                      </Text>
                    </div>
                  ))}
                </div>

                {user && (
                  <div className="space-y-4 mt-4">
                    <Group mt={"md"} justify="center" align="end">
                      <Select
                        label="Shopping List"
                        placeholder="Select a shopping list"
                        data={shoppingListValues}
                        // @ts-expect-error: yada
                        onChange={setSelectedShoppingList}
                      />
                      <Button
                        leftSection={<IconShoppingCart size={16} />}
                        color="blue"
                        disabled={!selectedShoppingList}
                      >
                        Add
                      </Button>
                    </Group>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === "price-comparison" && <PriceComparisonReport embedded />}

        {activeTab === "qrcode" && product && (
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
        title={`Report Price for ${product?.productname}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Text size="sm" mb={4}>
              Price
            </Text>
            <NumberInput
              value={reportedPrice}
              onChange={(val) => {
                const coerced = Number(val);
                if (!Number.isNaN(coerced)) {
                  setReportedPrice(coerced);
                }
              }}
              placeholder="Enter price"
              leftSection={<IconCoin size={16} />}
              decimalScale={2}
              fixedDecimalScale
              min={0}
              required
            />
          </div>

          <div>
            <Text size="sm" mb={4}>
              Company
            </Text>
            <Select
              value={reportedCompanyId}
              onChange={handleChangeCompany}
              placeholder="Select company"
              leftSection={<IconMapPin size={16} />}
              data={companies}
              required
            />
          </div>

          <div>
            <Text size="sm" mb={4}>
              Location
            </Text>
            <Box pos="relative">
              <LoadingOverlay visible={marketplaceLoading} zIndex={1000} />
              <Select
                disabled={reportedCompanyId === null}
                value={reportedMarketplaceId}
                onChange={(v) =>
                  v && setReportedMarketplaceId(v as `${number}`)
                }
                placeholder="Select location"
                leftSection={<IconMapPin size={16} />}
                data={marketplaces}
                required
              />
            </Box>
          </div>

          <Group mt="md">
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handlePriceReport}>
              Submit
            </Button>
          </Group>
        </div>
      </Modal>
    </motion.div>
  );
}
