/*
 *  Utility functions for handling jsonwebtokens
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-05 - @codyduong - initial creation, improve authentication flow
 */

import { Effect, Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { decode } from "jsonwebtoken";

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

// THIS SHOULD ALWAYS MATCH THE backend/auth `Claims` struct
const ClaimSchema = Schema.Struct({
  sub: Schema.Number, // subject: user id
  exp: Schema.Number, // expiration time
  permissions: Schema.Array(PermissionSchema),
  email: Schema.String,
  username: Schema.String,
});

export type Claim = typeof ClaimSchema.Type;

/**
 * Decodes the token into the claim provided by our JWT.
 * @param {string} token
 * @returns {Effect.Effect<Claims, Error>} Either the claim or an error for you to handle
 */
export function getClaim(token: string): Effect.Effect<Claim, ParseError> {
  const maybeClaims = decode(token);

  return Schema.decodeUnknown(ClaimSchema)(maybeClaims);
}
