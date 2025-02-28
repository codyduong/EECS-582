/*
 * This component is purposefully a server component, DO NOT add "use client" directive.
 * It allows for correct metadata to be sent in SSR
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-27
 *  Revision History:
 *  - 2025-02-27 - @codyduong - create profile page skeleton
 *  - 2025-02-27 - @codyduong - add metadata
 */

import type React from "react";
import { Metadata } from "next";
import ProfileLayoutInner from "./settings/_components/ProfileLayoutInner";

export const metadata: Metadata = {
  title: "Profile | GroceryWise",
  description: "Your profile",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayoutInner>{children}</ProfileLayoutInner>;
}
