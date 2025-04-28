import {
  createInlineSigningKeyProvider,
  defineConfig,
  extractFromHeader,
} from "@graphql-hive/gateway";
import DataLoader from "dataloader";

if (process.env.SECRET_KEY === undefined) {
  throw Error("Failed to find SECRET_KEY, was it set?");
}

const AUTH_URI = process.env.AUTH_URI;
const PRODUCTS_URI = process.env.PRODUCTS_URI;
const DEBUG = process.env.NODE_ENV !== "production";
const DOCKER = process.env.DOCKER !== undefined;

if (DEBUG) {
  console.debug(`DEBUG STARTUP INFO:
ENV: ${JSON.stringify(process.env, undefined, 4)}`);
  // SECRET KEY: ${process.env.SECRET_KEY }`);
}

export const gatewayConfig = defineConfig({
  healthCheckEndpoint: "/health",
  readinessCheckEndpoint: "/readiness",
  transportEntries: {
    Auth: {
      location:
        AUTH_URI ??
        (DOCKER
          ? "http://host.docker.internal:8081/"
          : "http://localhost:8081/"),
    },
    Products: {
      location:
        PRODUCTS_URI ??
        (DOCKER
          ? "http://host.docker.internal:8082/"
          : "http://localhost:8082/"),
    },
  },
  // https://the-guild.dev/graphql/hive/docs/gateway/authorization-authentication#granular-protection-using-auth-directives-authenticated-requiresscopes-and-policy
  jwt: {
    signingKeyProviders: [
      createInlineSigningKeyProvider(process.env.SECRET_KEY),
      // createRemoteJwksSigningKeyProvider({ jwksUri: 'https://example.com/.well-known/jwks.json' })
    ],
    tokenLookupLocations: [
      extractFromHeader({ name: "authorization", prefix: "Bearer" }),
      // extractFromCookie({ name: 'auth' }),
    ],
    // todo? do we need this
    tokenVerification: {
      // please match with backend/auth -@codyduong
      // CTRL+F: 97f13b61-0eaf-4d0a-9285-df32d3546949
      // issuer: ['auth'],
      algorithms: ["HS256"],
    },
    reject: {
      missingToken: false,
      invalidToken: false,
    },
  },
  genericAuth: {
    mode: "protect-granular",
    resolveUserFn: (ctx) => {
      return ctx.jwt?.payload;
    },
    rejectUnauthenticated: false,
  },
  additionalResolvers: {
    ProductResponse: {
      price_reports: {
        requires: "gtin",
        // resolve: async (root: { gtin: string }, args, context) => {
        resolve: async (root, args, context) => {
          // Initialize DataLoader
          if (!context.priceReportsLoader) {
            context.priceReportsLoader = new DataLoader<string, any>(
              async (gtins) => {
                // console.log(gtins);
                // console.log(JSON.stringify(root, undefined, 2));
                // console.log(JSON.stringify(args, undefined, 2));
                // console.log(JSON.stringify(context, undefined, 2));

                const cookies =
                  context.headers.cookie
                    ?.split(";")
                    .map((v) => v.split("="))
                    .reduce((acc, v) => {
                      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(
                        v[1].trim(),
                      );
                      return acc;
                    }, {}) ?? {};

                const authorization =
                  context.headers["authorization"] ||
                  context.headers["Authorization"] ||
                  cookies["authorization"] ||
                  cookies["Authorization"] ||
                  "";

                const baseUrl =
                  context.Products.rawSource.schema.extensions.directives
                    .transport[0].location;
                const url = new URL("/api/v1/price_report/by-gtins", baseUrl);

                // console.log(url.toString(), JSON.stringify({ gtins }));

                // 2. Dynamically append query params (only if they exist)
                Object.entries(args).forEach(([key, value]) => {
                  if (value !== undefined && value !== null && value !== "") {
                    url.searchParams.append(key, String(value));
                  }
                });

                // Make the batch request manually
                const response = await fetch(url.toString(), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: authorization,
                  },
                  body: JSON.stringify({ gtins }),
                });

                if (!response.ok) {
                  throw new Error(
                    `Price reports batch request failed: ${response.statusText}`,
                  );
                }

                const data = await response.json();

                // console.log(data);

                // Map results back to each GTIN
                return gtins.map(
                  (gtin) =>
                    data[gtin] || {
                      edges: [],
                      page_info: {
                        has_next_page: false,
                        has_prev_page: false,
                      },
                    },
                );
              },
              {
                // Include pagination in cache key
                cacheKeyFn: (gtin) =>
                  JSON.stringify({
                    gtin,
                    ...args,
                  }),
                // eslint-disable-next-line prettier/prettier
              }
            );
          }

          return context.priceReportsLoader.load(root.gtin);
        },
      },
    },
  },
});
