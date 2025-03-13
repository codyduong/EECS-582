"use server";

import { decodeAccessToken } from "@/lib/jwt_utils";
import { Effect, Option } from "effect";
import { cookies } from "next/headers";

export const getClaimServer = async () => {
  const cookieStore = await cookies();
  const auth = Option.fromNullable(cookieStore.get("authorization")?.value);
  // console.log(auth);

  const user = await Effect.runPromise(
    auth.pipe(
      Effect.flatMap(decodeAccessToken),
      Effect.map(([_token, claim]) => claim),
    ),
  ).catch((e) => {
    console.warn(`er: ${e}`);
    return undefined;
  });

  return user;
};
