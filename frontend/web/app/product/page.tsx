"use client"

import { useState } from "react"
import {
  Container,
  TextInput,
  Title,
  Group,
  Modal,
  Button,
  NumberInput,
  Select,
  Text,
  Notification,
} from "@mantine/core"
import { ProductCard } from "@/components/ProductCard"
import { IconSearch, IconMapPin, IconCoin, IconCheck, IconX } from "@tabler/icons-react"
import { products } from "@/productsmock" // Import from root level

export default function ProductsPage() {
  // State for the price reporting modal
  const [opened, setOpened] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // Function to open the modal with the selected product
  const handleOpenModal = (product) => {
    setSelectedProduct(product)
    setOpened(true)
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!price || !location) {
        setNotification({
          show: true,
          message: "Please fill in all fields",
          type: "error",
        })
        return
      }

      // Send data to API endpoint
      const response = await fetch("/api/report-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          price,
          location,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to report price")
      }

      // Show success notification
      setNotification({
        show: true,
        message: "Price reported successfully!",
        type: "success",
      })

      // Reset form and close modal
      setPrice("")
      setLocation("")
      setOpened(false)

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" })
      }, 3000)
    } catch (error) {
      console.error("Error reporting price:", error)
      setNotification({
        show: true,
        message: "Failed to report price. Please try again.",
        type: "error",
      })
    }
  }

  return (
    // Container component to center content and add horizontal padding
    <Container size="xl" py="xl">
      {/* Page title with bottom margin and center alignment */}
      <Title order={1} mb="lg">
        Grocery Products
      </Title>

      {/* Group component to center the search input */}
      <Group mb="xl">
        {/* Search input with placeholder text and icon */}
        <TextInput
          placeholder="Search products..."
          leftSection={<IconSearch size={14} />}
          className="w-full max-w-lg"
        />
      </Group>

      {/* Notification for success/error messages */}
      {notification.show && (
        <div className="mb-4">
          <Notification
            icon={notification.type === "success" ? <IconCheck size={18} /> : <IconX size={18} />}
            color={notification.type === "success" ? "teal" : "red"}
            title={notification.type === "success" ? "Success" : "Error"}
            onClose={() => setNotification({ show: false, message: "", type: "" })}
          >
            {notification.message}
          </Notification>
        </div>
      )}

      {/* Grid layout instead of flex for more precise control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {/* Map through the products array to create a card for each product */}
        {products.map((product) => (
          // Each card is in its own grid cell with plenty of spacing
          <div key={product.id} className="flex justify-center">
            <ProductCard product={product} inMain onReportPrice={() => handleOpenModal(product)} />
          </div>
        ))}
      </div>

      {/* Modal for reporting prices */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selectedProduct ? `Report Price for ${selectedProduct.name}` : "Report Price"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Text size="sm" weight={500} mb={4}>
              Price
            </Text>
            <NumberInput
              value={price}
              onChange={(val) => setPrice(val)}
              placeholder="Enter price"
              leftSection={<IconCoin size={16} />}
              precision={2}
              min={0}
              required
            />
          </div>

          <div>
            <Text size="sm" weight={500} mb={4}>
              Location
            </Text>
            <Select
              value={location}
              onChange={(val) => setLocation(val)}
              placeholder="Select store location"
              leftSection={<IconMapPin size={16} />}
              data={[
                { value: "walmart", label: "Walmart",
                { value: "target", label: "Target" },
                { value: "dillons", label: "Dillons" },
                { value: "other", label: "Other Location" },
              ]}
              required
            />
          </div>

          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </Group>
        </div>
      </Modal>
    </Container>
  )
}

