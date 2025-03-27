import {
  createInlineSigningKeyProvider,
  defineConfig,
  extractFromHeader,
} from "@graphql-hive/gateway";

if (process.env.SECRET_KEY === undefined) {
  throw Error("Failed to find SECRET_KEY, was it set?");
}

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
      location: DOCKER
        ? "http://host.docker.internal:8081/"
        : "http://localhost:8081/",
    },
    Products: {
      location: DOCKER
        ? "http://host.docker.internal:8082/"
        : "http://localhost:8082/",
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
});
