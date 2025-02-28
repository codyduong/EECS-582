/*
 *  Page at "/products"
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @haydenmroy10 - initial creation of website
 */

"use client";

import { Card, Image, Text, Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function ProductCard({ id, name, price, image }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push(`/product/${id}`);
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 ${isHovered ? "shadow-lg transform scale-[1.02]" : ""} w-full`}
      style={{
        borderColor: isHovered ? "#228be6" : "#e9ecef",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Section className="border-b flex-grow w">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fit="contain"
          className="py-2"
        />
      </Card.Section>

      <Group mt="md" mb="xs" className="flex-row flex-nowrap">
        <Text className="text-nowrap text-ellipsis max-w-[80%] overflow-hidden">
          {name}
        </Text>
        <Text c="blue">${price.toFixed(2)}</Text>
      </Group>

      <Button
        color="blue"
        fullWidth
        mt="md"
        radius="md"
        className={isHovered ? "bg-blue-600" : ""}
      >
        View Details
      </Button>
    </Card>
  );
}
