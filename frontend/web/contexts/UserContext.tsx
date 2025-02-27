"use client";

/*
 *  Common context used for authenticating and receiving authorization claims from
 *  JWT.
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-25
 *  Revision History:
 *  - 2025-02-25 - @codyduong - initial creation, improve authentication flow
 *  - 2025-02-26 - @codyduong - add registration endpoint to context handler
 */

import { getClaim, Permission } from "@/lib/jwt_utils";
import {
  HttpClient,
  HttpClientRequest,
  FetchHttpClient,
  HttpClientResponse,
} from "@effect/platform";
import { HttpBodyError } from "@effect/platform/HttpBody";
import { HttpClientError } from "@effect/platform/HttpClientError";
import { Effect, Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { createContext, useCallback, useContext, useState } from "react";
import { ContextNotProvidedError } from "./utils";

const AuthResponseSchema = Schema.Struct({
  token: Schema.String,
});

type User = {
  readonly id: number;
  readonly username: string | null;
  readonly email: string;
  readonly permissions: ReadonlyArray<Permission>;
};

type UserContextValue = {
  user?: User | null;
  login: (
    email: string,
    password: string,
  ) => Effect.Effect<User, HttpBodyError | HttpClientError | ParseError>;
  register: (
    email: string,
    password: string,
  ) => Effect.Effect<User, HttpBodyError | HttpClientError | ParseError>;
  logout: () => Effect.Effect<void, void, never>;
};

export const UserContext = createContext<UserContextValue | null>(null);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback<UserContextValue["login"]>(
    (email, password) =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return yield* HttpClientRequest.post(
          // todo @codyduong, don't hardcode this LOL!
          "http://localhost:8081/api/v1/auth/login",
        ).pipe(
          HttpClientRequest.bodyJson({
            email,
            password,
          }),
          Effect.flatMap(client.execute),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthResponseSchema)),
          Effect.flatMap(({ token }) => getClaim(token)),
          Effect.flatMap((claim) => {
            const user: User = {
              id: claim.sub,
              username: claim.username,
              email: claim.email,
              permissions: claim.permissions,
            };
            setUser(user);
            return Effect.succeed(user);
          }),
          Effect.scoped,
        );
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    [],
  );

  const register = useCallback<UserContextValue["register"]>(
    (email, password) =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return yield* HttpClientRequest.post(
          // todo @codyduong, don't hardcode this LOL!
          "http://localhost:8081/api/v1/auth/register",
        ).pipe(
          HttpClientRequest.bodyJson({
            email,
            password,
          }),
          Effect.flatMap(client.execute),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthResponseSchema)),
          Effect.flatMap(({ token }) => getClaim(token)),
          Effect.flatMap((claim) => {
            const user: User = {
              id: claim.sub,
              username: claim.username,
              email: claim.email,
              permissions: claim.permissions,
            };
            setUser(user);
            return Effect.succeed(user);
          }),
          Effect.scoped,
        );
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    [],
  );

  const logout = useCallback(
    () =>
      Effect.gen(function* () {
        setUser(null);
      }),
    [],
  );

  const userContextValue = {
    user,
    register,
    login,
    logout,
  } satisfies UserContextValue;

  return <UserContext value={userContextValue}>{children}</UserContext>;
}

/**
 * @throws {ContextNotProvidedError}
 */
export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);

  if (!context) throw new ContextNotProvidedError(UserContext);

  return context;
};
