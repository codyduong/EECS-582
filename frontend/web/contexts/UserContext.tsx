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
 *  - 2025-02-27 - @codyduong - improve pipeflow, use headers instead of body response
 *  - 2025-03-05 - @codyduong - add refetch using refresh tokens on expiry
 */

import {
  AccessClaim,
  decodeAccessClaimFromRequest,
  decodeAccessToken,
  decodeRefreshClaimFromRequest,
  decodeRefreshToken,
  Permission,
  TokenAndAccessClaim,
  TokenAndRefreshClaim,
} from "@/lib/jwt_utils";
import {
  HttpClient,
  HttpClientRequest,
  FetchHttpClient,
} from "@effect/platform";
import { HttpBodyError } from "@effect/platform/HttpBody";
import { HttpClientError } from "@effect/platform/HttpClientError";
import { Effect, Option } from "effect";
import { ParseError } from "effect/ParseResult";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ContextNotProvidedError } from "./utils";
import { deleteCookie, getCookie, setCookie } from "cookies-next/client";
import { AUTH_URL } from "@/lib/consts";

export type User = {
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

export function mapClaimToUser(claim: AccessClaim): User {
  const user: User = {
    id: claim.sub,
    username: claim.username,
    email: claim.email,
    permissions: claim.permissions,
  };
  return user;
}

export const UserContext = createContext<UserContextValue | null>(null);

const setAuthCookie = ([token]: TokenAndAccessClaim) => {
  setCookie("authorization", token, {});
};

const setRefreshCookie = ([token]: TokenAndRefreshClaim) => {
  setCookie("x-refresh-token", token, {});
};

const getNewTokens = (refreshToken: Option.Option<string>) => {
  return refreshToken.pipe(
    Effect.flatMap(decodeRefreshToken),
    Effect.flatMap((t) => {
      // check if token expired
      const claim = t[1];
      const now = new Date().getTime() / 1000;
      const expired = now > claim.exp; // todo use iss instead, allows for more dynamic expirations

      if (expired) {
        return Effect.fail(new ExpiredError());
      }

      return Effect.succeed(t[0]);
    }),
    // if not expired then get the new token
    Effect.flatMap((refreshToken) => {
      const req = Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return yield* HttpClientRequest.post(
          `${AUTH_URL}/api/v1/auth/refresh`,
        ).pipe(
          HttpClientRequest.bodyJson({}),
          Effect.map((r) => HttpClientRequest.bearerToken(r, refreshToken)),
          Effect.flatMap(client.execute),
          Effect.flatMap((res) => {
            return Effect.zip(
              decodeRefreshClaimFromRequest(res),
              decodeAccessClaimFromRequest(res),
            );
          }),
          Effect.scoped,
        );
      }).pipe(Effect.provide(FetchHttpClient.layer));
      return req;
    }),
  );
};

class ExpiredError {
  readonly _tag = "ExpiredError";
}

export default function UserProvider({
  claimServer,
  children,
}: {
  claimServer: AccessClaim | undefined;
  children: React.ReactNode;
}): React.JSX.Element {
  const [claim, setClaim] = useState<AccessClaim | null>(claimServer ?? null);

  useEffect(() => {
    const authToken = Option.fromNullable(getCookie("authorization"));

    const sideEffect = authToken.pipe(
      Effect.flatMap(decodeAccessToken),
      Effect.flatMap((token) => {
        // check if token expired
        const claim = token[1];
        const now = new Date().getTime() / 1000;
        const expired = now > claim.exp; // todo use iss instead, allows for more dynamic expirations

        // if expired, try using refreshToken and getting a new token
        if (expired) {
          console.log("Needed to get new tokens, expired!");
          const refreshToken = Option.fromNullable(
            getCookie("x-refresh-token"),
          );

          return getNewTokens(refreshToken).pipe(
            Effect.tap(([refresh, access]) => {
              setRefreshCookie(refresh);
              setAuthCookie(access);
            }),
            Effect.map(([_, ta]) => ta),
          );
        }

        // otherwise return the token
        return Effect.succeed(token);
      }),
      Effect.tap(setAuthCookie),
      Effect.map(([_token, claim]) => claim),
      Effect.tap(setClaim),
    );
    // todo, do we need to log error? maybe write unit tests to prove soundness
    Effect.runPromise(sideEffect).catch((e) => {
      // todo REMOVE logging in prod
      console.warn(`err: ${e}`);
    });
  }, []);

  const login = useCallback<UserContextValue["login"]>(
    (email, password) =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return yield* HttpClientRequest.post(
          `${AUTH_URL}/api/v1/auth/login`,
        ).pipe(
          HttpClientRequest.bodyJson({
            email,
            password,
          }),
          Effect.flatMap(client.execute),
          Effect.flatMap((res) => {
            return Effect.zip(
              decodeRefreshClaimFromRequest(res).pipe(
                Effect.tap(setRefreshCookie),
              ),
              decodeAccessClaimFromRequest(res).pipe(
                Effect.tap(setAuthCookie),
                Effect.map(([_token, claim]) => claim),
                Effect.tap(setClaim),
              ),
            );
          }),
          Effect.map(([_, claim]) => mapClaimToUser(claim)),
          Effect.scoped,
        );
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    [setClaim],
  );

  const register = useCallback<UserContextValue["register"]>(
    (email, password) =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return yield* HttpClientRequest.post(
          `${AUTH_URL}/api/v1/auth/register`,
        ).pipe(
          HttpClientRequest.bodyJson({
            email,
            password,
          }),
          Effect.flatMap(client.execute),
          Effect.flatMap((res) => {
            return Effect.zip(
              decodeRefreshClaimFromRequest(res).pipe(
                Effect.tap(setRefreshCookie),
              ),
              decodeAccessClaimFromRequest(res).pipe(
                Effect.tap(setAuthCookie),
                Effect.map(([_token, claim]) => claim),
                Effect.tap(setClaim),
              ),
            );
          }),
          Effect.map(([_, claim]) => mapClaimToUser(claim)),
          Effect.scoped,
        );
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    [setClaim],
  );

  const logout = useCallback(
    () =>
      Effect.gen(function* () {
        deleteCookie("authorization");
        setClaim(null);
      }),
    [],
  );

  // every minute check if our expiry is going to be invalid in the next 5 minutes
  useEffect(() => {
    const timeout = claim
      ? setInterval(async () => {
          // console.log("Checking token claim");
          await Effect.runPromise(
            Effect.gen(function* () {
              const now = Math.floor(Date.now() / 1000);
              // Refresh if the token expires within the next 5 minutes
              if (claim.exp - now < 300) {
                const refreshToken = Option.fromNullable(
                  getCookie("x-refresh-token"),
                );
                getNewTokens(refreshToken).pipe(
                  Effect.tap(([refresh, access]) => {
                    setRefreshCookie(refresh);
                    setAuthCookie(access);
                  }),
                  Effect.map(([_, access]) => access),
                  Effect.map(([_newToken, newClaim]) => setClaim(newClaim)),
                  Effect.tap(() =>
                    Effect.sync(() =>
                      console.log("Token refreshed successfully"),
                    ),
                  ),
                  Effect.catchAll((error) =>
                    Effect.sync(() =>
                      console.error("Token refresh failed:", error),
                    ),
                  ),
                );
              } else {
                // console.log("No need to get new claim");
              }
            }).pipe(Effect.provide(FetchHttpClient.layer)),
          );
        }, 30000)
      : null;
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [claim]);

  const userContextValue = {
    user: claim && mapClaimToUser(claim),
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
