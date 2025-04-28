// todo express w/ env variables for prod
export const GRAPHQL_URL =
  process.env.GRAPHQL_URI ?? "http://localhost:4000/graphql";
export const AUTH_URL = process.env.AUTH_URI ?? "http://localhost:8081";
export const PRODUCTS_URL = process.env.PRODUCTS_URI ?? "http://localhost:8082";
