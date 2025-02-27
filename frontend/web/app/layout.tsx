/*
 *  Root Layout Component
 *
 *  This component serves as the main layout wrapper for the entire application.
 *  It includes the following features:
 *  - Sets up the basic HTML structure
 *  - Configures Mantine provider for consistent theming
 *  - Implements a persistent header with logo and user profile button
 *  - Handles metadata for SEO
 *  The layout is shared across all pages, providing a consistent user experience.
 *
 *  Authors: @codyduong @joonhee_ooten
 *  Date Created: 2025-02-19
 *  Revision History:
 *  - 2025-02-05 - @codyduong - initial creation of website
 *  - 2025-02-26 - @ehnuJ - create layout component
 *  - 2025-02-27 - @Tyler51235 - create buttons for product and grocery list
 */

import type React from "react";
import type { Metadata } from "next";
import { 

  ColorSchemeScript, 
  MantineProvider, 
  mantineHtmlProps, 
  TextInput, 
  Button,
} from "@mantine/core";
import { UserButton } from "@/components/UserButton";
import { Search, ShoppingBasketIcon as ShoppingList } from "lucide-react";
import Link from "next/link";
import "@mantine/core/styles.css";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroceryWise",
  description: "Your smart grocery shopping companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex flex-col`}
      >
        <MantineProvider>
          <header className="flex justify-between items-center p-4 bg-white shadow-md">
            <Link href="/" className="text-xl font-bold text-green-600">
              GroceryWise
            </Link>
            <div className="flex items-center gap-4">
              {/* Grocery list button*/}
              <Link href="/grocery-list">
                <Button
                  variant="outline"
                  className="hidden sm:flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                  leftSection={<ShoppingList className="w-4 h-4" />}
                >
                  Grocery List
                </Button>
              </Link>
              {/* Product page button */}
              <Link href ="/product_page">
                <Button
                variant ="outline"
                className = "items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Products
                </Button>
              </Link>
              <UserButton />
            </div>
            
          </header>


          <main className="overflow-hidden flex-grow">{children}</main>
        </MantineProvider>
      </body>
    </html>
  )
}

