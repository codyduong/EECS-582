/*
 *  Page at "/products"
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @haydenmroy10 - initial creation of website
 */

"use client"

import { Card, Image, Text, Button, Group } from "@mantine/core"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
}

export function ProductCard({ id, name, price, image }: ProductCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    router.push(`/product/${id}`)
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 ${isHovered ? "shadow-lg transform scale-[1.02]" : ""}`}
      style={{
        borderWidth: "2px",
        borderColor: isHovered ? "#228be6" : "#e9ecef",
        width: "300px",
        height: "380px", // Increased height from 300px to 380px
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Section className="border-b">
        <Image src={image || "/placeholder.svg"} height={80} alt={name} fit="contain" className="py-2" />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{name}</Text>
        <Text weight={700} color="blue">
          ${price.toFixed(2)}
        </Text>
      </Group>

      <div className="flex-grow"></div>

      <Button color="blue" fullWidth mt="md" radius="md" className={isHovered ? "bg-blue-600" : ""}>
        View Details
      </Button>
    </Card>
  )
}

