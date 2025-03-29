/*
 *  Utility functions for handling jsonwebtokens
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @codyduong - initial creation, improve authentication flow
 *  - 2025-02-26 - @codyduong - make username nullable
 *  - 2025-02-27 - @codyduong - improve jwt effect pipes
 */

import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Effect, pipe, Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { decode } from "jsonwebtoken";
import { AUTH_URL } from "./consts";

// THIS SHOULD ALWAYS MATCH THE backend/auth `Permission` enum
const PermissionSchema = Schema.Union(
  Schema.Literal("create:all"),
  Schema.Literal("read:all"),
  Schema.Literal("update:all"),
  Schema.Literal("delete:all"),

  Schema.Literal("create:marketplace"),
  Schema.Literal("read:marketplace"),
  Schema.Literal("update:marketplace"),
  Schema.Literal("delete:marketplace"),

  Schema.Literal("create:price_report"),
  Schema.Literal("read:price_report"),
  Schema.Literal("update:price_report"),
  Schema.Literal("delete:price_report"),

  Schema.Literal("create:product"),
  Schema.Literal("read:product"),
  Schema.Literal("update:product"),
  Schema.Literal("delete:product"),
);

export type Permission = typeof PermissionSchema.Type;

export const JWTHeadersSchema = Schema.Struct({
  authorization: Schema.String,
  "x-refresh-token": Schema.UndefinedOr(Schema.String),
});

export type JWTHeaders = typeof JWTHeadersSchema.Type;

// THIS SHOULD ALWAYS MATCH THE backend/auth `Claims` struct
const AccessClaimSchema = Schema.Struct({
  aud: Schema.NullOr(Schema.String), // Audience
  exp: Schema.Number, // Expiration (as UTC Timestamp)
  iat: Schema.Number, // Issued at (as UTC Timestamp)
  iss: Schema.String, // Issuer
  nbf: Schema.Number, // Not before
  sub: Schema.Number, // Subject (user id)

  // Custom claims
  permissions: Schema.Array(PermissionSchema),
  email: Schema.String,
  username: Schema.NullOr(Schema.String),
});

export type AccessClaim = typeof AccessClaimSchema.Type;

export type TokenAndAccessClaim = readonly [token: string, claim: AccessClaim];

const RefreshClaimSchema = Schema.Struct({
  aud: Schema.NullOr(Schema.String), // Audience
  exp: Schema.Number, // Expiration (as UTC Timestamp)
  iat: Schema.Number, // Issued at (as UTC Timestamp)
  iss: Schema.String, // Issuer
  nbf: Schema.Number, // Not before
  sub: Schema.Number, // Subject (user id)

  // Custom claims
  permissions: Schema.Array(PermissionSchema),
});

export type RefreshClaim = typeof RefreshClaimSchema.Type;

export type TokenAndRefreshClaim = readonly [
  token: string,
  claim: RefreshClaim,
];

/**
 * Decodes the token into the claim provided by our JWT.
 * @param {string} token
 * @returns {Effect.Effect<Claims, Error>} Either the claim or an error for you to handle
 */
export function decodeAccessToken(
  token: string,
): Effect.Effect<TokenAndAccessClaim, ParseError> {
  const tokenCleaned = token.replace(/Bearer\w*/i, "").trim();
  const maybeClaims = decode(tokenCleaned);

  return Schema.decodeUnknown(AccessClaimSchema)(maybeClaims).pipe(
    Effect.map((r) => [`Bearer ${tokenCleaned}`, r] as const),
  );
}

export function decodeAccessClaimFromRequest<E = never, R = never>(
  clientResponse: HttpClientResponse.HttpClientResponse,
): Effect.Effect<TokenAndAccessClaim, ParseError | E, R> {
  return pipe(
    Effect.succeed(clientResponse),
    Effect.flatMap(HttpClientResponse.schemaHeaders(JWTHeadersSchema)),
    Effect.flatMap(({ authorization }) => decodeAccessToken(authorization)),
  );
}

export function decodeRefreshToken(
  token: string,
): Effect.Effect<TokenAndRefreshClaim, ParseError> {
  const tokenCleaned = token.replace(/Bearer\w*/i, "").trim();
  const maybeClaims = decode(tokenCleaned);

  return Schema.decodeUnknown(RefreshClaimSchema)(maybeClaims).pipe(
    Effect.map((r) => [tokenCleaned, r] as const),
  );
}

export function decodeRefreshClaimFromRequest<E = never, R = never>(
  clientResponse: HttpClientResponse.HttpClientResponse,
): Effect.Effect<TokenAndRefreshClaim, ParseError | E, R> {
  return pipe(
    Effect.succeed(clientResponse),
    Effect.flatMap(HttpClientResponse.schemaHeaders(JWTHeadersSchema)),
    Effect.flatMap(({ authorization }) => decodeRefreshToken(authorization)),
  );
}

/**
 * Run this effect before any network call that requires an `Authorization` header.
 * We need to pre-empt the call, if we have passed the expiry we can already.
 *
 * Succeeds with a new token
 * Fails if we couldn't get a refresh token
 */
// todo implement
// const isTokenExpired = (token: string) =>
//   pipe(
//     decodeToken(token),
//     Effect.map(({ exp }) => {
//       const now = Math.floor(Date.now() / 1000); // Current time in seconds
//       return exp <= now; // Token is expired if exp <= now
//     }),
//     Effect.catchAll(() => Effect.succeed(true)), // Assume token is invalid if decoding fails
//   );

/**
 * TODO: @codyduong, im not particulary familiar with pipe/monad injection within effect-ts,
 * but im sure theres a way we can have this retry a request without explictly saying so.
 *
 * Run this effect after any network call that requires an `Authorization` header.
 * Sometimes, we may not know a token has been revoked without checking the authorization service,
 * So this expressly handles 401 Unauthorized errors.
 *
 * Succeeds if we don't need to get a refresh token
 * Fails if we couldn't get a refresh token
 */
export function postAuth(
  clientResponse: HttpClientResponse.HttpClientResponse,
): Effect.Effect<HttpClientResponse.HttpClientResponse, Error> {
  return pipe(
    Effect.succeed(clientResponse),
    Effect.flatMap((res) => {
      if (res.status === 401 || res.status === 403) {
        Effect.gen(function* () {
          const client = yield* HttpClient.HttpClient;

          return yield* HttpClientRequest.post(
            `${AUTH_URL}/api/v1/auth/refresh`,
          ).pipe(
            (h) => Effect.succeed(h),
            Effect.map((h) => {
              // todo, don't pipe in body, pipe in auth headers as well as refresh token.
              // The endpoint should attempt to use the auth headers if still valid (and can grant:tokens)
              // otherwise use refresh (refresh, by its nature has a grant:tokens)
              return pipe(h, HttpClientRequest.setBody(res.request.body));
            }),
            Effect.flatMap(client.execute),
            Effect.flatMap(decodeAccessClaimFromRequest),
            Effect.scoped,
          );
        }).pipe(Effect.provide(FetchHttpClient.layer));
      }
      return Effect.succeed(res);
    }),
  );
}
