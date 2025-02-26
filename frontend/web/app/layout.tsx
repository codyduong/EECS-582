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
 */

import type React from "react";
import type { Metadata } from "next";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { UserButton } from "@/components/UserButton";
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
            <UserButton />
          </header>
          <main className="overflow-hidden flex-grow">{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
