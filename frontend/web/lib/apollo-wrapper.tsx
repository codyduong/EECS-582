"use client";

import { ApolloProvider } from "@apollo/client";
import { type ReactNode, useMemo } from "react";
import { client } from "./apollo-client";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  // We can use the pre-configured client from apollo-client.ts
  // or create a new one here if needed for client-side specific configuration
  const apolloClient = useMemo(() => client, []);

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
