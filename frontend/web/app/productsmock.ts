/*
 * A mock data file mimicking products. Should be temporary and eventually deleted
 *
 * Author: @codyduong
 * Reveisions:
 * - 2025-03-01: creation
 * - 2025-03-02: more data possibilites
 */

// Mock data array for grocery products
export const products = [
  {
    id: "100",
    at: "Dillons",
    name: "Honeycrisp Apple",
    price: 1.25,
    priceAdmonition: "each (est.)",
    weightPrice: "$2.49/lb",
    image: "/apple.avif?height=80&width=160",
    admonition: "Cost by weight",
    otherPrices: {
      Dillons: {
        price: 1.25,
        weightPrice: "$2.49/lb",
      },
      Walmart: {
        price: 1.47,
        weightPrice: "$2.79/lb",
      },
      Target: {
        price: 1.59,
        weightPrice: "$3.99/lb",
      },
    },
  },

  {
    id: "1",
    at: "Walmart",
    name: "Banana",
    price: 0.27,
    priceAdmonition: "each (est.)",
    weightPrice: "$0.50/lb",
    image: "/banana.webp?height=80&width=160",
    admonition: "Cost by weight",
    otherPrices: {
      Walmart: {
        price: 0.27,
        weightPrice: "$0.50/lb",
      },
      Target: {
        price: 0.29,
        weightPrice: "$0.69/lb",
      },
      Dillons: {
        price: 0.3,
        weightPrice: "$0.75/lb",
      },
    },
  },

  {
    id: "200",
    at: "Walmart",
    name: "Green Grapes",
    price: 0.33,
    priceAdmonition: "each (est.)",
    weightPrice: "$0.50/lb",
    image: "/green_grapes.webp?height=80&width=160",
    admonition: "Cost by weight",
    otherPrices: {
      Walmart: {
        price: 0.33,
        weightPrice: "$0.52/lb",
      },
      Target: {
        price: undefined,
        weightPrice: undefined,
      },
      Dillons: {
        price: undefined,
        weightPrice: undefined,
      },
    },
  },

  {
    id: "300",
    at: "Walmart",
    name: "Mango",
    price: 2.0,
    priceAdmonition: "each (est.)",
    weightPrice: "$2.00/lb",
    image: "/mango.webp?height=80&width=160",
    admonition: "Cost by weight",
    otherPrices: {
      Dillons: {
        price: 2.0,
        weightPrice: "$2.00/lb",
      },
      Walmart: {
        price: undefined,
        weightPrice: undefined,
      },
      Target: {
        price: undefined,
        weightPrice: undefined,
      },
    },
  },

  {
    id: "3",
    at: "Walmart",
    name: "Fresh Eggs (dozen)",
    price: 4.49,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "4",
    at: "Walmart",
    name: "Whole Wheat Bread",
    price: 2.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "5",
    at: "Walmart",
    name: "Ground Beef (1 lb)",
    price: 5.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "6",
    at: "Walmart",
    name: "Fresh Spinach (10 oz)",
    price: 3.49,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "7",
    at: "Walmart",
    name: "Greek Yogurt (32 oz)",
    price: 4.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "8",
    at: "Walmart",
    name: "Red Apples (1 lb)",
    price: 1.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "9",
    at: "Walmart",
    name: "Chicken Breast (1 lb)",
    price: 6.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "10",
    at: "Walmart",
    name: "Orange Juice (64 oz)",
    price: 4.29,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "11",
    at: "Walmart",
    name: "Cheddar Cheese (8 oz)",
    price: 3.79,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "12",
    at: "Walmart",
    name: "Russet Potatoes (5 lb)",
    price: 4.99,
    weightPrice: "$0.50 / lb",
    image: "/placeholder.svg?height=80&width=160",
  },
];
