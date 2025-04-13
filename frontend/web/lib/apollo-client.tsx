import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "/api/graphql", // We'll create a proxy API route to handle GraphQL requests
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // authorization: token ? `Bearer ${token}` : "",
      authorization: token ?? "", // for some incomprehensible reason, Bearer is broken in hive
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  // You can add type policies here if needed
  // typePolicies: {
  //   Query: {
  //     fields: {
  //       // Your type policies
  //     }
  //   }
  // }
});