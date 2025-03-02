/*
 *  Component for primary products
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @haydenmroy10 - initial creation of product cards
 *  - 2025-03-01 - @codyduong - imrpove product card and details
 *  - 2025-03-02 - @codyduong - add animation into product specific
 */

"use client";

import { Card, Image, Text, Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCallback } from "react";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  at: string;
  priceAdmonition?: string;
  image: string;
  weightPrice: string;
  admonition?: string;
  otherPrices?: Record<
    string,
    {
      price?: number;
      weightPrice?: string;
    }
  >;
}

interface ProductCardProps {
  product: ProductProps;
  isInCarousel?: boolean;
  inMain?: boolean;
}

export function ProductCard({
  product,
  isInCarousel = false,
  // inMain = false,
}: ProductCardProps) {
  const {
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    at,
    name,
    price,
    priceAdmonition,
    image,
    weightPrice,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    admonition,
    otherPrices,
  } = product;

  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${id}`);
  };

  // dumb aaa name
  const ImageImage = useCallback(
    () => (
      <Image
        src={image || "/placeholder.svg"}
        alt={name}
        fit="contain"
        className="w-full h-full aspect-square text-center justify-center"
      />
    ),
    [image, name],
  );

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      onClick={handleClick}
      className="cursor-pointer transition-all duration-200 w-full border-white hover:border-cyan-400 hover:shadow-lg  hover:scale-[1.02]"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card.Section className="border-b flex-grow">
        {isInCarousel ? (
          <ImageImage />
        ) : (
          <motion.div
            layout="preserve-aspect"
            // this animation is problematic, see: 246ebace-15c1-4afe-af3e-c37fc3c9267e
            // layoutId={`product-image-${id}`}
            // transition={
            //   inMain ? undefined : { type: "spring", bounce: 0.1, damping: 30 }
            // }
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ImageImage />
          </motion.div>
        )}
      </Card.Section>

      <Group mt="md" className="flex-row flex-nowrap justify-between">
        <Group className="flex-row flex-nowrap max-w-[60%] flex-grow flex-shrink gap-2">
          <Text c="blue" className="text-xl font-bold">
            ${price.toFixed(2)}
          </Text>
          {priceAdmonition && (
            <Text c="grey" className="">
              {priceAdmonition}
            </Text>
          )}
        </Group>
        <Text c="gray" className="max-w-[40%]">
          {weightPrice}
        </Text>
      </Group>

      <Group mb="xs" className="flex-row flex-nowrap">
        <Text className="text-nowrap text-ellipsis max-w-[80%] overflow-hidden">
          {name}
        </Text>
      </Group>

      {otherPrices && (
        <Card.Section className="border-t border-b flex-grow flex-col p-4 pt-2 pb-2">
          {Object.entries(otherPrices).map(
            ([place, { price, weightPrice }]) => (
              <Group
                key={place}
                className="flex-row flex-nowrap justify-between"
              >
                <Text className="text-nowrap text-ellipsis max-w-[50%] flex-grow overflow-hidden">
                  {place}
                </Text>
                <Group
                  key={place}
                  className="flex-row flex-nowrap max-w-[50%] flex-grow justify-end"
                >
                  {price && <Text>${price.toFixed(2)}</Text>}
                  <Text c="gray">{weightPrice ?? "Unknown"}</Text>
                </Group>
              </Group>
            ),
          )}
        </Card.Section>
      )}

      <Button
        color="blue"
        fullWidth
        mt="md"
        radius="md"
        className="hover:bg-blue-600"
      >
        View More Details
      </Button>
    </Card>
  );
}
