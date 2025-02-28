/*
 *  Page at "/products"
 *
 *  Authors: @haydenmroy10
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @haydenmroy10 - initial creation of website
 */
 
// Import UI components from Mantine
import { Container, TextInput, Title, Group } from "@mantine/core"
// Import the ProductCard component
import { ProductCard } from "@/components/ProductCard"
// Import the Search icon from Lucide
import { Search } from "lucide-react"

// Mock data array for grocery products
const products = [
  // Each product object contains id, name, price, and image URL
  { id: "1", name: "Organic Bananas (1 lb)", price: 0.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "2", name: "Whole Milk (1 gallon)", price: 3.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "3", name: "Fresh Eggs (dozen)", price: 4.49, image: "/placeholder.svg?height=80&width=160" },
  { id: "4", name: "Whole Wheat Bread", price: 2.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "5", name: "Ground Beef (1 lb)", price: 5.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "6", name: "Fresh Spinach (10 oz)", price: 3.49, image: "/placeholder.svg?height=80&width=160" },
  { id: "7", name: "Greek Yogurt (32 oz)", price: 4.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "8", name: "Red Apples (1 lb)", price: 1.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "9", name: "Chicken Breast (1 lb)", price: 6.99, image: "/placeholder.svg?height=80&width=160" },
  { id: "10", name: "Orange Juice (64 oz)", price: 4.29, image: "/placeholder.svg?height=80&width=160" },
  { id: "11", name: "Cheddar Cheese (8 oz)", price: 3.79, image: "/placeholder.svg?height=80&width=160" },
  { id: "12", name: "Russet Potatoes (5 lb)", price: 4.99, image: "/placeholder.svg?height=80&width=160" },
]

// Define the main Products page component
export default function ProductsPage() {
  // Return the JSX for the page
  return (
    // Container component to center content and add horizontal padding
    <Container size="xl" py="xl">
      {/* Page title with bottom margin and center alignment */}
      <Title order={1} mb="lg" align="center">
        Grocery Products
      </Title>

      {/* Group component to center the search input */}
      <Group position="center" mb="xl">
        {/* Search input with placeholder text and icon */}
        <TextInput
          placeholder="Search products..." // Placeholder text
          icon={<Search size={14} />} // Search icon
          style={{ width: "100%", maxWidth: "500px", marginLeft: "80px" }} // Added marginLeft of 80px
        />
      </Group>

      {/* Grid layout instead of flex for more precise control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16 p-6">
        {/* Map through the products array to create a card for each product */}
        {products.map((product) => (
          // Each card is in its own grid cell with plenty of spacing
          <div key={product.id} className="flex justify-center">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </Container>
  )
}

