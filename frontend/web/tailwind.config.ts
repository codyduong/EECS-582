/*
 * Tailwind CSS Configuration
 *
 * This configuration extends the default Tailwind setup to work seamlessly with
 * Mantine and shadcn/ui components. It includes:
 *
 * - Custom color palette using CSS variables for easy theming
 * - Extended border radius settings
 * - Content paths for proper purging of unused styles
 * - Disabled preflight to avoid conflicts with Mantine's reset
 *
 * The configuration ensures that Tailwind utilities can be used alongside
 * Mantine components without style conflicts.
 *
 * Authors: @codyduong @ehnuJ
 * Date Created: 2025-02-20
 * Revision History:
 *  -2025-02-26 - @ehnuJ - updated Tailwind setup
 */

import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--foreground))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} as const satisfies Config;

export default config;
